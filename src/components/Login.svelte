<script>
    import { login } from '../stores/auth';
    import { getErrorMessage } from '../utils/errorBox';

    let email = '';
    let password = '';
    let error = '';

    const handleLogin = async () => {
        error = '';
        const result = await login(email, password);
        if (!result.success) {
            error = getErrorMessage(result.error);
        }
    };
</script>

<div class="auth-container">
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
            <input type="password" id="password" bind:value={password} required />
        </div>
        <button type="submit">Se connecter</button>
    </form>
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
        transition: border-color 0.2s, box-shadow 0.2s;
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
</style>
