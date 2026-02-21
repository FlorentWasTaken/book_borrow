<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { user } from "../stores/auth";
    import {
        friends,
        listenToFriends,
        isLoadingFriends,
    } from "../stores/friends";

    export let isOpen = false;
    export let title = "Sélectionner un ami";

    let selectedUserId = "";
    const dispatch = createEventDispatcher();

    $: if ($user && isOpen) {
        listenToFriends($user.uid);
    }

    $: filteredUsers = $friends.filter((u) => u.id !== $user?.uid);

    function handleSubmit() {
        if (selectedUserId) {
            const selectedUser = filteredUsers.find(
                (u) => u.id === selectedUserId,
            );
            if (selectedUser) {
                dispatch("select", { user: selectedUser });
                selectedUserId = "";
                isOpen = false;
            }
        }
    }

    function handleClose() {
        isOpen = false;
    }
</script>

{#if isOpen}
    <div
        class="modal-backdrop"
        on:click={handleClose}
        on:keydown={(e) => e.key === "Escape" && handleClose()}
        role="button"
        tabindex="0"
    >
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <div class="modal-content" on:click|stopPropagation role="document">
            <h2>{title}</h2>
            <form on:submit|preventDefault={handleSubmit}>
                <div class="form-group">
                    <label for="user-select">Utilisateur :</label>
                    <select
                        id="user-select"
                        bind:value={selectedUserId}
                        required
                        disabled={$isLoadingFriends}
                    >
                        <option value="" disabled selected
                            >-- Choisir un ami --</option
                        >
                        {#if $isLoadingFriends}
                            <option disabled>Chargement de vos amis...</option>
                        {:else if filteredUsers.length === 0}
                            <option disabled
                                >Vous n'avez pas encore d'amis.</option
                            >
                        {:else}
                            {#each filteredUsers as u}
                                <option value={u.id}
                                    >{u.username || u.email}</option
                                >
                            {/each}
                        {/if}
                    </select>
                </div>
                <div class="actions">
                    <button type="button" on:click={handleClose}>Annuler</button
                    >
                    <button
                        type="submit"
                        class="primary"
                        disabled={!selectedUserId}>Valider</button
                    >
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: var(--card-bg, #fff);
        padding: 2rem;
        border-radius: 8px;
        width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        color: var(--text-color, #333);
    }

    h2 {
        margin-top: 0;
        color: var(--primary, #007bff);
    }

    .form-group {
        margin-bottom: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
    }

    select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
    }

    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background: #f0f0f0;
        color: #333;
    }

    button.primary {
        background: var(--primary, #007bff);
        color: white;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    button:hover:not(:disabled) {
        opacity: 0.9;
    }
</style>
