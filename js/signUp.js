const form = document.getElementById("signup-form");
const statusEl = document.getElementById("signup-status");
const btn = document.getElementById("signup-btn");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.textContent = "";

  const username = document.getElementById("signup-username").value.trim();
  const first = document.getElementById("signup-firstname").value.trim();
  const last = document.getElementById("signup-lastname").value.trim();
  const pass = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (!username) { statusEl.textContent = "Please enter a username."; return; }
  if (!first) { statusEl.textContent = "Please enter your first name."; return; }
  if (!last) { statusEl.textContent = "Please enter your last name."; return; }
  if (!pass || !confirm) { statusEl.textContent = "Please enter and confirm your password."; return; }
  if (pass !== confirm) { statusEl.textContent = "Passwords do not match."; return; }

  btn.disabled = true;

  try {
    const res = await fetch("RegisterUser.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userName: username,
        firstName: first,
        lastName: last,
        password: pass
      })
    });

    let data = null;
    try {
      data = await res.json();
    } catch (_) {
      data = {};
    }

    if (!res.ok) {
      statusEl.textContent = data.error || (res.status === 409
        ? "Username already in use."
        : "Sign up failed.");
      return;
    }

    statusEl.textContent = "Account created successfully.";
    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Unexpected error. Please try again.";
  } finally {
    btn.disabled = false;
  }
});
