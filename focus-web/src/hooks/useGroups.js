// src/hooks/useGroups.js
// Swift의 GroupManager 역할
import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc,
  serverTimestamp, getDoc, getDocs, arrayUnion, arrayRemove, deleteDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useGroups(userId) {
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setGroups([]); setIsLoading(false); return }

    // 내가 멤버인 그룹 실시간 구독
    const q = query(
      collection(db, 'groups'),
      where('memberIds', 'array-contains', userId)
    )
    const unsubscribe = onSnapshot(q, (snap) => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setIsLoading(false)
    })
    return unsubscribe
  }, [userId])

  // 그룹 생성
  async function createGroup(name) {
    if (!userId) return
    const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase()
    const ref = await addDoc(collection(db, 'groups'), {
      name,
      ownerUserId: userId,
      inviteCode,
      memberIds: [userId],
      bannedUserIds: [],
      isChatEnabled: true,
      autoTranslateTasks: false,
      allowedAppTokens: [],
      participatesInGlobalCompetition: false,
      isInternalCompetitionEnabled: false,
      createdAt: serverTimestamp(),
    })
    // 멤버 레코드 추가
    await addDoc(collection(db, 'groups', ref.id, 'members'), {
      userId,
      role: 'owner',
      todoPermission: 'freeCreate',
      joinedAt: serverTimestamp(),
    })
    return ref.id
  }

  // 초대코드로 그룹 참가
  async function joinGroup(inviteCode) {
    const q = query(collection(db, 'groups'), where('inviteCode', '==', inviteCode.toUpperCase()))
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('초대 코드를 찾을 수 없어요.')
    const groupDoc = snap.docs[0]
    const groupData = groupDoc.data()
    if (groupData.bannedUserIds?.includes(userId)) throw new Error('참가가 제한된 그룹이에요.')
    if (groupData.memberIds?.includes(userId)) throw new Error('이미 참가한 그룹이에요.')

    await updateDoc(doc(db, 'groups', groupDoc.id), {
      memberIds: arrayUnion(userId),
    })
    await addDoc(collection(db, 'groups', groupDoc.id, 'members'), {
      userId,
      role: 'member',
      todoPermission: 'cannotCreate',
      joinedAt: serverTimestamp(),
    })
    return groupDoc.id
  }

  // 그룹 탈퇴
  async function leaveGroup(groupId) {
    await updateDoc(doc(db, 'groups', groupId), {
      memberIds: arrayRemove(userId),
    })
  }

  return { groups, isLoading, createGroup, joinGroup, leaveGroup }
}

// 그룹 할 일 훅
export function useGroupTasks(groupId) {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (!groupId) return
    const q = query(collection(db, 'groups', groupId, 'tasks'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [groupId])

  async function addTask(userId, { title, notes = '', assignmentType = 'allMembers', targetUserIds = [], completionRule = 'individualCompletion', deadline = null, allowPoke = false }) {
    await addDoc(collection(db, 'groups', groupId, 'tasks'), {
      title, notes, createdByUserId: userId,
      assignmentType, targetUserIds, completionRule,
      deadline, deadlineReminderMinutes: 20, allowPoke,
      completionUserIds: [],
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    })
  }

  async function completeTask(taskId, userId) {
    const ref = doc(db, 'groups', groupId, 'tasks', taskId)
    await updateDoc(ref, {
      completionUserIds: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    })
  }

  return { tasks, addTask, completeTask }
}

// 필요한 import 추가
import { orderBy } from 'firebase/firestore'
