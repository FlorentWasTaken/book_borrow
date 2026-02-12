<script>
    import { createEventDispatcher } from "svelte";

    import { user } from "../stores/auth";

    export let book;

    $: isOwner = $user && book.ownerId === $user.uid;

    const dispatch = createEventDispatcher();
    const defaultCover = "dummyimage.com/300x200/";

    function handleAction(action) {
        dispatch(action, { book });
    }
</script>

<div class="book-card">
    <div class="cover-container">
        <img src={book.coverUrl || defaultCover} alt={book.title} />
        <div class="overlay">
            {#if isOwner}
                {#if book.status !== "lent"}
                    <button on:click={() => handleAction("lend")}>Prêter</button
                    >
                    <button on:click={() => handleAction("give")}>Donner</button
                    >
                    <button
                        class="danger"
                        on:click={() => handleAction("delete")}
                        >Supprimer</button
                    >
                {:else}
                    <button
                        class="return-btn"
                        on:click={() => handleAction("return")}
                        >Marquer comme rendu</button
                    >
                {/if}
            {:else}
                <!-- Borrower View -->
                <button
                    class="return-btn"
                    on:click={() => handleAction("return")}
                    >Rendre le livre</button
                >
            {/if}
        </div>
    </div>
    <div class="info">
        <h3>{book.title}</h3>
        {#if book.status === "lent"}
            {#if isOwner}
                <span class="status lent"
                    >Prêté à {book.lentToName || "Inconnu"}</span
                >
            {:else}
                <span class="status borrowed">Emprunté</span>
            {/if}
        {/if}
    </div>
</div>

<style>
    .book-card {
        width: 200px;
        background: var(--card-bg, #1e1e1e);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        transition:
            transform 0.2s,
            box-shadow 0.2s;
        display: flex;
        flex-direction: column;
    }

    .book-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.5);
    }

    .cover-container {
        position: relative;
        width: 100%;
        height: 300px;
        overflow: hidden;
    }

    .cover-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 10px;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .cover-container:hover .overlay {
        opacity: 1;
    }

    button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background: var(--primary, #007bff);
        color: white;
        cursor: pointer;
        font-weight: bold;
        width: 80%;
        transition: background 0.2s;
    }

    button:hover {
        filter: brightness(1.1);
    }

    button.danger {
        background: #dc3545;
    }

    .info {
        padding: 10px;
        text-align: center;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    h3 {
        margin: 0;
        font-size: 1rem;
        color: var(--text-color, #fff);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .status {
        display: block;
        font-size: 0.8rem;
        margin-top: 5px;
    }

    .status.lent {
        color: #ffc107;
    }

    .return-btn {
        margin-top: 5px;
        font-size: 0.8rem;
        padding: 4px 8px;
        background: #28a745;
        width: 100%;
    }
</style>
