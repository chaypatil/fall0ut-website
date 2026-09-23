/* Shared helpers for the ticketing portal: the Supabase client, the sign-in
 * gate, and the small utilities every page needs.
 *
 * Loaded after config.js and the Supabase UMD bundle.
 */
(function () {
  const config = window.FALLOUT_PORTAL_CONFIG || {};
  const configured =
    config.supabaseUrl &&
    config.supabaseAnonKey &&
    !config.supabaseUrl.startsWith("PASTE_") &&
    !config.supabaseAnonKey.startsWith("PASTE_");

  const client = configured
    ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : null;

  function money(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toast(message, tone) {
    let el = document.querySelector("[data-toast]");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("data-toast", "");
      document.body.append(el);
    }
    el.textContent = message;
    el.className = `toast is-visible${tone ? ` toast--${tone}` : ""}`;
    window.clearTimeout(toast._timer);
    toast._timer = window.setTimeout(() => {
      el.className = "toast";
    }, 3600);
  }

  /* Wraps a page so its contents only run for a signed-in member of staff.
   * Renders the sign-in form itself, so no page has to think about auth. */
  async function requireStaff(onReady) {
    const gate = document.querySelector("[data-auth-gate]");
    const app = document.querySelector("[data-app]");

    if (!configured) {
      gate.innerHTML = `
        <div class="card card--notice">
          <h2>Portal not connected yet</h2>
          <p>Add the Supabase project URL and anon key to <code>portal/config.js</code>, then reload.</p>
        </div>`;
      gate.hidden = false;
      return;
    }

    const { data } = await client.auth.getSession();

    if (data.session) {
      gate.hidden = true;
      app.hidden = false;
      onReady(data.session);
      return;
    }

    gate.hidden = false;
    app.hidden = true;
    gate.innerHTML = `
      <form class="card" data-signin>
        <h2>Staff sign in</h2>
        <label>Email<input type="email" name="email" required autocomplete="username" /></label>
        <label>Password<input type="password" name="password" required autocomplete="current-password" /></label>
        <button class="btn btn--primary" type="submit">Sign in</button>
        <p class="hint">Accounts are created in Supabase. There is no public sign-up.</p>
      </form>`;

    gate.querySelector("[data-signin]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector("button");
      button.disabled = true;
      button.textContent = "Signing in…";

      const { error } = await client.auth.signInWithPassword({
        email: form.email.value.trim(),
        password: form.password.value,
      });

      if (error) {
        button.disabled = false;
        button.textContent = "Sign in";
        toast(error.message, "bad");
        return;
      }
      window.location.reload();
    });
  }

  async function signOut() {
    if (client) await client.auth.signOut();
    window.location.reload();
  }

  window.Portal = { client, config, configured, money, escapeHtml, toast, requireStaff, signOut };
})();
