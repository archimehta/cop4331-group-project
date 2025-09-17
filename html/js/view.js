
  // require login
  const userId = Number(localStorage.getItem("userId")) || 0;
  if (!userId) {
    window.location.href = "index.html";
  }

  // logout
  document.getElementById("logout-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "index.html";
  });

  //get contact id
  const params = new URLSearchParams(location.search);
  const contactId = Number(params.get("id"));
  if (!contactId) {
    alert("Missing contact id.");
    window.location.href = "index.html";
  }

  // stuff that is important
  const emailEl = document.getElementById("email");
  const phoneEl = document.getElementById("phone");
  const firstEl = document.getElementById("first_name");
  const lastEl  = document.getElementById("last_name");

  // rendering one contact
  function renderContact(c) {
    firstEl.value = c.FirstName || "";
    lastEl.value  = c.LastName  || "";
    phoneEl.value = c.Phone     || "";
    emailEl.value = c.Email     || "";
  }

  // loading all and getting one
  async function loadAndRender() {
    try {
      const res = await fetch("/LAMPAPI/SearchContacts.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search: "", userId }) // gets all for the user
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        throw new Error(data.error || "Request failed");
      }

      const list = Array.isArray(data.results) ? data.results : [];

      // dashboard using database id
      const found = list.find(
        (c) => Number(c.databaseId ?? c.ID) === contactId
      );

      if (!found) {
        alert("Contact not found.");
        window.location.href = "index.html";
        return;
      }

      renderContact(found);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Unable to load contact.");
      window.location.href = "index.html";
    }
  }

  loadAndRender();
