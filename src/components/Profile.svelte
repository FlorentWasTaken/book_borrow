<script>
    import { user, updateUser, updateUserPassword } from "../stores/auth";
    import { getErrorMessage } from "../utils/errorBox";
    import { db } from "../config/firebase";
    import { doc, updateDoc } from "firebase/firestore";
    import { addNotification } from "../stores/notifications";

    let displayName = $user?.displayName || "";
    let email = $user?.email || "";
    let inventoryVisibility = $user?.inventoryVisibility || "friends";

    let newPassword = "";
    let confirmNewPassword = "";

    const handleInfoUpdate = async () => {
        const result = await updateUser({
            displayName,
            email,
            inventoryVisibility,
        });

        if (result.success) {
            addNotification(
                "Informations mises à jour avec succès !",
                "success",
            );
        } else {
            if (result.error === "auth/requires-recent-login") {
                addNotification(
                    "Pour modifier ces informations sensibles (email), vous devez vous reconnecter.",
                    "error",
                );
            } else {
                addNotification(getErrorMessage(result.error), "error");
            }
        }
    };

    const handlePasswordUpdate = async () => {
        if (newPassword !== confirmNewPassword) {
            addNotification("Les mots de passe ne correspondent pas.", "error");
            return;
        }

        if (newPassword.length < 6) {
            addNotification("Le mot de passe est trop court.", "error");
            return;
        }

        const result = await updateUserPassword(newPassword);

        if (result.success) {
            addNotification("Mot de passe modifié avec succès !", "success");
            newPassword = "";
            confirmNewPassword = "";
        } else {
            if (result.error === "auth/requires-recent-login") {
                addNotification(
                    "Pour modifier votre mot de passe, vous devez vous reconnecter récemment par sécurité.",
                    "error",
                );
            } else {
                addNotification(getErrorMessage(result.error), "error");
            }
        }
    };
</script>

<div class="profile-container">
    <h2>Mon Profil</h2>

    <div class="profile-grid">
        <section class="profile-section">
            <h3>Informations</h3>
            <form on:submit|preventDefault={handleInfoUpdate}>
                <div class="form-group">
                    <label for="displayName">Nom d'affichage</label>
                    <input
                        type="text"
                        id="displayName"
                        bind:value={displayName}
                        required
                    />
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        bind:value={email}
                        required
                    />
                </div>
                <div class="form-group">
                    <label for="visibility">Visibilité de mon inventaire</label>
                    <select id="visibility" bind:value={inventoryVisibility}>
                        <option value="public">Public (Tout le monde)</option>
                        <option value="friends">Amis uniquement</option>
                        <option value="private">Privé (Personne)</option>
                    </select>
                </div>
                <button type="submit" class="submit-btn primary"
                    >Enregistrer</button
                >
            </form>
        </section>

        <!-- Vertical divider for desktop, horizontal for mobile -->
        <div class="divider-container">
            <hr class="divider" />
        </div>

        <section class="profile-section">
            <h3>Sécurité</h3>
            <form on:submit|preventDefault={handlePasswordUpdate}>
                <div class="form-group">
                    <label for="newPassword">Nouveau mot de passe</label>
                    <input
                        type="password"
                        id="newPassword"
                        bind:value={newPassword}
                        placeholder="••••••••"
                    />
                </div>
                <div class="form-group">
                    <label for="confirmNewPassword">Confirmer</label>
                    <input
                        type="password"
                        id="confirmNewPassword"
                        bind:value={confirmNewPassword}
                        placeholder="••••••••"
                    />
                </div>
                <button type="submit" class="submit-btn secondary"
                    >Changer le mot de passe</button
                >
            </form>
        </section>
    </div>
</div>

<style>
    .profile-container {
        padding: 1.5rem;
        background-color: var(--card-bg);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 900px; /* Increased to allow side-by-side */
        margin: 0 auto;
        text-align: left;
    }

    h2 {
        color: var(--primary);
        margin-bottom: 1rem;
        text-align: center;
        font-size: 1.5rem;
    }

    .profile-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    @media (min-width: 768px) {
        .profile-grid {
            flex-direction: row;
            gap: 2rem;
        }

        .profile-section {
            flex: 1;
        }

        .divider-container {
            width: 1px;
            background-color: var(--text-muted);
            opacity: 0.2;
            display: block;
            margin: 0;
        }

        .divider {
            display: none; /* Hide horizontal divider in flex mode */
        }
    }

    h3 {
        margin-bottom: 0.75rem;
        font-size: 1.1rem;
        color: var(--text-color);
        border-bottom: 2px solid var(--primary);
        padding-bottom: 0.25rem;
        display: inline-block;
    }

    .profile-section {
        margin-bottom: 0;
    }

    .divider {
        border: 0;
        border-top: 1px solid var(--text-muted);
        margin: 1rem 0;
        opacity: 0.2;
    }

    .form-group {
        margin-bottom: 0.75rem;
    }

    label {
        display: block;
        margin-bottom: 0.25rem;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-color);
    }

    input,
    select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.95rem;
        background-color: var(--bg-color);
        color: var(--text-color);
    }

    input:focus,
    select:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(255, 62, 0, 0.1);
    }

    .submit-btn {
        width: 100%;
        padding: 0.6rem;
        border: none;
        border-radius: 4px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
        margin-top: 0.5rem;
    }

    .submit-btn.primary {
        background-color: var(--primary);
        color: white;
    }

    .submit-btn.primary:hover {
        background-color: var(--primary-hover);
    }

    .submit-btn.secondary {
        background-color: var(--bg-color);
        color: var(--text-color);
        border: 1px solid #ddd;
    }

    .submit-btn.secondary:hover {
        background-color: #e0e0e0;
    }
</style>
