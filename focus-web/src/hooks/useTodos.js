// src/hooks/useTodos.js
// Swift의 FirestoreSyncManager + SwiftData 역할을 대신함
// Firestore에서 할 일 목록을 실시간으로 가져오고 수정하는 커스텀 훅
import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, orderBy,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useTodos(userId) {
  const [todos, setTodos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setTodos([])
      setIsLoading(false)
      return
    }

    // Firestore 실시간 구독 (Swift의 listener와 동일)
    // users/{uid}/todos 컬렉션 구조 - 앱과 동일한 경로
    const q = query(
      collection(db, 'users', userId, 'todos'),
      where('isDeleted', '==', false),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setTodos(data)
      setIsLoading(false)
    })

    return unsubscribe
  }, [userId])

  // 할 일 추가
  async function addTodo({ title, notes = '', date, time = '', useTimer = false, repeatDays = '', subtasks = [] }) {
    if (!userId) return
    await addDoc(collection(db, 'users', userId, 'todos'), {
      userId,
      title,
      notes,
      date,        // "yyyy-MM-dd" 형식
      time,        // "HH:mm" 또는 ""
      useTimer,
      repeatDays,  // "1,3,5" 형식
      repeatUntilDate: '',
      repeatId: 0,
      reminderType: 'none',
      reminderOffsetMinutes: 0,
      subtasksData: JSON.stringify(subtasks),
      subtaskCompletionData: '',
      targetCompletionCount: 1,
      isCompleted: false,
      completedDates: '',
      completionCountsData: '',
      focusTime: 0,
      isDeleted: false,
      updatedAt: serverTimestamp(),
      pendingSync: false,
    })
  }

  // 할 일 완료 토글
  async function toggleComplete(todoId, currentValue, dateKey) {
    if (!userId) return
    const ref = doc(db, 'users', userId, 'todos', todoId)
    const todayKey = dateKey || formatDate(new Date())
    await updateDoc(ref, {
      isCompleted: !currentValue,
      completedDates: !currentValue ? todayKey : '',
      updatedAt: serverTimestamp(),
    })
  }

  // 할 일 삭제 (소프트 삭제 - 앱과 동일)
  async function deleteTodo(todoId) {
    if (!userId) return
    const ref = doc(db, 'users', userId, 'todos', todoId)
    await updateDoc(ref, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
    })
  }

  // 집중 시간 업데이트
  async function updateFocusTime(todoId, additionalSeconds) {
    if (!userId) return
    const todo = todos.find(t => t.id === todoId)
    if (!todo) return
    const ref = doc(db, 'users', userId, 'todos', todoId)
    await updateDoc(ref, {
      focusTime: (todo.focusTime || 0) + additionalSeconds,
      updatedAt: serverTimestamp(),
    })
  }

  // 할 일 수정
  async function updateTodo(todoId, changes) {
    if (!userId) return
    const ref = doc(db, 'users', userId, 'todos', todoId)
    await updateDoc(ref, { ...changes, updatedAt: serverTimestamp() })
  }

  return { todos, isLoading, addTodo, toggleComplete, deleteTodo, updateFocusTime, updateTodo }
}

// 날짜를 "yyyy-MM-dd" 형식으로 변환 (Swift의 DateUtil.dateFormatter와 동일)
export function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 초를 "00:00:00" 형식으로 변환 (Swift의 clockString과 동일)
export function formatClock(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
