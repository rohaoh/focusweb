// src/pages/StatsPage.jsx
// Swift의 StatsView와 동일한 역할
// 완료율, 집중 시간, 연속 달성 통계
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTodos, formatDate } from '../hooks/useTodos'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import styles from './StatsPage.module.css'

// 최근 N일 날짜 배열 생성
function getRecentDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d
  })
}

// 초 → "Xh Ym" 형식
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}초`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function StatsPage() {
  const { user } = useAuth()
  const { todos } = useTodos(user?.uid)
  const [focusLogs, setFocusLogs] = useState([])
  const [period, setPeriod] = useState(7) // 7일 or 30일

  // focusLogs Firestore에서 가져오기
  useEffect(() => {
    if (!user?.uid) return
    getDocs(collection(db, 'users', user.uid, 'focusLogs')).then(snap => {
      setFocusLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [user?.uid])

  const days = getRecentDays(period)

  // 날짜별 완료 할 일 수 계산
  const completionByDay = days.map(date => {
    const key = formatDate(date)
    const dayTodos = todos.filter(t => t.date === key || (t.repeatDays && occursOn(t, date)))
    const completed = dayTodos.filter(t => t.isCompleted || t.completedDates?.includes(key)).length
    return { date, key, total: dayTodos.length, completed }
  })

  // 날짜별 집중 시간 계산
  const focusByDay = days.map(date => {
    const key = formatDate(date)
    const seconds = focusLogs.filter(l => l.date === key).reduce((s, l) => s + (l.seconds || 0), 0)
    return { date, key, seconds }
  })

  // 요약 통계
  const totalCompleted = completionByDay.reduce((s, d) => s + d.completed, 0)
  const totalFocusSec = focusByDay.reduce((s, d) => s + d.seconds, 0)
  const bestStreak = calcBestStreak(completionByDay)
  const maxFocus = Math.max(...focusByDay.map(d => d.seconds), 1)
  const maxCompleted = Math.max(...completionByDay.map(d => d.completed), 1)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>통계</h1>
        <div className={styles.periodTabs}>
          {[7, 30].map(p => (
            <button
              key={p}
              className={`${styles.periodTab} ${period === p ? styles.active : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}일
            </button>
          ))}
        </div>
      </div>

      {/* 요약 카드 */}
      <div className={styles.summaryGrid}>
        <SummaryCard icon="✅" label="완료한 할 일" value={totalCompleted} unit="개" color="accent" />
        <SummaryCard icon="⏱️" label="총 집중 시간" value={formatDuration(totalFocusSec)} unit="" color="teal" />
        <SummaryCard icon="🔥" label="최고 연속" value={bestStreak} unit="일" color="orange" />
      </div>

      {/* 완료 차트 */}
      <div className="card">
        <h2 className={styles.chartTitle}>일별 완료 할 일</h2>
        <div className={styles.barChart}>
          {completionByDay.map(({ date, key, completed }) => (
            <div key={key} className={styles.barCol}>
              <div className={styles.barWrap}>
                <div
                  className={`${styles.bar} ${styles.barBlue}`}
                  style={{ height: `${Math.round((completed / maxCompleted) * 100)}%` }}
                  title={`${completed}개`}
                />
              </div>
              <span className={styles.barLabel}>{date.getDate()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 집중 차트 */}
      <div className="card">
        <h2 className={styles.chartTitle}>일별 집중 시간</h2>
        <div className={styles.barChart}>
          {focusByDay.map(({ date, key, seconds }) => (
            <div key={key} className={styles.barCol}>
              <div className={styles.barWrap}>
                <div
                  className={`${styles.bar} ${styles.barTeal}`}
                  style={{ height: `${Math.round((seconds / maxFocus) * 100)}%` }}
                  title={formatDuration(seconds)}
                />
              </div>
              <span className={styles.barLabel}>{date.getDate()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 요약 카드 ──
function SummaryCard({ icon, label, value, unit, color }) {
  return (
    <div className={`${styles.summaryCard} card`}>
      <span className={styles.summaryIcon}>{icon}</span>
      <div className={styles.summaryValue}>
        {value}<span className={styles.summaryUnit}>{unit}</span>
      </div>
      <div className={styles.summaryLabel}>{label}</div>
    </div>
  )
}

// 연속 달성 계산 (Swift의 longestStreak와 동일)
function calcBestStreak(stats) {
  let best = 0, cur = 0
  for (const s of stats) {
    if (s.completed > 0) { cur++; best = Math.max(best, cur) }
    else cur = 0
  }
  return best
}

// 반복 할 일 날짜 체크
function occursOn(todo, date) {
  if (!todo.repeatDays) return false
  const weekdays = todo.repeatDays.split(',').map(Number)
  const wd = date.getDay() === 0 ? 1 : date.getDay() + 1
  return weekdays.includes(wd)
}
