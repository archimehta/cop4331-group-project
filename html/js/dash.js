
/* ===================== DASH LOGIC ===================== */

// user from local storage
const userId    = Number(localStorage.getItem("userId")) || 0;
const firstName = localStorage.getItem("firstName") || "";
const lastName  = localStorage.getItem("lastName")  || "";


if (!userId) {
  window.location.href = "index.html";
}


document.getElementById("user-name").textContent =
  [firstName, lastName].filter(Boolean).join(" ") || "User";

// logout
document.getElementById("logout-link").addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.href = "index.html";
});

// edit contact list
document.getElementById("edit-contact-list").addEventListener("click", () => {
  window.location.href = "editAll.html";
});

// local avatar
const avatarBtn  = document.getElementById("avatar-btn");
const avatarFile = document.getElementById("avatar-file");
const avatarImg  = document.getElementById("avatar-img");
const avatarErr  = document.getElementById("avatar-error");

// load saved avatar
const savedAvatar = localStorage.getItem("avatarDataUrl");
if (savedAvatar) {
  avatarImg.src = savedAvatar;
  avatarImg.style.display = "block";
}

avatarBtn.addEventListener("click", () => avatarFile.click());

avatarFile.addEventListener("change", () => {
  avatarErr.textContent = "";
  const file = avatarFile.files && avatarFile.files[0];
  if (!file) return;

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    avatarErr.textContent = "Please choose a valid image file.";
    avatarFile.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    avatarErr.textContent = "Image must be 5 MB or smaller.";
    avatarFile.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    avatarImg.src = dataUrl;
    avatarImg.style.display = "block";
    try {
      localStorage.setItem("avatarDataUrl", dataUrl);
    } catch (err) {
      avatarErr.textContent = "Could not save image locally.";
    }
  };
  reader.readAsDataURL(file);
  avatarFile.value = "";
});

// search
const searchEl  = document.getElementById("search");
const resultsEl = document.getElementById("results");
const statusEl  = document.getElementById("status");

let allResults = [];
let lastQuery  = "";

function fullName(item) {
  return [item.FirstName || "", item.LastName || ""]
    .filter(Boolean)
    .join(" ") || "(No name)";
}

function clearList() {
  resultsEl.textContent = "";
}

function renderAll() {
  resultsEl.innerHTML = "";

  if (!allResults.length) {
    statusEl.textContent = "No contacts found.";
    return;
  }

  statusEl.textContent = "";

  for (const c of allResults) {
    const row = document.createElement("div");
    row.className = "contact-card";
    row.innerHTML = `
      <strong>${fullName(c)}</strong>
      <button onclick="window.location.href='view.html?id=${encodeURIComponent(c.databaseId ?? c.ID)}'">View</button>
    `;
    resultsEl.appendChild(row);
  }
}

async function fetchResults(query) {
  statusEl.textContent = "Searching…";
  resultsEl.textContent = "";
  allResults = [];

  try {
    const res = await fetch("LAMPAPI/SearchContacts.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search: query, userId })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      statusEl.textContent = data.error || "Search failed.";
      return;
    }

    if (data.error) {
      statusEl.textContent = data.error;
      return;
    }

    allResults = data.results || [];
    renderAll();
  } catch {
    statusEl.textContent = "Unexpected error. Please try again.";
  }
}

// debounce input
let debounce;
searchEl.addEventListener("input", () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    const q = searchEl.value.trim();
    if (q === lastQuery) return;
    lastQuery = q;
    clearList();
    if (q.length >= 1) {
      fetchResults(q);
    } else {
      statusEl.textContent = "Type to search.";
    }
  }, 300);
});

// Init
searchEl.focus();
statusEl.textContent = "Type to search.";
