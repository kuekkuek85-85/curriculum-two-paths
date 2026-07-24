// Firebase Firestore — 실시간 인터랙션 전용 (익명, 로그인 없음, 개인정보 미수집)
// 환경변수 미설정 시 fbEnabled=false 가 되고 모든 헬퍼는 no-op으로 동작한다.
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

// Firebase 웹 config는 비밀값이 아니라 클라이언트 번들에 그대로 실리는 공개 식별자다.
// Vercel 대시보드 설정 없이도 배포가 바로 동작하도록 기본값을 두고,
// 환경변수가 있으면 그쪽이 우선한다. 실제 보호는 Firestore 보안 규칙이 담당한다.
const DEFAULTS = {
  apiKey: "AIzaSyB5c-friD8QI-PD4okV8mj_4bKtOZL_4Fg",
  authDomain: "curriculum-two-paths.firebaseapp.com",
  projectId: "curriculum-two-paths",
  appId: "1:1098183906122:web:1a4cb93a77efe2cc1427b3",
};

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULTS.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULTS.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULTS.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULTS.appId,
};

export const fbEnabled = Boolean(cfg.apiKey && cfg.projectId);
const db = fbEnabled ? getFirestore(initializeApp(cfg)) : null;

const SESSION = ["session", "current"];
const COLLECTIONS = { poll: "responses_poll", quiz: "responses_quiz", wish: "wishes" };

// 발표자: 현재 활성 인터랙션 동기화 (active: 'poll' | 'quiz' | 'wish' | null)
export async function setSessionState(state) {
  if (!db) return;
  try {
    await setDoc(doc(db, ...SESSION), state, { merge: true });
  } catch (e) {
    console.warn("setSessionState 실패:", e);
  }
}

export function subscribeSession(cb) {
  if (!db) return () => {};
  return onSnapshot(doc(db, ...SESSION), (snap) => cb(snap.data() ?? {}));
}

// 청중: 폴/퀴즈 응답 제출 (choice: 0|1|2)
export async function submitChoice(kind, choice) {
  if (!db) return;
  await addDoc(collection(db, COLLECTIONS[kind]), { choice, ts: serverTimestamp() });
}

// 발표자: 폴/퀴즈 응답 실시간 집계 (cb에 [n0, n1, n2] 전달)
export function subscribeCounts(kind, numOptions, cb) {
  if (!db) return () => {};
  return onSnapshot(collection(db, COLLECTIONS[kind]), (snap) => {
    const counts = Array(numOptions).fill(0);
    snap.forEach((d) => {
      const c = d.data().choice;
      if (c >= 0 && c < numOptions) counts[c]++;
    });
    cb(counts);
  });
}

// 청중: 자유 입력 제출 (S19)
export async function submitWish(text) {
  if (!db) return;
  await addDoc(collection(db, COLLECTIONS.wish), {
    text: text.slice(0, 50),
    hidden: false,
    ts: serverTimestamp(),
  });
}

// 발표자: 자유 입력 실시간 구독 (최신이 위)
export function subscribeWishes(cb) {
  if (!db) return () => {};
  const q = query(collection(db, COLLECTIONS.wish), orderBy("ts", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// 발표자: 부적절 입력 숨김 처리
export async function hideWish(id) {
  if (!db) return;
  await updateDoc(doc(db, COLLECTIONS.wish, id), { hidden: true });
}

// 발표 전 점검용: 모든 응답 데이터 초기화
export async function resetAllResponses() {
  if (!db) return;
  for (const coll of Object.values(COLLECTIONS)) {
    const snap = await getDocs(collection(db, coll));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }
  await setDoc(doc(db, ...SESSION), { active: null, quizRevealed: false });
}
