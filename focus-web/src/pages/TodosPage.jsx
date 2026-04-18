// src/pages/TodosPage.jsx
// Swift의 TodoHomeView와 동일한 역할
// 날짜별 할 일 목록 + 추가/완료/삭제
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTodos, formatDate } from '../hooks/useTodos'
import styles from './TodosPage.module.css'

// 날짜 이동 헬퍼
function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function koreanDayLabel(date) {
  const today = formatDate(new Date())
  const target = formatDate(date)
  if (target === today) return '오늘'
  const tomorrow = formatDate(addDays(new Date(), 1))
  if (target === tomorrow) return '내일'
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return days[date.getDay()] + '요일'
}

export default function TodosPage() {
  const { user } = useAuth()
  const { todos, isLoading, addTodo, toggleComplete, deleteTodo } = useTodos(user?.uid)
  const navigate = useNavigate()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newUseTimer, setNewUseTimer] = useState(false)
  const [newTime, setNewTime] = useState('')

  const dateKey = formatDate(selectedDate)

  // 선택한 날짜에 해당하는 할 일만 필터
  // Swift의 todo.occurs(on: targetDate) 와 동일한 로직
  const todayTodos = todos.filter(todo => {
    if (todo.date === dateKey) return true
    // 반복 할 일 처리 (repeatDays가 있는 경우)
    if (!todo.repeatDays) return false
    const weekdays = todo.repeatDays.split(',').map(Number).filter(n => n >= 1 && n <= 7)
    if (weekdays.length === 0) return false
    const weekday = selectedDate.getDay() === 0 ? 1 : selectedDate.getDay() + 1 // 1=일 ~ 7=토
    return weekdays.includes(weekday)
  })

  const completed = todayTodos.filter(t => t.isCompleted)
  const pending = todayTodos.filter(t => !t.isCompleted)

  async function handleAdd(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    await addTodo({
      title: newTitle.trim(),
      notes: newNotes.trim(),
      date: dateKey,
      time: newTime,
      useTimer: newUseTimer,
    })
    setNewTitle('')
    setNewNotes('')
    setNewUseTimer(false)
    setNewTime('')
    setShowAddForm(false)
  }

  // 날짜 선택 바 (오늘 기준 -3 ~ +4일)
  const dateRange = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 3))

  if (isLoading) {
    return <div className={styles.loading}><div className="spinner" /></div>
  }

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>할 일</h1>
          <p className={styles.subtitle}>
            {selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} · {koreanDayLabel(selectedDate)}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>+ 추가</button>
      </div>

      {/* 날짜 선택 바 */}
      <div className={styles.datePicker}>
        {dateRange.map(date => {
          const key = formatDate(date)
          const isSelected = key === dateKey
          const isToday = key === formatDate(new Date())
          const dayTodos = todos.filter(t => t.date === key)
          const hasTodo = dayTodos.length > 0
          return (
            <button
              key={key}
              className={`${styles.dateBtn} ${isSelected ? styles.dateSelected : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <span className={styles.dateDayName}>
                {['일','월','화','수','목','금','토'][date.getDay()]}
              </span>
              <span className={`${styles.dateNum} ${isToday ? styles.today : ''}`}>
                {date.getDate()}
              </span>
              {hasTodo && <span className={styles.dateDot} />}
            </button>
          )
        })}
      </div>

      {/* 할 일 추가 폼 */}
      {showAddForm && (
        <div className={`${styles.addForm} card fade-in`}>
          <form onSubmit={handleAdd}>
            <div className={styles.addFormHeader}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>새 할 일</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>취소</button>
            </div>
            <input
              className="input"
              placeholder="할 일 제목"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              autoFocus
              required
            />
            <textarea
              className={`input ${styles.notesInput}`}
              placeholder="메모 (선택)"
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              rows={2}
            />
            <div className={styles.addFormOptions}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  className={styles.toggle}
                  checked={newUseTimer}
                  onChange={e => setNewUseTimer(e.target.checked)}
                />
                <span>집중 타이머</span>
              </label>
              <div className={styles.timeField}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>시간</label>
                <input
                  type="time"
                  className="input"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  style={{ width: 130 }}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={!newTitle.trim()}>
              추가하기
            </button>
          </form>
        </div>
      )}

      {/* 할 일 목록 */}
      {todayTodos.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: '2.5rem' }}>🌿</span>
          <p>이 날엔 할 일이 없어요</p>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(true)}>+ 할 일 추가</button>
        </div>
      ) : (
        <div className={styles.list}>
          {/* 미완료 */}
          {pending.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              dateKey={dateKey}
              onToggle={() => toggleComplete(todo.id, todo.isCompleted, dateKey)}
              onDelete={() => deleteTodo(todo.id)}
              onFocus={() => navigate(`/app/focus/${todo.id}`, { state: { todo } })}
            />
          ))}

          {/* 완료된 항목 구분선 */}
          {completed.length > 0 && pending.length > 0 && (
            <div className={styles.divider}>완료됨 {completed.length}</div>
          )}

          {/* 완료 */}
          {completed.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              dateKey={dateKey}
              onToggle={() => toggleComplete(todo.id, todo.isCompleted, dateKey)}
              onDelete={() => deleteTodo(todo.id)}
              onFocus={() => navigate(`/app/focus/${todo.id}`, { state: { todo } })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── 할 일 카드 컴포넌트 ──
function TodoCard({ todo, onToggle, onDelete, onFocus }) {
  const [expanded, setExpanded] = useState(false)
  const focusMin = Math.floor((todo.focusTime || 0) / 60)

  return (
    <div className={`${styles.todoCard} ${todo.isCompleted ? styles.completed : ''}`}>
      <div className={styles.todoMain}>
        {/* 완료 체크 */}
        <button className={`${styles.checkBtn} ${todo.isCompleted ? styles.checked : ''}`} onClick={onToggle}>
          {todo.isCompleted && '✓'}
        </button>

        {/* 제목 + 메타 */}
        <div className={styles.todoBody} onClick={() => setExpanded(v => !v)}>
          <span className={styles.todoTitle}>{todo.title}</span>
          <div className={styles.todoMeta}>
            {todo.time && <span className={styles.metaChip}>🕐 {todo.time}</span>}
            {todo.useTimer && <span className={styles.metaChip}>⏱ 타이머</span>}
            {focusMin > 0 && <span className={`${styles.metaChip} ${styles.focusChip}`}>🔥 {focusMin}분</span>}
            {todo.repeatDays && <span className={styles.metaChip}>🔁 반복</span>}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className={styles.todoActions}>
          {todo.useTimer && !todo.isCompleted && (
            <button className={`btn btn-ghost btn-sm ${styles.focusBtn}`} onClick={onFocus} title="집중 시작">
              ▶
            </button>
          )}
          <button className={`btn btn-ghost btn-sm ${styles.deleteBtn}`} onClick={onDelete} title="삭제">
            ✕
          </button>
        </div>
      </div>

      {/* 메모 펼치기 */}
      {expanded && todo.notes && (
        <div className={styles.todoNotes}>{todo.notes}</div>
      )}
    </div>
  )
}
