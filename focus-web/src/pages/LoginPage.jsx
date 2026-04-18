// src/pages/LoginPage.jsx
// Swift의 LoginView + SignUpView를 합친 것
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { signInEmail, signUpEmail, signInGoogle, signInMicrosoft, error, isLoading } = useAuth()
  const [mode, setMode] = useState('login')  // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (mode === 'login') {
      await signInEmail(email, password)
    } else {
      await signUpEmail(email, password, displayName)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.glow} />

      {/* 로고 + 뒤로가기 */}
      <Link to="/" className={styles.backLink}>← 홈으로</Link>

      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <span className={styles.logo}>Focus</span>
          <p className={styles.tagline}>
            {mode === 'login' ? '다시 만나서 반가워요 👋' : '같이 집중해봐요 🔥'}
          </p>
        </div>

        {/* 탭: 로그인 / 회원가입 */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${mode === 'login' ? styles.active : ''}`} onClick={() => setMode('login')}>로그인</button>
          <button className={`${styles.tab} ${mode === 'signup' ? styles.active : ''}`} onClick={() => setMode('signup')}>회원가입</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'signup' && (
            <div className={styles.field}>
              <label className={styles.label}>이름</label>
              <input
                className="input"
                type="text"
                placeholder="홍길동"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.label}>이메일</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>비밀번호</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ marginTop: 8 }}>
            {isLoading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : (mode === 'login' ? '로그인' : '회원가입')}
          </button>
        </form>

        {/* 구분선 */}
        <div className={styles.divider}><span>또는</span></div>

        {/* 소셜 로그인 */}
        <div className={styles.social}>
          <button className={`btn btn-ghost w-full ${styles.socialBtn}`} onClick={signInGoogle} disabled={isLoading}>
            {/* Google SVG 아이콘 */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 계속하기
          </button>

          <button className={`btn btn-ghost w-full ${styles.socialBtn}`} onClick={signInMicrosoft} disabled={isLoading}>
            {/* Microsoft SVG 아이콘 */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#F25022" d="M1 1h10v10H1z"/>
              <path fill="#00A4EF" d="M13 1h10v10H13z"/>
              <path fill="#7FBA00" d="M1 13h10v10H1z"/>
              <path fill="#FFB900" d="M13 13h10v10H13z"/>
            </svg>
            Microsoft로 계속하기
          </button>
        </div>
      </div>
    </div>
  )
}
