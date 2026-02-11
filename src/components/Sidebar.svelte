<script>
    import { link } from "svelte-routing";
    import { logout, user } from "../stores/auth";

    export let isOpen = false;
    let isCollapsed = false;

    const toggleCollapse = () => {
        isCollapsed = !isCollapsed;
    };
</script>

<aside class:open={isOpen} class:collapsed={isCollapsed}>
    <div class="toggle-btn-container">
        <button
            on:click={toggleCollapse}
            class="toggle-btn"
            aria-label="Toggle Sidebar"
        >
            {#if isCollapsed}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><polyline points="13 17 18 12 13 7"></polyline><polyline
                        points="6 17 11 12 6 7"
                    ></polyline></svg
                >
            {:else}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><polyline points="11 17 6 12 11 7"></polyline><polyline
                        points="18 17 13 12 18 7"
                    ></polyline></svg
                >
            {/if}
        </button>
    </div>

    <nav>
        <ul>
            <li>
                <a
                    href="/"
                    use:link
                    on:click={() => (isOpen = false)}
                    title="Accueil"
                >
                    <span class="icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path
                                d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                            ></path><polyline points="9 22 9 12 15 12 15 22"
                            ></polyline></svg
                        >
                    </span>
                    <span class="label" class:hidden={isCollapsed}>Accueil</span
                    >
                </a>
            </li>
            <li>
                <a
                    href="/profile"
                    use:link
                    on:click={() => (isOpen = false)}
                    title="Mon Profil"
                >
                    <span class="icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                            ></path><circle cx="12" cy="7" r="4"></circle></svg
                        >
                    </span>
                    <span class="label" class:hidden={isCollapsed}
                        >Mon Profil</span
                    >
                </a>
            </li>
            {#if $user && $user.role === "admin"}
                <li>
                    <a
                        href="/admin"
                        use:link
                        on:click={() => (isOpen = false)}
                        title="Admin Panel"
                    >
                        <span class="icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                ><path
                                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                                ></path></svg
                            >
                        </span>
                        <span class="label" class:hidden={isCollapsed}
                            >Admin</span
                        >
                    </a>
                </li>
            {/if}
            <!-- Add more links here -->
            <li class="spacer"></li>
            <li>
                <button
                    on:click={logout}
                    class="logout-btn"
                    title="Déconnexion"
                >
                    <span class="icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h4"
                            ></path><polyline points="16 17 21 12 16 7"
                            ></polyline><line x1="21" y1="12" x2="9" y2="12"
                            ></line></svg
                        >
                    </span>
                    <span class="label" class:hidden={isCollapsed}
                        >Déconnexion</span
                    >
                </button>
            </li>
        </ul>
    </nav>
</aside>

<style>
    aside {
        width: 200px;
        background-color: var(--card-bg);
        height: 100vh;
        position: fixed;
        left: 0;
        top: 0;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        padding: 1rem;
        transform: translateX(-100%);
        transition:
            transform 0.3s ease-in-out,
            width 0.3s ease-in-out;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--border-color, #eee);
    }

    aside.open {
        transform: translateX(0);
    }

    aside.collapsed {
        width: 60px;
    }

    /* Desktop view */
    @media (min-width: 768px) {
        aside {
            transform: translateX(0);
            position: sticky;
            top: 0;
            height: 100vh;
        }
    }

    .toggle-btn-container {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 2rem;
    }

    .toggle-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        color: var(--text-color);
        border-radius: 4px;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .toggle-btn:hover {
        background-color: rgba(0, 0, 0, 0.05);
        color: var(--primary);
    }

    nav {
        flex-grow: 1;
    }

    ul {
        list-style: none;
        padding: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    li {
        margin-bottom: 0.5rem;
    }

    .spacer {
        flex-grow: 1;
    }

    a,
    button {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        color: var(--text-color);
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.2s;
        width: 100%;
        font-size: 1rem;
        border: none;
        background: none;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
    }

    aside.collapsed a,
    aside.collapsed button {
        justify-content: center;
        padding: 0.75rem 0;
    }

    a:hover,
    button:hover {
        background-color: rgba(0, 0, 0, 0.05);
        color: var(--primary);
        transform: translateX(4px);
    }

    aside.collapsed a:hover,
    aside.collapsed button:hover {
        transform: none;
    }

    .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        margin-right: 1rem;
        transition: margin 0.3s;
    }

    aside.collapsed .icon {
        margin-right: 0;
    }

    .label {
        opacity: 1;
        transition: opacity 0.2s ease-in-out;
    }

    .label.hidden {
        opacity: 0;
        width: 0;
        display: none;
    }

    .logout-btn {
        color: #d32f2f;
    }

    .logout-btn:hover {
        background-color: #ffebee;
        color: #b71c1c;
    }
</style>
