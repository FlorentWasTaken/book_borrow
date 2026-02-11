<script>
    import { register } from "../stores/auth";
    import { getErrorMessage } from "../utils/errorBox";

    let email = "";
    let password = "";
    let confirmPassword = "";
    let username = "";
    let error = "";
    let passwordStrength = 0;

    $: {
        passwordStrength = calculateStrength(password);
    }

    const calculateStrength = (pwd) => {
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };

    const generateStrongPassword = () => {
        const chars =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let newPassword = "";
        for (let i = 0; i < 16; i++) {
            newPassword += chars.charAt(
                Math.floor(Math.random() * chars.length),
            );
        }
        password = newPassword;
        confirmPassword = newPassword;
    };

    const handleRegister = async () => {
        error = "";
        if (password !== confirmPassword) {
            error = "Les mots de passe ne correspondent pas.";
            return;
        }
        // Reduced requirement: Allow "Moyen" (score 2) or higher
        if (passwordStrength < 2) {
            error = "Le mot de passe est trop faible.";
            return;
        }

        const result = await register(email, password, username);
        if (!result.success) {
            error = getErrorMessage(result.error);
        }
    };
</script>

<div class="auth-container">
    <h2>Inscription</h2>
    {#if error}
        <p class="error">{error}</p>
    {/if}
    <form on:submit|preventDefault={handleRegister}>
        <div class="form-group">
            <label for="username">Nom d'utilisateur :</label>
            <input type="text" id="username" bind:value={username} required />
        </div>
        <div class="form-group">
            <label for="email">Email :</label>
            <input type="email" id="email" bind:value={email} required />
        </div>

        <div class="form-group">
            <div class="label-row">
                <label for="password">Mot de passe :</label>
            </div>
            <input
                type="password"
                id="password"
                bind:value={password}
                required
            />

            <div class="strength-meter">
                <div
                    class="strength-bar"
                    style="width: {(passwordStrength / 4) *
                        100}%; background-color: {[
                        '#ddd',
                        '#ff4d4d',
                        '#ff9800',
                        '#2196f3',
                        '#4caf50',
                    ][passwordStrength]}"
                ></div>
            </div>
            <small class="strength-text">
                {#if passwordStrength === 0}Force du mot de passe
                {:else if passwordStrength < 2}Faible
                {:else if passwordStrength === 2}Moyen
                {:else}Fort{/if}
            </small>
        </div>

        <div class="form-group">
            <label for="confirmPassword">Confirmer le mot de passe :</label>
            <input
                type="password"
                id="confirmPassword"
                bind:value={confirmPassword}
                required
            />
        </div>

        <button type="submit" class="submit-btn">S'inscrire</button>
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
    .label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    label {
        margin-bottom: 0; /* Handled by label-row margin */
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

    .strength-meter {
        height: 4px;
        background-color: #eee;
        margin-top: 0.5rem;
        border-radius: 2px;
        overflow: hidden;
    }
    .strength-bar {
        height: 100%;
        transition:
            width 0.3s ease,
            background-color 0.3s ease;
    }
    .strength-text {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
        display: block;
        text-align: right;
    }

    .submit-btn {
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
    .submit-btn:hover {
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
        display: none;
        margin-bottom: 1.5rem;
        color: var(--text-color);
    }
</style>
