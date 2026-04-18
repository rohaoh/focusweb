// src/App.jsx
// Swift의 ContentView와 동일한 역할
// 로그인 여부에 따라 랜딩/로그인/앱 화면으로 라우팅
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AppLayout from './components/layout/AppLayout'
import TodosPage from './pages/TodosPage'
import FocusPage from './pages/FocusPage'
import GroupsPage from './pages/GroupsPage'
import StatsPage from './pages/StatsPage'

export default function App() {
  const { user, isLoading } = useAuth()

  // 앱 초기 로딩 (Swift의 ProgressView("Loading...") 와 동일)
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    )
  }

  return (
    <Routes>
      {/* 랜딩 페이지 - 소개 + 다운로드 */}
      <Route path="/" element={<LandingPage />} />

      {/* 로그인 (비로그인 상태에서만) */}
      <Route
        path="/login"
        element={user ? <Navigate to="/app/todos" replace /> : <LoginPage />}
      />

      {/* 앱 내부 (로그인 필요) */}
      <Route
        path="/app"
        element={user ? <AppLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="todos" replace />} />
        <Route path="todos" element={<TodosPage />} />
        <Route path="focus/:todoId?" element={<FocusPage />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="stats" element={<StatsPage />} />
      </Route>

      {/* 없는 경로 처리 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
