<script>
  import { onMount } from "svelte";
  import { Router, Route, navigate, link } from "svelte-routing";
  import { app } from "./config/firebase.js";
  import { user, logout, isLoading } from "./stores/auth.js";
  import Login from "./components/Login.svelte";
  import Register from "./components/Register.svelte";
  import Loader from "./components/Loader.svelte";

  console.log("Firebase from Svelte:", app);

  let isDarkMode = false;
  export let url = ""; // for SSR purposes if needed, good practice with svelte-routing

  onMount(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      isDarkMode = savedTheme === "dark";
    } else {
      isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    updateTheme();
  });

  // Reactive statement to handle redirects based on auth state
  $: if (!$isLoading) {
    if (
      $user &&
      (window.location.pathname === "/login" ||
        window.location.pathname === "/register")
    ) {
      navigate("/", { replace: true });
    } else if (!$user && window.location.pathname === "/") {
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
    <main>
      <div class="card">
        <header>
          <h1>Book Borrow</h1>
          <p class="subtitle">Emprunt de livres simplifié</p>
        </header>

        <div class="content">
          <Route path="/">
            {#if $user}
              <div class="user-panel">
                <p>
                  Bienvenue, <strong>{$user.displayName || $user.email}</strong>
                  !
                </p>
                <button class="primary-btn" on:click={logout}
                  >Se déconnecter</button
                >
              </div>
            {:else}
              <p>Redirection...</p>
            {/if}
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

  main {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 1rem;
  }

  .card {
    background: var(--card-bg);
    padding: 2.5rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    width: 100%;
    max-width: 400px;
    text-align: center;
  }

  header {
    margin-bottom: 2rem;
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

  .primary-btn {
    background-color: var(--primary);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    font-size: 1rem;
    font-weight: 600;
  }

  .primary-btn:hover {
    background-color: var(--primary-hover);
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
