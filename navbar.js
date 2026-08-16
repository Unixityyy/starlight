import { auth } from "/auth.js"; // Import the auth instance from your existing file
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const NAV_ITEMS = [
  { label: "Home", path: "/", guestOnly: false, authOnly: false },
  { label: "Player", path: "/player", guestOnly: false, authOnly: false },
  { label: "Playlists", path: "/playlists/", guestOnly: false, authOnly: false },
  { label: "Request Form", path: "/request", guestOnly: false, authOnly: true },
  { label: "Login", path: "/login/", guestOnly: true, authOnly: false, colorClass: "text-warning" },
  { label: "Logout", path: "#", guestOnly: false, authOnly: true, colorClass: "text-danger", isLogout: true }
];

function googlefemboylitics() {
  const headElem = document.querySelector('head');
  headElem.innerHTML = `
  <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ZC4JL0QNQ8"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-ZC4JL0QNQ8', { 'debug_mode':true });
</script>
` + headElem.innerHTML;
}

function renderNavbar(user) {
  const navContainer = document.querySelector('nav');
  if (!navContainer) return;

  const currentPath = window.location.pathname;
  let navHtml = `<ul class="nav nav-tabs justify-content-center">`;

  NAV_ITEMS.forEach(item => {
    // Firebase Auth Filter
    if (item.authOnly && !user) return;
    if (item.guestOnly && user) return;

    // Active State Logic
    let isActive = false;
    if (item.path === "/") {
      isActive = (currentPath === "/" || currentPath === "/index.html");
    } else {
      // Highlights parent even if in sub-directories like /playlists/editor
      isActive = currentPath.startsWith(item.path);
    }

    const activeClass = isActive ? "active" : "";
    const colorClass = item.colorClass || "";
    // Call the global logoutUser defined in your auth.js
    const attr = item.isLogout
      ? `href="javascript:void(0)" onclick="window.logoutUser()"`
      : `href="${item.path}"`;

    navHtml += `
      <li class="nav-item">
        <a class="nav-link ${activeClass} ${colorClass}" ${attr}>
${item.label}
        </a>
      </li>`;
  });

  navHtml += `</ul>`;
  navContainer.innerHTML = navHtml;
}

/* ------------------------------------------------------------------ */
/* Konami code easter egg -> episode viewer                           */
/* ------------------------------------------------------------------ */

const TOTAL_EPISODES = 37;
const VIDEO_BASE_URL = "https://dn.unixityyy.dev/api/v1/death-note";

const KONAMI_CODE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a", "Enter"
];

let konamiBuffer = [];

function formatEpisode(n) {
  // 1-9 -> "01".."09", 10-37 -> "10".."37"
  return String(n).padStart(2, "0");
}

function initKonamiListener() {
  window.addEventListener("keydown", (e) => {
    konamiBuffer.push(e.key);
    if (konamiBuffer.length > KONAMI_CODE.length) {
      konamiBuffer.shift();
    }
    const isMatch =
      konamiBuffer.length === KONAMI_CODE.length &&
      konamiBuffer.every((key, i) => key === KONAMI_CODE[i]);

    if (isMatch) {
      konamiBuffer = [];
      openEpisodeViewer();
    }
  });
}

function ensureEpisodeViewer() {
  let overlay = document.getElementById("konami-overlay");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "konami-overlay";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: none;
    background: rgba(0, 0, 0, 0.94);
    font-family: inherit;
  `;

  overlay.innerHTML = `
    <div style="display:flex; width:100%; height:100%;">
      <div id="konami-sidebar" style="
        width: 220px;
        flex-shrink: 0;
        overflow-y: auto;
        background: #111;
        padding: 1rem 0.5rem;
        border-right: 1px solid #333;
      ">
        <div style="color:#fff; font-weight:600; text-align:center; margin-bottom:0.75rem;">
          Episodes
        </div>
        <ul id="konami-episode-list" style="list-style:none; padding:0; margin:0;"></ul>
      </div>
      <div style="flex:1; position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2rem;">
        <button id="konami-close" style="
          position:absolute; top:1rem; right:1rem;
          background:none; border:none; color:#fff;
          font-size:1.5rem; line-height:1; cursor:pointer;
        ">&times;</button>
        <div id="konami-status" style="color:#aaa; margin-bottom:1rem; font-size:0.9rem;"></div>
        <video id="konami-video" controls style="max-width:90%; max-height:75vh; background:#000;"></video>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Build episode list
  const list = overlay.querySelector("#konami-episode-list");
  for (let i = 1; i <= TOTAL_EPISODES; i++) {
    const epNum = formatEpisode(i);
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = `Episode ${i}`;
    btn.dataset.episode = epNum;
    btn.style.cssText = `
      display:block; width:100%; text-align:left;
      padding:0.5rem 0.75rem; margin-bottom:2px;
      background:none; border:none; border-radius:4px;
      color:#ccc; font-size:0.9rem; cursor:pointer;
    `;
    btn.addEventListener("mouseenter", () => {
      if (btn.dataset.episode !== overlay.dataset.activeEpisode) {
        btn.style.background = "#2a2a2a";
      }
    });
    btn.addEventListener("mouseleave", () => {
      if (btn.dataset.episode !== overlay.dataset.activeEpisode) {
        btn.style.background = "none";
      }
    });
    btn.addEventListener("click", () => loadEpisode(epNum));
    li.appendChild(btn);
    list.appendChild(li);
  }

  overlay.querySelector("#konami-close").addEventListener("click", closeEpisodeViewer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.style.display !== "none") {
      closeEpisodeViewer();
    }
  });

  return overlay;
}

function highlightActiveEpisode(overlay, epNum) {
  overlay.dataset.activeEpisode = epNum;
  overlay.querySelectorAll("#konami-episode-list button").forEach((btn) => {
    const active = btn.dataset.episode === epNum;
    btn.style.background = active ? "#0d6efd" : "none";
    btn.style.color = active ? "#fff" : "#ccc";
  });
}

function loadEpisode(epNum) {
  const overlay = document.getElementById("konami-overlay");
  const video = document.getElementById("konami-video");
  const status = document.getElementById("konami-status");

  highlightActiveEpisode(overlay, epNum);
  status.textContent = `Episode ${epNum}`;

  video.src = `${VIDEO_BASE_URL}/${epNum}.mp4`;
  video.play().catch(() => {
    // Autoplay may be blocked by the browser; user can hit play manually.
  });
}

function openEpisodeViewer() {
  const overlay = ensureEpisodeViewer();
  overlay.style.display = "block";
  loadEpisode(formatEpisode(1));
}

function closeEpisodeViewer() {
  const overlay = document.getElementById("konami-overlay");
  const video = document.getElementById("konami-video");

  if (video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
  if (overlay) {
    overlay.style.display = "none";
  }
}

initKonamiListener();

/* ------------------------------------------------------------------ */

// Listen for Firebase Auth changes to re-render the navbar automatically
googlefemboylitics();
if (!document.documentElement.hasAttribute('data-no-nav')) {
  onAuthStateChanged(auth, (user) => {
    renderNavbar(user);
  });
}
