import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm';

// 1) Firebase設定を入れる
const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  appId: 'YOUR_APP_ID'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 2) EmailJS設定を入れる
emailjs.init({
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
});

const SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';
const TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';

// 3) DOM
const statusEl = document.getElementById('auth-status');
const form = document.getElementById('verified-send-form');
const nameInput = document.getElementById('user_name');
const emailInput = document.getElementById('user_email');

// 4) 認証済みならフォームを出す
function unlockForm(user) {
  statusEl.textContent = `認証済み: ${user.email}`;
  form.hidden = false;

  // 認証済みメールを自動入力して固定
  emailInput.value = user.email || '';
  emailInput.readOnly = true;
}

// 5) 未認証時の表示
function lockForm() {
  form.hidden = true;
  statusEl.textContent = '未認証です。先に認証メールのリンクからこのページを開いてください。';
}

// 6) メールリンク認証をこのページで完了
async function completeEmailLinkSignIn() {
  const currentUrl = window.location.href;

  if (!isSignInWithEmailLink(auth, currentUrl)) {
    return;
  }

  // 元ページで保存したメールアドレスを使う
  let email = window.localStorage.getItem('emailForSignIn');

  // 念のため、保存がなければ手入力させる
  if (!email) {
    email = window.prompt('認証に使ったメールアドレスを入力してください');
  }

  if (!email) {
    statusEl.textContent = 'メールアドレスが取得できなかったため、認証を完了できませんでした。';
    return;
  }

  try {
    const result = await signInWithEmailLink(auth, email, currentUrl);
    window.localStorage.removeItem('emailForSignIn');
    unlockForm(result.user);
  } catch (error) {
    console.error('Firebase email link sign-in error:', error);
    statusEl.textContent = '認証に失敗しました。認証メールからもう一度入り直してください。';
  }
}

// 7) すでにログイン済みならそのまま開放
onAuthStateChanged(auth, (user) => {
  if (user) {
    unlockForm(user);
  } else {
    lockForm();
  }
});

// 8) 初回ロード時に認証リンク処理
await completeEmailLinkSignIn();

// 9) 認証済みだけ送信
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!auth.currentUser || !auth.currentUser.emailVerified) {
    alert('認証済みユーザーのみ送信できます。');
    return;
  }

  // 念のため、送信用メール欄は認証済みメールに再同期
  emailInput.value = auth.currentUser.email || '';

  try {
    await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form);
    alert('送信成功');
    form.reset();

    // reset後に認証済みメールを戻す
    emailInput.value = auth.currentUser.email || '';
    emailInput.readOnly = true;
  } catch (error) {
    console.error('EmailJS send error:', error);
    alert('送信失敗');
  }
});
