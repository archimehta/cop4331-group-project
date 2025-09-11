// Redirect to sign-up page when sign-up box is submitted
document.getElementById("signup-box").addEventListener("submit", (e) => {
  e.preventDefault();
  window.location.href = "signup.html";
});

// Handle Sign In
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const statusEl = document.getElementById("login-status");
  statusEl.textContent = "";

  const username = document.getElementById("li-username").value.trim();
  const password = document.getElementById("li-password").value;

  if (!username) {
    statusEl.textContent = "Please enter your username.";
    return;
  }

  if (!password) {
    statusEl.textContent = "Please enter your password.";
    return;
  }

  try {
    const res = await fetch("HashedLogin.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.error) {
      statusEl.textContent = data.error || "Login failed.";
      return;
    }

    window.location.href = "dash.html";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Unexpected error during login.";
  }
});
