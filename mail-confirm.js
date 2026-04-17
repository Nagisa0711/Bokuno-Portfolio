import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  sendSignInLinkToEmail
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB85JHieDeCFR-6IUxe80nztxRtJYdL8dw",
  authDomain: "mail-auth-system.firebaseapp.com",
  projectId: "mail-auth-system",
  appId: "1:704724659793:web:532bce406ae145c1035270"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const form = document.getElementById("mail-auth-form");
const emailInput = document.getElementById("user_email");
const result = document.getElementById("result");
const submitButton = form.querySelector('button[type="submit"]');

let isSending = false;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (isSending) return;

  const email = emailInput.value.trim();

  if (!email) {
    result.textContent = "メールアドレスを入力してください。";
    return;
  }

  const actionCodeSettings = {
    url: "https://nagisa0711.github.io/send.html",
    handleCodeInApp: true
  };

  try {
    isSending = true;
    submitButton.disabled = true;
    submitButton.textContent = "送信中...";
    result.textContent = "";

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem("emailForSignIn", email);

    result.textContent = "確認メールを送りました。迷惑メールフォルダも確認してください。";
  } catch (error) {
    console.error(error);
    result.textContent = `${error.code} / ${error.message}`;
  } finally {
    setTimeout(() => {
      isSending = false;
      submitButton.disabled = false;
      submitButton.textContent = "確認メールを送る";
    }, 5000);
  }
});
