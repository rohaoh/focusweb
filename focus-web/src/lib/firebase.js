// src/lib/firebase.js
// Firebase 설정값 - GoogleService-Info.plist 에서 가져온 값
// ⚠️  Firebase Console에서 웹앱 등록 후 아래 값들을 실제 웹앱 config로 교체해야 해!
// Firebase Console → 프로젝트 설정 → 웹앱 추가 → 설정 복사
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCb10PoZCxhfk0uycWdlyCHafhH7cgsWEc",
  authDomain: "foucus-78545.firebaseapp.com",
  projectId: "foucus-78545",
  storageBucket: "foucus-78545.firebasestorage.app",
  messagingSenderId: "840687477850",
  appId: "1:840687477850:web:REPLACE_WITH_WEB_APP_ID", // ⚠️ Firebase Console에서 웹앱 appId로 교체!
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

// 로그인 제공자
export const googleProvider = new GoogleAuthProvider()
export const microsoftProvider = new OAuthProvider('microsoft.com')
