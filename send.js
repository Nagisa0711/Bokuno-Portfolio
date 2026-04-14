import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";

const firebaseConfig = {
  apiKey: "AIzaSyB85JHieDeCFR-6IUxe80nztxRtJYdL8dw",
  authDomain: "mail-auth-system.firebaseapp.com",
  projectId: "mail-auth-system",
  appId: "1:704724659793:web:532bce406ae145c1035270"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// EmailJS
emailjs.init({
  publicKey: "R0sZOGBqMYOUXXfxG"
});

const SERVICE_ID = "service_aytloci";
const TEMPLATE_ID = "template_aipskd5";

const status = document.getElementById("auth-status");
const form = document.getElementById("verified-send-form");
const emailInput = document.getElementById("user_email");

function showForm(user) {
  status.textContent = "認証成功: " + user.email;
  form.hidden = false;
  emailInput.value = user.email || "";
  emailInput.readOnly = true;
}

function lock(message = "未認証です。メールのリンクからアクセスしてください") {
  form.hidden = true;
  status.textContent = message;
}

async function handleSignIn() {
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return false;
  }

  let email = localStorage.getItem("emailForSignIn");

  if (!email) {
    email = prompt("メールアドレスを入力してください");
  }

  if (!email || !email.trim()) {
    lock("メールアドレスが入力されていません");
    return true;
  }

  try {
    const result = await signInWithEmailLink(auth, email.trim(), window.location.href);
    localStorage.removeItem("emailForSignIn");
    showForm(result.user);
    return true;
  } catch (err) {
    console.error(err);
    lock("認証失敗: " + (err.code || "unknown-error"));
    return true;
  }
}

async function init() {
  form.hidden = true;
  status.textContent = "認証状態を確認中...";

  const handled = await handleSignIn();

  // メールリンク処理をしていない通常アクセス時だけ監視で分岐
  if (!handled) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        showForm(user);
      } else {
        lock();
      }
    });
  }
}

init();

// 📩 送信
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!auth.currentUser) {
    alert("認証されていません");
    return;
  }

  try {
    await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form);
    alert("送信成功");
    form.reset();

    emailInput.value = auth.currentUser.email || "";
    emailInput.readOnly = true;
  } catch (err) {
    console.error(err);
    alert("送信失敗");
  }
});
