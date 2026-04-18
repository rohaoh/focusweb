// src/pages/FocusPage.jsx
// Swift의 FocusTimerView와 동일한 역할
// 집중 타이머: 시작/일시정지/종료 + 집중 시간 Firestore에 저장
import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTodos, formatClock, formatDate } from '../hooks/useTodos'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import styles from './FocusPage.module.css'

export default function FocusPage() {
  const { user } = useAuth()
  const { todos, updateFocusTime } = useTodos(user?.uid)
  const navigate = useNavigate()
  const location = useLocation()
  const { todoId } = useParams()

  // location.state로 넘어온 todo 또는 todoId로 찾기
  const todo = location.state?.todo || todos.find(t => t.id === todoId) || null

  const [selectedTodoId, setSelectedTodoId] = useState(todo?.id || '')
  const [elapsed, setElapsed] = useState(0)      // 현재 세션 초
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const accumulatedRef = useRef(0)

  const activeTodo = todos.find(t => t.id === selectedTodoId) || todo

  // 타이머 틱 (Swift의 Timer.publish와 동일)
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - accumulatedRef.current * 1000
      intervalRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsed(secs)
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
      accumulatedRef.current = elapsed
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  // 페이지 벗어날 때 자동 저장
  useEffect(() => {
    return () => {
      if (elapsed > 0 && activeTodo) {
        saveFocusLog(elapsed)
      }
    }
  }, [elapsed, activeTodo])

  function handleStartPause() {
    setIsRunning(v => !v)
  }

  async function handleStop() {
    setIsRunning(false)
    clearInterval(intervalRef.current)
    if (elapsed > 0 && activeTodo) {
      await saveFocusLog(elapsed)
    }
    navigate('/app/todos')
  }

  async function saveFocusLog(seconds) {
    if (!user?.uid || !activeTodo || seconds < 5) return
    const dateKey = formatDate(new Date())
    // Firestore에 집중 로그 저장 (앱의 FocusLog 모델과 동일 구조)
    await addDoc(collection(db, 'users', user.uid, 'focusLogs'), {
      userId: user.uid,
      todoId: activeTodo.id,
      date: dateKey,
      seconds,
      createdAt: serverTimestamp(),
    })
    // 할 일의 총 집중 시간 업데이트
    await updateFocusTime(activeTodo.id, seconds)
    accumulatedRef.current = 0
    setElapsed(0)
  }

  // 원형 프로그레스 계산 (25분 기준)
  const GOAL = 25 * 60
  const progress = Math.min(elapsed / GOAL, 1)
  const circumference = 2 * Math.PI * 110
  const strokeDashoffset = circumference * (1 - progress)

  // 타이머 없는 할 일만 필요하면 모든 할 일 보여줌
  const timerTodos = todos.filter(t => !t.isDeleted)

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* 제목 */}
        <div className={styles.header}>
          <h1 className={styles.title}>집중</h1>
          {activeTodo && (
            <p className={styles.taskName}>{activeTodo.title}</p>
          )}
        </div>

        {/* 할 일 선택 (타이머 시작 전만) */}
        {!isRunning && elapsed === 0 && (
          <div className={styles.selector}>
            <label className={styles.selectorLabel}>집중할 할 일 선택</label>
            <select
              className="input"
              value={selectedTodoId}
              onChange={e => setSelectedTodoId(e.target.value)}
            >
              <option value="">— 자유 집중 —</option>
              {timerTodos.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* 원형 타이머 */}
        <div className={styles.timerWrap}>
          <svg className={styles.timerSvg} viewBox="0 0 240 240">
            {/* 배경 원 */}
            <circle cx="120" cy="120" r="110" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" />
            {/* 진행 원 */}
            <circle
              cx="120" cy="120" r="110"
              fill="none"
              stroke="url(#focusGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 120 120)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <defs>
              <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#578bff" />
                <stop offset="100%" stopColor="#4dd9c8" />
              </linearGradient>
            </defs>
          </svg>
          <div className={styles.timerText}>
            <span className={styles.clockStr}>{formatClock(elapsed)}</span>
            <span className={styles.clockSub}>
              {isRunning ? '집중 중...' : elapsed > 0 ? '일시정지' : '준비'}
            </span>
          </div>
        </div>

        {/* 오늘 집중 통계 */}
        {activeTodo && (
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>이 할 일</span>
              <span className={styles.statValue}>{formatClock((activeTodo.focusTime || 0) + elapsed)}</span>
            </div>
          </div>
        )}

        {/* 컨트롤 버튼 */}
        <div className={styles.controls}>
          <button
            className={`${styles.mainBtn} ${isRunning ? styles.pauseBtn : styles.startBtn}`}
            onClick={handleStartPause}
          >
            {isRunning ? '⏸ 일시정지' : elapsed > 0 ? '▶ 재개' : '▶ 시작'}
          </button>
          {elapsed > 0 && (
            <button className="btn btn-danger" onClick={handleStop}>
              ⏹ 종료 및 저장
            </button>
          )}
          {elapsed === 0 && (
            <button className="btn btn-ghost" onClick={() => navigate('/app/todos')}>
              ← 돌아가기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
