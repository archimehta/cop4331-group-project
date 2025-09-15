// local storage
const USER_ID = Number(localStorage.getItem('userId')) || 0;

if (!USER_ID) {
  window.location.href = 'index.html';
}

document.getElementById('logout-link').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.href = 'index.html';
});

function setAddStatus(msg)    { document.getElementById('add-status').textContent    = msg || ''; }
function setSearchStatus(msg) { document.getElementById('search-status').textContent = msg || ''; }

function fullName(item) {
  return [item.FirstName || '', item.LastName || ''].filter(Boolean).join(' ') || '(No name)';
}

// add contact
document.getElementById('add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  setAddStatus('');
  const addBtn = document.getElementById('add-btn');
  if (addBtn) addBtn.disabled = true;

  const email = document.getElementById('add-email').value.trim();
  const phone = document.getElementById('add-phone').value.trim();
  const first = document.getElementById('add-first').value.trim();
  const last  = document.getElementById('add-last').value.trim();

  if (!email || !phone) {
    setAddStatus('Email and phone number are required.');
    if (addBtn) addBtn.disabled = false;
    return;
  }

  if (!first || !last) {
    setAddStatus('First and last name are required.');
    if (addBtn) addBtn.disabled = false;
    return;
  }

  try {
    const res = await fetch('/LAMPAPI/AddContact.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: USER_ID,
        firstName: first,
        lastName: last,
        phone,
        email
      })
    });

    const raw = await res.text();
    let data = {};
    try { data = JSON.parse(raw); } catch (_) { /* ignore if not JSON */ }

    // network / HTTP error?
    if (!res.ok) {
      setAddStatus((data && data.error) ? data.error : `HTTP ${res.status}: ${raw.slice(0,200)}`);
      return;
    }

    // app-level error from PHP?
    if (data && data.error && data.error.length) {
      setAddStatus(data.error);
      return;
    }

    // SUCCESS
    document.getElementById('add-form').reset();
    setAddStatus((data && data.message) ? data.message : 'Contact added.');
    if (typeof triggerSearch === 'function') triggerSearch();

  } catch (err) {
    console.error(err);
    setAddStatus('Unexpected error while adding contact.');
  } finally {
    if (addBtn) addBtn.disabled = false;
  }
});

// search
const searchEl  = document.getElementById("search");
const resultsEl = document.getElementById("results");
const statusEl  = document.getElementById("search-status");

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
      <button onclick="window.location.href='edit.html?id=${encodeURIComponent(c.databaseId ?? c.ID)}'">Edit</button>
    `;
    resultsEl.appendChild(row);
  }
}

async function fetchResults(query) {
  statusEl.textContent = "Searching…";
  resultsEl.textContent = "";
  allResults = [];

  try {
    const res = await fetch("/LAMPAPI/SearchContacts.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search: query, userId: USER_ID})
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