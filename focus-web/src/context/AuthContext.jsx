// src/context/AuthContext.jsx
// Swift의 AuthManager와 동일한 역할
// @EnvironmentObject private var auth: AuthManager  →  const { user } = useAuth()
import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider, microsoftProvider } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)        // Firebase User 객체
  const [profile, setProfile] = useState(null)  // Firestore의 추가 프로필 정보
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // 앱 시작 시 로그인 상태 감지 (Swift의 onAppear + auth.uid 변경 감지와 동일)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await loadOrCreateProfile(firebaseUser)
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })
    return unsubscribe // cleanup: 컴포넌트 언마운트 시 리스너 해제
  }, [])

  // Firestore에서 유저 프로필 가져오기 (없으면 새로 생성)
  async function loadOrCreateProfile(firebaseUser) {
    const ref = doc(db, 'users', firebaseUser.uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      setProfile(snap.data())
    } else {
      // 첫 로그인: 프로필 새로 만들기
      const newProfile = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '사용자',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        isAnonymous: firebaseUser.isAnonymous,
        isPremium: false,
        createdAt: serverTimestamp(),
      }
      await setDoc(ref, newProfile)
      setProfile(newProfile)
    }
  }

  // 이메일 로그인
  async function signInEmail(email, password) {
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e) {
      setError(getKoreanError(e.code))
    }
  }

  // 이메일 회원가입
  async function signUpEmail(email, password, displayName) {
    setError('')
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName })
    } catch (e) {
      setError(getKoreanError(e.code))
    }
  }

  // Google 로그인
  async function signInGoogle() {
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setError(getKoreanError(e.code))
      }
    }
  }

  // Microsoft 로그인
  async function signInMicrosoft() {
    setError('')
    try {
      await signInWithPopup(auth, microsoftProvider)
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setError(getKoreanError(e.code))
      }
    }
  }

  // 로그아웃
  async function logout() {
    await signOut(auth)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, error, setError, signInEmail, signUpEmail, signInGoogle, signInMicrosoft, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 커스텀 훅: const { user } = useAuth() 처럼 사용
export function useAuth() {
  return useContext(AuthContext)
}

// Firebase 에러 코드 → 한국어 메시지 변환
function getKoreanError(code) {
  const map = {
    'auth/user-not-found': '존재하지 않는 계정이에요.',
    'auth/wrong-password': '비밀번호가 틀렸어요.',
    'auth/email-already-in-use': '이미 사용 중인 이메일이에요.',
    'auth/weak-password': '비밀번호는 6자 이상이어야 해요.',
    'auth/invalid-email': '이메일 형식이 올바르지 않아요.',
    'auth/too-many-requests': '잠시 후 다시 시도해주세요.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않아요.',
  }
  return map[code] || '오류가 발생했어요. 다시 시도해주세요.'
}
