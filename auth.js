import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  OAuthProvider,
  fetchSignInMethodsForEmail 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBTvi0k6pbskDO2YzQBaBFCHebC16M16CQ",
  authDomain: "starlight-unixity.firebaseapp.com",
  projectId: "starlight-unixity",
  storageBucket: "starlight-unixity.firebasestorage.app",
  messagingSenderId: "942059863548",
  appId: "1:942059863548:web:05fbfe1fcc392fed02c679",
  measurementId: "G-ZC4JL0QNQ8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');
export { fetchSignInMethodsForEmail };

const isElectron = navigator.userAgent.toLowerCase().includes('electron');

window.logoutUser = () => {
  signOut(auth).then(() => {
    window.location.href = isElectron ? "index.html" : "/";
  });
};

onAuthStateChanged(auth, (user) => {
  document.querySelectorAll('.auth-only').forEach(el => {
    user ? el.classList.remove('d-none') : el.classList.add('d-none');
  });
  document.querySelectorAll('.guest-only').forEach(el => {
    user ? el.classList.add('d-none') : el.classList.remove('d-none');
  });
  const emailDisplay = document.getElementById('user-email');
  if (emailDisplay && user) emailDisplay.textContent = user.email;

  if (!user && window.location.href.includes('/request')) {
    window.location.href = isElectron ? "../login/index.html" : "/login/";
  }
});