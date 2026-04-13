<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>認証後の送信ページ</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  ...
</body>
</html>

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";

const firebaseConfig = {
  apiKey: "ここにAPIキー",
  authDomain: "ここにauthDomain",
  projectId: "ここにprojectId",
  appId: "ここにappId"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// EmailJS
emailjs.init({
  publicKey: "ここにPublicKey"
});

const SERVICE_ID = "ここにServiceID";
const TEMPLATE_ID = "ここにTemplateID";

const status = document.getElementById("auth-status");
const form = document.getElementById("verified-send-form");
const emailInput = document.getElementById("user_email");

// 🔐 認証チェック
function showForm(user) {
  status.textContent = "認証成功: " + user.email;
  form.hidden = false;

  emailInput.value = user.email;
  emailInput.readOnly = true;
}

function lock() {
  form.hidden = true;
  status.textContent = "未認証です。メールのリンクからアクセスしてください";
}

// 🔥 認証処理
async function handleSignIn() {
  if (!isSignInWithEmailLink(auth, window.location.href)) return;

  let email = localStorage.getItem("emailForSignIn");

  if (!email) {
    email = prompt("メールアドレスを入力してください");
  }

  try {
    const result = await signInWithEmailLink(auth, email, window.location.href);
    localStorage.removeItem("emailForSignIn");
    showForm(result.user);
  } catch (err) {
    console.error(err);
    status.textContent = "認証失敗";
  }
}

// 状態監視
onAuthStateChanged(auth, (user) => {
  if (user) {
    showForm(user);
  } else {
    lock();
  }
});

handleSignIn();

// 📩 送信
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!auth.currentUser) {
    alert("認証されてません");
    return;
  }

  try {
    await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form);
    alert("送信成功");
    form.reset();

    // メールは戻す
    emailInput.value = auth.currentUser.email;
  } catch (err) {
    console.error(err);
    alert("送信失敗");
  }
});
