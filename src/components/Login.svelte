<script>
    import { login } from "../stores/auth";
    import { getErrorMessage } from "../utils/errorBox";
    import { sendPasswordResetEmail } from "firebase/auth";
    import { auth } from "../config/firebase";

    let email = "";
    let password = "";
    let error = "";
    let message = "";
    let loading = false;
    let isResettingPassword = false;

    const handleLogin = async () => {
        error = "";
        loading = true;
        const result = await login(email, password);
        loading = false;
        if (!result.success) {
            error = getErrorMessage(result.error);
        }
    };

    const handleResetPassword = async () => {
        error = "";
        message = "";
        loading = true;
        try {
            await sendPasswordResetEmail(auth, email);
            message =
                "Email envoyé ! Pensez à vérifier vos SPAMS/Indésirables.";
        } catch (e) {
            error = getErrorMessage(e.code);
        }
        loading = false;
    };
</script>

<div class="auth-container">
    {#if isResettingPassword}
        <h2>Réinitialisation</h2>
        {#if message}
            <p class="success">{message}</p>
        {/if}
        {#if error}
            <p class="error">{error}</p>
        {/if}
        <form on:submit|preventDefault={handleResetPassword}>
            <p class="info-text">
                Entrez votre email pour recevoir un lien de réinitialisation.
            </p>
            <div class="form-group">
                <label for="reset-email">Email :</label>
                <input
                    type="email"
                    id="reset-email"
                    bind:value={email}
                    required
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? "Envoi..." : "Envoyer le lien"}
            </button>
            <button
                type="button"
                class="secondary-btn"
                on:click={() => {
                    isResettingPassword = false;
                    error = "";
                    message = "";
                }}
            >
                Retour à la connexion
            </button>
        </form>
    {:else}
        <h2>Connexion</h2>
        {#if error}
            <p class="error">{error}</p>
        {/if}
        <form on:submit|preventDefault={handleLogin}>
            <div class="form-group">
                <label for="email">Email :</label>
                <input type="email" id="email" bind:value={email} required />
            </div>
            <div class="form-group">
                <label for="password">Mot de passe :</label>
                <input
                    type="password"
                    id="password"
                    bind:value={password}
                    required
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? "Chargement..." : "Se connecter"}
            </button>
            <button
                type="button"
                class="link-btn"
                on:click={() => {
                    isResettingPassword = true;
                    error = "";
                    message = "";
                }}
            >
                Mot de passe oublié ?
            </button>
        </form>
    {/if}
</div>

<style>
    .auth-container {
        width: 100%;
    }
    .form-group {
        margin-bottom: 1.5rem;
        text-align: left;
    }
    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--text-color);
        font-size: 0.9rem;
    }
    input {
        width: 100%;
        padding: 0.75rem;
        box-sizing: border-box;
        border: 1px solid #ddd;
        border-radius: var(--border-radius);
        font-size: 1rem;
        transition:
            border-color 0.2s,
            box-shadow 0.2s;
    }
    input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.1);
    }
    button {
        width: 100%;
        padding: 0.85rem;
        background-color: var(--primary);
        color: white;
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        margin-top: 0.5rem;
    }
    button:hover {
        background-color: var(--primary-hover);
    }
    .error {
        color: #d32f2f;
        background-color: #ffebee;
        padding: 0.75rem;
        border-radius: var(--border-radius);
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
        border: 1px solid #ffcdd2;
    }
    h2 {
        display: none; /* Hidden as it is in the main card header now ideally, but keeping standard if needed, removing for cleaner card look inside main */
        margin-bottom: 1.5rem;
        color: var(--text-color);
    }

    .secondary-btn {
        background-color: transparent;
        border: 1px solid var(--primary);
        color: var(--primary);
        margin-top: 0.5rem;
    }

    .secondary-btn:hover {
        background-color: var(--primary);
        color: white;
    }

    .link-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        font-size: 0.9rem;
        text-decoration: underline;
        cursor: pointer;
        padding: 0.5rem;
        width: auto;
        margin: 0.5rem auto 0;
        display: block;
    }

    .link-btn:hover {
        color: var(--primary);
        background: none;
    }

    .info-text {
        margin-bottom: 1rem;
        color: var(--text-color);
        font-size: 0.95rem;
    }

    .success {
        color: #2e7d32;
        background-color: #e8f5e9;
        padding: 0.75rem;
        border-radius: var(--border-radius);
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
        border: 1px solid #c8e6c9;
    }
</style>
