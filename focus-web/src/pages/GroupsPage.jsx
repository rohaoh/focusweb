// src/pages/GroupsPage.jsx
// Swift의 GroupsView와 동일한 역할
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useGroups, useGroupTasks } from '../hooks/useGroups'
import styles from './GroupsPage.module.css'

export default function GroupsPage() {
  const { user, profile } = useAuth()
  const { groups, isLoading, createGroup, joinGroup, leaveGroup } = useGroups(user?.uid)

  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [actionError, setActionError] = useState('')

  const selectedGroup = groups.find(g => g.id === selectedGroupId)

  async function handleCreate(e) {
    e.preventDefault()
    if (!groupName.trim()) return
    setActionError('')
    try {
      const id = await createGroup(groupName.trim())
      setGroupName('')
      setShowCreate(false)
      setSelectedGroupId(id)
    } catch(e) { setActionError(e.message) }
  }

  async function handleJoin(e) {
    e.preventDefault()
    setActionError('')
    try {
      const id = await joinGroup(inviteCode.trim())
      setInviteCode('')
      setShowJoin(false)
      setSelectedGroupId(id)
    } catch(e) { setActionError(e.message) }
  }

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" /></div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>그룹</h1>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { setShowJoin(true); setShowCreate(false) }}>+ 참가</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowCreate(true); setShowJoin(false) }}>+ 만들기</button>
        </div>
      </div>

      {/* 그룹 만들기 폼 */}
      {showCreate && (
        <form className={`card fade-in ${styles.form}`} onSubmit={handleCreate}>
          <h3 className={styles.formTitle}>새 그룹 만들기</h3>
          <input className="input" placeholder="그룹 이름" value={groupName} onChange={e => setGroupName(e.target.value)} autoFocus required />
          {actionError && <p className={styles.error}>{actionError}</p>}
          <div style={{ display:'flex', gap:8 }}>
            <button type="submit" className="btn btn-primary btn-sm">만들기</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>취소</button>
          </div>
        </form>
      )}

      {/* 그룹 참가 폼 */}
      {showJoin && (
        <form className={`card fade-in ${styles.form}`} onSubmit={handleJoin}>
          <h3 className={styles.formTitle}>초대 코드로 참가</h3>
          <input className="input" placeholder="초대 코드 (예: AB1234)" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} autoFocus required maxLength={6} />
          {actionError && <p className={styles.error}>{actionError}</p>}
          <div style={{ display:'flex', gap:8 }}>
            <button type="submit" className="btn btn-primary btn-sm">참가</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowJoin(false)}>취소</button>
          </div>
        </form>
      )}

      {groups.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize:'2.5rem' }}>👥</span>
          <p>아직 참여한 그룹이 없어요</p>
          <p style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>그룹을 만들거나 초대 코드로 참가해보세요</p>
        </div>
      ) : (
        <div className={styles.layout}>
          {/* 그룹 목록 */}
          <div className={styles.groupList}>
            {groups.map(group => (
              <button
                key={group.id}
                className={`${styles.groupItem} ${selectedGroupId === group.id ? styles.active : ''}`}
                onClick={() => setSelectedGroupId(group.id)}
              >
                <div className={styles.groupAvatar}>{group.name[0]}</div>
                <div className={styles.groupInfo}>
                  <span className={styles.groupName}>{group.name}</span>
                  <span className={styles.groupMeta}>{group.memberIds?.length || 1}명</span>
                </div>
                {group.ownerUserId === user?.uid && (
                  <span className="badge badge-accent" style={{ fontSize:'0.65rem' }}>관리자</span>
                )}
              </button>
            ))}
          </div>

          {/* 그룹 상세 */}
          {selectedGroup && (
            <GroupDetail
              group={selectedGroup}
              userId={user?.uid}
              displayName={profile?.displayName || '사용자'}
              onLeave={async () => {
                await leaveGroup(selectedGroup.id)
                setSelectedGroupId(null)
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ── 그룹 상세 컴포넌트 ──
function GroupDetail({ group, userId, displayName, onLeave }) {
  const { tasks, addTask, completeTask } = useGroupTasks(group.id)
  const [showAddTask, setShowAddTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const isOwner = group.ownerUserId === userId

  async function handleAddTask(e) {
    e.preventDefault()
    if (!taskTitle.trim()) return
    await addTask(userId, { title: taskTitle.trim() })
    setTaskTitle('')
    setShowAddTask(false)
  }

  return (
    <div className={`${styles.groupDetail} card`}>
      <div className={styles.detailHeader}>
        <div>
          <h2 className={styles.detailTitle}>{group.name}</h2>
          <p className={styles.detailMeta}>초대 코드: <code className={styles.inviteCode}>{group.inviteCode}</code></p>
        </div>
        {!isOwner && (
          <button className="btn btn-danger btn-sm" onClick={onLeave}>탈퇴</button>
        )}
      </div>

      {/* 그룹 할 일 */}
      <div className={styles.taskSection}>
        <div className={styles.taskHeader}>
          <h3 className={styles.taskSectionTitle}>그룹 할 일</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowAddTask(v => !v)}>+ 추가</button>
        </div>

        {showAddTask && (
          <form className={styles.addTaskForm} onSubmit={handleAddTask}>
            <input className="input" placeholder="할 일 제목" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} autoFocus required />
            <div style={{ display:'flex', gap:8 }}>
              <button type="submit" className="btn btn-primary btn-sm">추가</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddTask(false)}>취소</button>
            </div>
          </form>
        )}

        {tasks.length === 0 ? (
          <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', padding:'16px 0' }}>아직 그룹 할 일이 없어요</p>
        ) : (
          <div className={styles.taskList}>
            {tasks.map(task => {
              const isDone = task.completionUserIds?.includes(userId)
              return (
                <div key={task.id} className={`${styles.taskItem} ${isDone ? styles.taskDone : ''}`}>
                  <button
                    className={`${styles.taskCheck} ${isDone ? styles.taskChecked : ''}`}
                    onClick={() => !isDone && completeTask(task.id, userId)}
                  >
                    {isDone && '✓'}
                  </button>
                  <div className={styles.taskBody}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.taskProgress}>
                      {task.completionUserIds?.length || 0}/{group.memberIds?.length || 1} 완료
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
