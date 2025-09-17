// need log in
  const userId = Number(localStorage.getItem("userId")) || 0;
  if (!userId) {
    window.location.href = "index.html";
  }

  // log out
  document.getElementById("logout-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "index.html";
  });

  // contact id
  const params = new URLSearchParams(location.search);
  const contactId = Number(params.get("id"));
  if (!contactId) {
    alert("Missing contact id.");
    window.location.href = "editAll.html";
  }

  // important stuff
  const form     = document.getElementById("edit-form");
  const firstEl  = document.getElementById("first_name");
  const lastEl   = document.getElementById("last_name");
  const phoneEl  = document.getElementById("phone");
  const emailEl  = document.getElementById("email");
  const delBtn   = document.querySelector(".delete-btn");

  // fill in stuff
  function fillForm(c) {
    // FirstName, LastName, Phone, Email, databaseId
    firstEl.value = c.FirstName || "";
    lastEl.value  = c.LastName  || "";
    phoneEl.value = c.Phone     || "";
    emailEl.value = c.Email     || "";
  }

  async function loadContact() {
    // get all then filter to one
    const res = await fetch("/LAMPAPI/SearchContacts.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search: "", userId })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) throw new Error(data.error || "Failed to load contact list.");

    const list = Array.isArray(data.results) ? data.results : [];
    const found = list.find(c => Number(c.databaseId ?? c.ID) === contactId);
    if (!found) throw new Error("Contact not found.");

    fillForm(found);
  }

  // save
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      firstName:  firstEl.value.trim(),
      lastName:   lastEl.value.trim(),
      phone:      phoneEl.value.trim(),
      email:      emailEl.value.trim(),
      databaseId: contactId
    };

    try {
      const res = await fetch("/LAMPAPI/EditContact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error || "Update failed.");

      alert("Contact updated.");
      window.location.href = "editAll.html";
    } catch (err) {
      console.error(err);
      alert(err?.message || "Unable to update contact.");
    }
  });

  // delete
  delBtn.addEventListener("click", async () => {
    if (!confirm("Delete this contact? This cannot be undone.")) return;

    try {
      const res = await fetch("/LAMPAPI/DeleteContact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ databaseId: contactId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error || "Delete failed.");

      alert("Contact deleted.");
      window.location.href = "editAll.html";
    } catch (err) {
      console.error(err);
      alert(err?.message || "Unable to delete contact.");
    }
  });

  // init
  (async function init() {
    try {
      await loadContact();
    } catch (err) {
      console.error(err);
      alert(err?.message || "Unable to load contact.");
      window.location.href = "editAll.html";
    }
  })();