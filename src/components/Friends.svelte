<script>
    import { onMount, onDestroy } from "svelte";
    import { navigate } from "svelte-routing";
    import { user } from "../stores/auth";
    import {
        friends,
        friendRequests,
        isLoadingFriends,
        listenToFriends,
        listenToFriendRequests,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
    } from "../stores/friends";
    import { getAllUsers } from "../stores/books";
    import Loader from "./Loader.svelte";

    let activeTab = "friends";
    let allUsers = [];
    let searchQuery = "";
    let isSearching = false;
    let error = "";
    let successMsg = "";

    $: if ($user) {
        listenToFriends($user.uid);
        listenToFriendRequests($user.uid);
    }

    $: pendingRequestsCount = $friendRequests.length;

    const loadAllUsers = async () => {
        isSearching = true;
        allUsers = await getAllUsers();
        isSearching = false;
    };

    $: if (activeTab === "add" && allUsers.length === 0) {
        loadAllUsers();
    }

    $: availableUsers = allUsers.filter(
        (u) =>
            u.id !== $user?.uid &&
            !$friends.some((f) => f.id === u.id) &&
            (u.username || u.email)
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    const handleSendRequest = async (receiverId) => {
        const result = await sendFriendRequest(receiverId);
        if (result.success) {
            successMsg = "Demande d'ami envoyée !";
            setTimeout(() => (successMsg = ""), 3000);
        } else {
            error = result.error;
            setTimeout(() => (error = ""), 3000);
        }
    };

    const handleAccept = async (requestId, senderId) => {
        const result = await acceptFriendRequest(requestId, senderId);
        if (!result.success) error = result.error;
    };

    const handleReject = async (requestId) => {
        const result = await rejectFriendRequest(requestId);
        if (!result.success) error = result.error;
    };

    const handleRemove = async (friendId) => {
        if (confirm("Êtes-vous sûr de vouloir retirer cet ami ?")) {
            const result = await removeFriend(friendId);
            if (!result.success) error = result.error;
        }
    };
</script>

<div class="friends-container">
    <header class="friends-header">
        <h1>Gérer mes amis</h1>
    </header>

    {#if error}
        <div class="error-banner">
            {error}
            <button on:click={() => (error = "")}>x</button>
        </div>
    {/if}
    {#if successMsg}
        <div class="success-banner">
            {successMsg}
            <button on:click={() => (successMsg = "")}>x</button>
        </div>
    {/if}

    <div class="tabs">
        <button
            class:active={activeTab === "friends"}
            on:click={() => (activeTab = "friends")}
            >Mes Amis ({$friends.length})</button
        >
        <button
            class:active={activeTab === "requests"}
            on:click={() => (activeTab = "requests")}
        >
            Demandes
            {#if pendingRequestsCount > 0}
                <span class="badge">{pendingRequestsCount}</span>
            {/if}
        </button>
        <button
            class:active={activeTab === "add"}
            on:click={() => (activeTab = "add")}>Ajouter un ami</button
        >
    </div>

    <div class="tab-content">
        {#if activeTab === "friends"}
            {#if $isLoadingFriends}
                <Loader message="Chargement des amis..." />
            {:else if $friends.length === 0}
                <div class="empty-state">
                    <p>Vous n'avez pas encore d'amis dans votre liste.</p>
                    <button class="primary" on:click={() => (activeTab = "add")}
                        >Trouver des amis</button
                    >
                </div>
            {:else}
                <ul class="user-list">
                    {#each $friends as friend}
                        <li class="user-item">
                            <div class="user-info">
                                <span class="avatar"
                                    >{(friend.username || friend.email)
                                        .charAt(0)
                                        .toUpperCase()}</span
                                >
                                <span class="name"
                                    >{friend.username || friend.email}</span
                                >
                            </div>
                            <div class="actions">
                                <button
                                    class="primary-btn"
                                    on:click={() =>
                                        navigate(`/inventory/${friend.id}`)}
                                    >Voir l'inventaire</button
                                >
                                <button
                                    class="secondary-btn"
                                    on:click={() =>
                                        navigate(
                                            `/friend-wishlist/${friend.id}`,
                                        )}>Voir la wishlist</button
                                >
                                <button
                                    class="danger-btn"
                                    on:click={() => handleRemove(friend.id)}
                                    >Retirer</button
                                >
                            </div>
                        </li>
                    {/each}
                </ul>
            {/if}
        {:else if activeTab === "requests"}
            {#if $friendRequests.length === 0}
                <div class="empty-state">
                    <p>Aucune demande d'ami en attente.</p>
                </div>
            {:else}
                <ul class="user-list">
                    {#each $friendRequests as req}
                        <li class="user-item">
                            <div class="user-info">
                                <span class="avatar"
                                    >{req.sender
                                        ? (
                                              req.sender.username ||
                                              req.sender.email
                                          )
                                              .charAt(0)
                                              .toUpperCase()
                                        : "?"}</span
                                >
                                <span class="name"
                                    >{req.sender
                                        ? req.sender.username ||
                                          req.sender.email
                                        : "Utilisateur inconnu"}</span
                                >
                            </div>
                            <div class="actions">
                                <button
                                    class="success-btn"
                                    on:click={() =>
                                        handleAccept(req.id, req.senderId)}
                                    >Accepter</button
                                >
                                <button
                                    class="danger-btn"
                                    on:click={() => handleReject(req.id)}
                                    >Refuser</button
                                >
                            </div>
                        </li>
                    {/each}
                </ul>
            {/if}
        {:else if activeTab === "add"}
            <div class="search-bar">
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Rechercher par nom ou email..."
                />
            </div>

            {#if isSearching}
                <Loader message="Recherche des utilisateurs..." />
            {:else if availableUsers.length === 0}
                <div class="empty-state">
                    <p>Aucun utilisateur trouvé.</p>
                </div>
            {:else}
                <ul class="user-list">
                    {#each availableUsers as u}
                        <li class="user-item">
                            <div class="user-info">
                                <span class="avatar"
                                    >{(u.username || u.email)
                                        .charAt(0)
                                        .toUpperCase()}</span
                                >
                                <span class="name">{u.username || u.email}</span
                                >
                            </div>
                            <button
                                class="primary-btn"
                                on:click={() => handleSendRequest(u.id)}
                                >Ajouter</button
                            >
                        </li>
                    {/each}
                </ul>
            {/if}
        {/if}
    </div>
</div>

<style>
    .friends-container {
        padding: 2rem;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
    }

    .friends-header {
        margin-bottom: 2rem;
        border-bottom: 2px solid var(--text-muted);
        padding-bottom: 1rem;
    }

    h1 {
        font-size: 2.5rem;
        color: var(--text-color);
        margin: 0;
        font-family: "Montserrat", sans-serif;
    }

    .tabs {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        border-bottom: 1px solid var(--border-color, #eee);
        padding-bottom: 0px;
    }

    .tabs button {
        background: none;
        border: none;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        color: var(--text-muted);
        cursor: pointer;
        border-bottom: 3px solid transparent;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .tabs button.active {
        color: var(--primary);
        border-bottom: 3px solid var(--primary);
        font-weight: bold;
    }

    .tabs button:hover:not(.active) {
        color: var(--text-color);
        background: rgba(0, 0, 0, 0.05);
    }

    .badge {
        background: #dc3545;
        color: white;
        border-radius: 50%;
        padding: 0.2rem 0.5rem;
        font-size: 0.8rem;
        font-weight: bold;
    }

    .empty-state {
        text-align: center;
        padding: 4rem;
        color: var(--text-muted);
        background: var(--bg-secondary, rgba(0, 0, 0, 0.02));
        border-radius: 8px;
    }

    .empty-state button {
        margin-top: 1rem;
    }

    .search-bar {
        margin-bottom: 1.5rem;
    }

    .search-bar input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color, #ccc);
        border-radius: 4px;
        font-size: 1rem;
        background: var(--bg-primary, #fff);
        color: var(--text-color);
    }

    .user-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .user-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: var(--card-bg, #fff);
        border: 1px solid var(--border-color, #eee);
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .avatar {
        width: 40px;
        height: 40px;
        background: var(--primary);
        color: white;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 1.2rem;
    }

    .name {
        font-size: 1.1rem;
        color: var(--text-color);
        font-weight: 500;
    }

    .actions {
        display: flex;
        gap: 0.5rem;
    }

    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: filter 0.2s;
    }

    button:hover {
        filter: brightness(1.1);
    }

    .primary-btn {
        background: var(--primary);
        color: white;
    }

    .secondary-btn {
        background: var(--bg-secondary, #e0e0e0);
        color: var(--text-color, #333);
        border: 1px solid var(--border-color, #ccc);
    }

    .success-btn {
        background: #28a745;
        color: white;
    }

    .danger-btn {
        background: #dc3545;
        color: white;
    }

    .error-banner,
    .success-banner {
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .error-banner {
        background: #ffebee;
        color: #c62828;
    }

    .success-banner {
        background: #e8f5e9;
        color: #2e7d32;
    }

    .error-banner button,
    .success-banner button {
        background: none;
        border: none;
        font-weight: bold;
        cursor: pointer;
        padding: 0;
        color: inherit;
    }

    @media (max-width: 767px) {
        .friends-container {
            padding: 1rem;
        }

        .tabs {
            flex-direction: column;
            gap: 0;
            border-bottom: none;
        }

        .tabs button {
            border-bottom: none;
            border-left: 3px solid transparent;
            justify-content: flex-start;
        }

        .tabs button.active {
            border-left: 3px solid var(--primary);
            border-bottom: none;
            background: rgba(0, 0, 0, 0.02);
        }

        .user-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }

        .actions {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            gap: 0.4rem;
        }

        .actions button {
            flex: 1 1 auto;
            font-size: 0.8rem;
            padding: 0.4rem 0.6rem;
            min-width: 0;
        }
    }
</style>
