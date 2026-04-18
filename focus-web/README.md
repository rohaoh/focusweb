# Focus Web

Focus iOS 앱의 웹 버전입니다.
React + Vite + Firebase + Cloudflare Pages 기반.

## 📂 프로젝트 구조

```
src/
├── lib/firebase.js          # Firebase 설정
├── context/AuthContext.jsx  # 로그인 상태 관리 (AuthManager 역할)
├── hooks/
│   ├── useTodos.js          # 할 일 CRUD (FirestoreSyncManager 역할)
│   └── useGroups.js         # 그룹 관리 (GroupManager 역할)
├── pages/
│   ├── LandingPage.jsx      # 소개 + 다운로드 페이지
│   ├── LoginPage.jsx        # 로그인 / 회원가입
│   ├── TodosPage.jsx        # 할 일 목록
│   ├── FocusPage.jsx        # 집중 타이머
│   ├── GroupsPage.jsx       # 그룹
│   └── StatsPage.jsx        # 통계
└── components/layout/
    └── AppLayout.jsx        # 사이드바 레이아웃
```

## 🚀 시작하기

### 1. Firebase 웹앱 등록 (필수!)

1. [Firebase Console](https://console.firebase.google.com) 접속
2. `foucus-78545` 프로젝트 선택
3. 프로젝트 설정 → **웹앱 추가** (</> 아이콘)
4. `src/lib/firebase.js`에서 `appId` 값을 웹앱 appId로 교체

```js
// firebase.js
appId: "1:840687477850:web:실제_웹앱_ID"
```

### 2. Firebase Authentication 설정

Firebase Console → Authentication → 로그인 방법에서 활성화:
- ✅ 이메일/비밀번호
- ✅ Google
- ✅ Microsoft

### 3. Firestore 규칙 설정

Firebase Console → Firestore → 규칙:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    match /groups/{groupId} {
      allow read: if request.auth.uid in resource.data.memberIds;
      allow create: if request.auth != null;
      allow update: if request.auth.uid in resource.data.memberIds;
    }
    match /groups/{groupId}/{document=**} {
      allow read, write: if request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.memberIds;
    }
  }
}
```

### 4. 로컬 실행

```bash
npm install
npm run dev
```

### 5. Cloudflare Pages 배포

1. GitHub 레포에 이 폴더 내용 push
2. Cloudflare Pages → 새 프로젝트 → GitHub 연결
3. 빌드 설정:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`

## 🔗 앱-웹 데이터 공유

iOS 앱과 동일한 Firebase 프로젝트를 사용하므로
앱에서 만든 할 일, 그룹이 웹에서도 실시간으로 보여요!
