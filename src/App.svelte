<script>
  import { onMount } from "svelte";
  import { Router, Route, navigate, link } from "svelte-routing";
  import { app } from "./config/firebase.js";
  import { user, logout, isLoading } from "./stores/auth.js";
  import Login from "./components/Login.svelte";
  import Register from "./components/Register.svelte";
  import Loader from "./components/Loader.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import Profile from "./components/Profile.svelte";
  import AdminPanel from "./components/AdminPanel.svelte";

  console.log("Firebase from Svelte:", app);

  let isDarkMode = false;
  let isSidebarOpen = false;
  let connectionError = false;
  export let url = "";

  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (
      args[0] &&
      typeof args[0] === "string" &&
      args[0].includes("Firestore Error or Timeout")
    ) {
      connectionError = true;
    }
    originalConsoleError.apply(console, args);
  };

  onMount(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      isDarkMode = savedTheme === "dark";
    } else {
      isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    updateTheme();
  });

  $: if (!$isLoading) {
    if (
      $user &&
      (window.location.pathname === "/login" ||
        window.location.pathname === "/register")
    ) {
      navigate("/", { replace: true });
    } else if (
      !$user &&
      (window.location.pathname === "/" ||
        window.location.pathname === "/profile")
    ) {
      navigate("/login", { replace: true });
    }
  }

  const toggleTheme = () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    updateTheme();
  };

  const updateTheme = () => {
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };
</script>

<button
  class="theme-toggle"
  on:click={toggleTheme}
  aria-label="Toggle Dark Mode"
>
  {isDarkMode ? "☀️" : "🌙"}
</button>

{#if $isLoading}
  <Loader message="Vérification de l'authentification..." />
{:else}
  <Router {url}>
    <div class="app-layout">
      {#if $user}
        <Sidebar bind:isOpen={isSidebarOpen} />
      {/if}

      <main class:with-sidebar={$user}>
        {#if connectionError}
          <div class="connection-banner">
            <p>
              ⚠️ <strong>Connexion Base de données bloquée</strong> : Une extension
              (AdBlock, uBlock...) empêche le chargement complet.
            </p>
            <button on:click={() => (connectionError = false)}>OK</button>
          </div>
        {/if}
        <div class="card">
          <header>
            <img
              src="/src/assets/logo.svg"
              alt="Book Borrow Logo"
              class="logo"
            />
            <h1>Book Borrow</h1>
            <p class="subtitle">Emprunt de livres simplifié</p>
          </header>

          <div class="content">
            <Route path="/">
              {#if $user}
                <div class="user-panel">
                  <p>
                    Bienvenue, <strong
                      >{$user.displayName || $user.email}</strong
                    >
                    !
                  </p>
                  <!-- Logout button moved to Sidebar -->
                </div>
              {:else}
                <p>Redirection...</p>
              {/if}
            </Route>

            <Route path="/profile">
              <Profile />
            </Route>

            <Route path="/admin">
              <AdminPanel />
            </Route>

            <Route path="/login">
              <Login />
              <p class="switch-mode">
                Pas encore de compte ? <a
                  href="/register"
                  use:link
                  class="link-button">S'inscrire</a
                >
              </p>
            </Route>

            <Route path="/register">
              <Register />
              <p class="switch-mode">
                Vous avez déjà un compte ? <a
                  href="/login"
                  use:link
                  class="link-button">Se connecter</a
                >
              </p>
            </Route>
          </div>
        </div>
      </main>
    </div>
  </Router>
{/if}

<style>
  .theme-toggle {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: var(--card-bg);
    border: 1px solid var(--text-muted);
    color: var(--text-color);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: var(--box-shadow);
    z-index: 100;
  }
  .theme-toggle:hover {
    transform: scale(1.1);
  }
  .app-layout {
    display: flex;
    min-height: 100vh;
  }

  main {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center; /* Center vertically */
    padding: 2rem;
    width: 100%;
    position: relative;
    flex-direction: column; /* Allow banner to stack */
    align-items: center; /* Center banner */
    height: 100vh; /* Force full height */
    overflow: hidden; /* Prevent scroll on main body if not needed */
  }

  .connection-banner {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeeba;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    width: 100%;
    max-width: 600px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .connection-banner p {
    margin: 0;
    font-size: 0.9rem;
  }

  .connection-banner button {
    background: none;
    border: 1px solid #856404;
    color: #856404;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    margin-left: 1rem;
  }

  .connection-banner button:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  main.with-sidebar {
    /* This rule was incomplete in the instruction, keeping existing properties */
  }

  .card {
    background: var(--card-bg);
    padding: 2.5rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    width: 100%;
    max-width: 900px; /* Wider to accommodate side-by-side profile */
    text-align: center;
    max-height: 90vh; /* Ensure card fits in viewport */
    overflow-y: auto; /* Scroll inside card if content is too long */
  }

  header {
    margin-bottom: 2rem;
  }

  .logo {
    width: 80px;
    height: auto;
    margin-bottom: 1rem;
  }

  h1 {
    color: var(--primary);
    text-transform: uppercase;
    font-size: 2.5rem;
    font-family: "Montserrat", sans-serif;
    font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin: 0;
  }

  .user-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .switch-mode {
    margin-top: 1.5rem;
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .link-button {
    background: none;
    border: none;
    color: var(--primary);
    cursor: pointer;
    padding: 0;
    font-size: inherit;
    font-weight: 600;
    margin-left: 0.25rem;
  }

  .link-button:hover {
    text-decoration: underline;
    color: var(--primary-hover);
  }
</style>
