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

/* 今の send.html に合わせた取得 */
const status = document.getElementById("verified-email");
const form = document.getElementById("contact-form");
const emailInput = document.getElementById("email");
const result = document.getElementById("send-result");

/* 送信ボタン取得 */
const submitButton = form?.querySelector('button[type="submit"]');

function showForm(user) {
  if (status) {
    status.textContent = user.email || "認証済み";
  }

  if (form) {
    form.hidden = false;
  }

  if (emailInput) {
    emailInput.value = user.email || "";
    emailInput.readOnly = true;
  }

  if (result) {
    result.textContent = "";
  }
}

function lock(message = "未認証です。メールのリンクからアクセスしてください。") {
  if (form) {
    form.hidden = true;
  }

  if (status) {
    status.textContent = message;
  }

  if (result) {
    result.textContent = "";
  }
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
    lock("メールアドレスが入力されていません。");
    return true;
  }

  try {
    const signInResult = await signInWithEmailLink(auth, email.trim(), window.location.href);

    localStorage.removeItem("emailForSignIn");
    showForm(signInResult.user);
    return true;
  } catch (err) {
    console.error(err);
    lock("認証失敗: " + (err.code || "unknown-error"));
    return true;
  }
}

async function init() {
  if (form) {
    form.hidden = true;
  }

  if (status) {
    status.textContent = "認証状態を確認中...";
  }

  const handled = await handleSignIn();

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

/* 送信処理 */
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!auth.currentUser) {
    if (result) {
      result.textContent = "認証されていません。";
    } else {
      alert("認証されていません");
    }
    return;
  }

  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "送信中...";
    }

    if (result) {
      result.textContent = "";
    }

      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form);

    if (result) {
      result.textContent = "送信が完了しました。トップページへ戻ります...";
    } else {
      alert("送信成功");
    }

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);

    form.reset();

    if (emailInput) {
      emailInput.value = auth.currentUser.email || "";
      emailInput.readOnly = true;
    }
  } catch (err) {
    console.error(err);
    if (result) {
      result.textContent = "送信に失敗しました。時間をおいて再度お試しください。";
    } else {
      alert("送信失敗");
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "送信";
    }
  }
});
