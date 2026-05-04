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

  gtag('config', 'G-ZC4JL0QNQ8');
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

// Listen for Firebase Auth changes to re-render the navbar automatically
googlefemboylitics();
if (!document.documentElement.hasAttribute('data-no-nav')) {
  onAuthStateChanged(auth, (user) => {
    renderNavbar(user);
  });
}