const realFetch = window.fetch;
window.fetch = async (url, opts) => {
  if (typeof url === "string" && url.includes("SearchContacts.php")) {
    let query = "";
    try {
      query = JSON.parse(opts?.body || "{}")?.search || "";
    } catch {}

    // return sample contacts (shape matches your PHP: FirstName, LastName, Phone, Email, databaseId)
    const sample = {
      results: [
        { FirstName: "Mandy",   LastName: "Moore",   Phone: "555-1111", Email: "mandy@example.com",  databaseId: "101" },
        { FirstName: "Mason",   LastName: "Ramsey",  Phone: "555-2222", Email: "mason@example.com",  databaseId: "102" },
        { FirstName: "Michael", LastName: "Jordan",  Phone: "555-3333", Email: "mj@example.com",     databaseId: "103" },
        { FirstName: "Miles",   LastName: "Morales", Phone: "555-4444", Email: "miles@example.com",  databaseId: "104" },
        { FirstName: "Millie",  LastName: "Brown",   Phone: "555-5555", Email: "millie@example.com", databaseId: "105" },
        { FirstName: "Milli",   LastName: "Brown",   Phone: "555-5655", Email: "millie@example.com", databaseId: "106" },
        { FirstName: "Mllie",   LastName: "Brown",   Phone: "555-5555", Email: "millie@example.com", databaseId: "107" },
        { FirstName: "Msson",   LastName: "Ramsey",  Phone: "555-2222", Email: "mason@example.com",  databaseId: "108" },
        { FirstName: "Mason",   LastName: "Ramsey",  Phone: "555-2222", Email: "mason@example.com",  databaseId: "109" }
      ],
      error: ""
    };

    if (query) {
      const q = query.toLowerCase();
      sample.results = sample.results.filter(c =>
        `${c.FirstName} ${c.LastName}`.toLowerCase().includes(q)
      );
    }

    return new Response(JSON.stringify(sample), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  return realFetch(url, opts);
};

// local storage
const USER_ID = Number(localStorage.getItem('userId')) || 0;
/*
if (!USER_ID) {
  window.location.href = 'auth.html';
}
*/

document.getElementById('logout-link').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.href = 'auth.html';
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
    const res = await fetch('AddContact.php', {
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

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
      setAddStatus(data.error || 'Add failed.');
      return;
    }

    document.getElementById('add-form').reset();
    setAddStatus('Contact added.');
    triggerSearch();
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
    const res = await fetch("SearchContacts.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search: query, userId : USER_ID })
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
