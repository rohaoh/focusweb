// src/pages/LandingPage.jsx
// 소개 페이지 + 앱 다운로드 유도
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './LandingPage.module.css'

const features = [
  {
    icon: '✅',
    title: '할 일 관리',
    desc: '날짜별로 할 일을 정리하고, 반복 설정과 서브 태스크까지. 하루를 깔끔하게 계획하세요.',
  },
  {
    icon: '⏱️',
    title: '집중 타이머',
    desc: '할 일과 연결된 집중 모드로 몰입하세요. 집중 시간이 자동으로 기록돼요.',
  },
  {
    icon: '👥',
    title: '그룹 협업',
    desc: '팀과 함께 할 일을 관리하고 서로의 진행 상황을 확인하세요. 채팅도 함께!',
  },
  {
    icon: '📊',
    title: '통계 분석',
    desc: '완료율, 집중 시간, 연속 달성 기록을 한눈에. 나의 생산성 흐름을 파악하세요.',
  },
]

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className={styles.page}>
      {/* 네비게이션 */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.logo}>Focus</span>
          <div className={styles.navLinks}>
            {user ? (
              <Link to="/app/todos" className="btn btn-primary btn-sm">앱으로 이동 →</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">로그인</Link>
                <Link to="/login" className="btn btn-primary btn-sm">시작하기</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={`${styles.badge} badge badge-accent`}>✦ 집중과 생산성의 새로운 기준</div>
          <h1 className={styles.heroTitle}>
            몰입을 방해하는<br />
            모든 것을 없애다
          </h1>
          <p className={styles.heroDesc}>
            할 일 관리, 집중 타이머, 그룹 협업까지.<br />
            Focus 하나로 생산성의 모든 흐름을 잡으세요.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/login" className="btn btn-primary btn-lg">무료로 시작하기</Link>
            <a href="#download" className="btn btn-ghost btn-lg">앱 다운로드</a>
          </div>
        </div>

        {/* 앱 미리보기 (Mock UI) */}
        <div className={styles.appPreview}>
          <div className={styles.mockPhone}>
            <div className={styles.mockScreen}>
              <div className={styles.mockHeader}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>오늘</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600 }}>4월 18일 토요일</span>
              </div>
              {['디자인 시스템 정리', '코드 리뷰', '운동 30분'].map((t, i) => (
                <div key={i} className={styles.mockTodo}>
                  <div className={`${styles.mockCheck} ${i === 0 ? styles.checked : ''}`}>
                    {i === 0 && '✓'}
                  </div>
                  <span style={{ color: i === 0 ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: i === 0 ? 'line-through' : 'none', fontSize: '0.82rem' }}>{t}</span>
                  {i === 1 && <span className={styles.mockTimer}>⏱ 25:00</span>}
                </div>
              ))}
              <div className={styles.mockFocusBar}>
                <span>오늘 집중</span>
                <span style={{ color: 'var(--accent)' }}>1h 42m</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>생산성의 모든 것</h2>
        <p className={styles.sectionDesc}>Focus는 단순한 할 일 앱이 아니에요. 집중부터 협업까지 하나의 흐름으로.</p>
        <div className={styles.featureGrid}>
          {features.map((f) => (
            <div key={f.title} className={`${styles.featureCard} card`}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 다운로드 섹션 */}
      <section id="download" className={styles.download}>
        <div className={styles.downloadCard}>
          <h2 className={styles.downloadTitle}>앱으로 더 강력하게</h2>
          <p className={styles.downloadDesc}>
            Live Activity, Apple Watch 연동, 오프라인 지원까지.<br />
            iOS 앱에서 Focus의 모든 기능을 경험하세요.
          </p>
          <div className={styles.downloadBtns}>
            <a href="https://apps.apple.com" target="_blank" rel="noreferrer" className={`btn btn-primary btn-lg ${styles.appStoreBtn}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              App Store
            </a>
            <Link to="/login" className="btn btn-ghost btn-lg">웹에서 사용하기</Link>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className={styles.footer}>
        <span className={styles.logo}>Focus</span>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>© 2026 Focus. All rights reserved.</p>
      </footer>
    </div>
  )
}
