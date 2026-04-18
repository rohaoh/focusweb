// src/components/layout/AppLayout.jsx
// 앱 내부의 사이드바 + 상단바 레이아웃
// Swift의 MainTabView와 동일한 역할
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './AppLayout.module.css'

const NAV_ITEMS = [
  { to: '/app/todos',  icon: '✅', label: '할 일' },
  { to: '/app/focus',  icon: '⏱️', label: '집중' },
  { to: '/app/groups', icon: '👥', label: '그룹' },
  { to: '/app/stats',  icon: '📊', label: '통계' },
]

export default function AppLayout() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className={styles.layout}>
      {/* 사이드바 (데스크톱) */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <span className={styles.logo}>Focus</span>
          <nav className={styles.nav}>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className={styles.sidebarBottom}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {profile?.photoURL
                ? <img src={profile.photoURL} alt="프로필" />
                : <span>{(profile?.displayName || user?.email || '?')[0].toUpperCase()}</span>
              }
            </div>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{profile?.displayName || '사용자'}</span>
              <span className={styles.userEmail}>{user?.email || ''}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width: '100%' }}>
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className={styles.main}>
        {/* 상단바 (모바일용) */}
        <header className={styles.mobileHeader}>
          <span className={styles.logo}>Focus</span>
          <nav className={styles.mobileNav}>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `${styles.mobileNavItem} ${isActive ? styles.active : ''}`}
              >
                <span>{item.icon}</span>
                <span className={styles.mobileNavLabel}>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </header>

        <div className={styles.content}>
          {/* Outlet = 현재 라우트에 해당하는 페이지 컴포넌트가 렌더링됨 */}
          <Outlet />
        </div>
      </main>
    </div>
  )
}
