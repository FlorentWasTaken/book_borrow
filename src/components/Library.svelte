<script>
    import { onMount, onDestroy } from "svelte";
    import {
        fetchUserBooks,
        books,
        isLoadingBooks,
        addBook,
        deleteBook,
        lendBook,
        giveBook,
        returnBook,
    } from "../stores/books";
    import { user } from "../stores/auth";
    import BookCard from "./BookCard.svelte";
    import AddBookModal from "./AddBookModal.svelte";
    import UserSelectModal from "./UserSelectModal.svelte";
    import ConfirmationModal from "./ConfirmationModal.svelte";
    import BottomSheet from "./BottomSheet.svelte";
    import Loader from "./Loader.svelte";
    import { getErrorMessage } from "../utils/errorBox";

    let isAddModalOpen = false;
    let isUserSelectModalOpen = false;

    // Confirmation Modal State
    let isConfirmModalOpen = false;
    let confirmTitle = "";
    let confirmMessage = "";
    let confirmAction = null;
    let isDangerAction = false;

    let selectedBook = null;
    let actionType = null; // 'lend' or 'give'
    let error = "";

    $: isOwner = (book) => $user && book.ownerId === $user.uid;

    onMount(() => {
        if ($user) {
            fetchUserBooks($user.uid);
        }
    });

    $: if ($user && !$books.length && !$isLoadingBooks) {
        fetchUserBooks($user.uid);
    }

    function openAddModal() {
        isAddModalOpen = true;
    }

    async function handleAddBook(event) {
        const { title, coverFile, coverUrl } = event.detail;
        const result = await addBook({ title, coverFile, coverUrl });
        if (!result.success) {
            error = "Erreur lors de l'ajout du livre : " + result.error;
        }
    }

    function openConfirm(title, message, action, danger = false) {
        confirmTitle = title;
        confirmMessage = message;
        confirmAction = action;
        isDangerAction = danger;
        isConfirmModalOpen = true;
    }

    async function handleCardAction(event) {
        const { type, detail } = event;
        const book = detail.book;

        if (type === "delete") {
            openConfirm(
                "Supprimer le livre",
                `Voulez-vous vraiment supprimer "${book.title}" ?`,
                async () => {
                    const result = await deleteBook(book.id);
                    if (!result.success) {
                        error =
                            "Erreur lors de la suppression : " + result.error;
                    }
                },
                true,
            );
        } else if (type === "return") {
            const result = await returnBook(book.id);
            if (!result.success) {
                error = "Erreur lors du retour : " + result.error;
            }
        } else if (type === "lend") {
            selectedBook = book;
            actionType = "lend";
            isUserSelectModalOpen = true;
        } else if (type === "give") {
            selectedBook = book;
            actionType = "give";
            isUserSelectModalOpen = true;
        }
    }

    async function handleUserSelect(event) {
        const { user } = event.detail;

        if (actionType === "lend") {
            const result = await lendBook(selectedBook.id, user);
            if (result && !result.success) error = result.error;
        } else if (actionType === "give") {
            openConfirm(
                "Donner le livre",
                `Êtes-vous sûr de vouloir donner ce livre à ${user.username || user.email} ? Il ne sera plus dans votre bibliothèque.`,
                async () => {
                    const result = await giveBook(selectedBook.id, user);
                    if (result && !result.success) error = result.error;
                },
                true,
            );
        }
    }
</script>

<div class="library-container">
    <header class="library-header">
        <h1>Bibliothèque</h1>
        <button class="add-btn" on:click={openAddModal}>
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
                class="plus-icon"
            >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span class="btn-text">Ajouter un livre</span>
        </button>
    </header>

    {#if error}
        <div class="error-banner">
            {error}
            <button on:click={() => (error = "")}>x</button>
        </div>
    {/if}

    {#if $isLoadingBooks}
        <Loader message="Chargement de vos livres..." />
    {:else if $books.length === 0}
        <div class="empty-state">
            <p>Votre bibliothèque est vide.</p>
            <button on:click={openAddModal}>Commencer une collection</button>
        </div>
    {:else}
        <div class="books-grid">
            {#each $books as book (book.id)}
                <BookCard
                    {book}
                    on:delete={handleCardAction}
                    on:lend={handleCardAction}
                    on:give={handleCardAction}
                    on:return={handleCardAction}
                    on:open_sheet={(e) => (selectedBook = e.detail.book)}
                />
            {/each}
        </div>
    {/if}

    <AddBookModal bind:isOpen={isAddModalOpen} on:add={handleAddBook} />
    <UserSelectModal
        bind:isOpen={isUserSelectModalOpen}
        title={actionType === "lend" ? "Prêter à..." : "Donner à..."}
        on:select={handleUserSelect}
    />
    <ConfirmationModal
        bind:isOpen={isConfirmModalOpen}
        title={confirmTitle}
        message={confirmMessage}
        isDanger={isDangerAction}
        on:confirm={confirmAction}
    />

    <!-- Mobile Bottom Sheet -->
    {#if selectedBook}
        <BottomSheet
            isOpen={!!selectedBook}
            title={selectedBook.title}
            on:close={() => (selectedBook = null)}
        >
            {#if isOwner(selectedBook)}
                {#if selectedBook.status !== "lent"}
                    <button
                        class="sheet-btn"
                        on:click={() => {
                            handleCardAction({
                                type: "lend",
                                detail: { book: selectedBook },
                            });
                            selectedBook = null;
                        }}>Prêter</button
                    >
                    <button
                        class="sheet-btn"
                        on:click={() => {
                            handleCardAction({
                                type: "give",
                                detail: { book: selectedBook },
                            });
                            selectedBook = null;
                        }}>Donner</button
                    >
                    <button
                        class="sheet-btn danger"
                        on:click={() => {
                            handleCardAction({
                                type: "delete",
                                detail: { book: selectedBook },
                            });
                            selectedBook = null;
                        }}>Supprimer</button
                    >
                {:else}
                    <button
                        class="sheet-btn success"
                        on:click={() => {
                            handleCardAction({
                                type: "return",
                                detail: { book: selectedBook },
                            });
                            selectedBook = null;
                        }}>Marquer comme rendu</button
                    >
                {/if}
            {:else}
                <button
                    class="sheet-btn success"
                    on:click={() => {
                        handleCardAction({
                            type: "return",
                            detail: { book: selectedBook },
                        });
                        selectedBook = null;
                    }}>Rendre le livre</button
                >
            {/if}
        </BottomSheet>
    {/if}
</div>

<style>
    .library-container {
        padding: 2rem;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
    }

    .library-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        border-bottom: 2px solid var(--text-muted);
        padding-bottom: 1rem;
    }

    h1 {
        font-size: 2.5rem;
        color: var(--text-color);
        margin: 0;
        font-family: "Montserrat", sans-serif; /* Keep consistent with App */
    }

    .add-btn {
        background: linear-gradient(135deg, #ff8008 0%, #ffc837 100%);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 30px;
        font-size: 1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition:
            transform 0.2s,
            box-shadow 0.2s;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }

    .add-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
    }

    .plus-icon {
        width: 24px;
        height: 24px;
        display: block;
    }

    .books-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 2rem;
        justify-items: center;
    }

    .empty-state {
        text-align: center;
        padding: 4rem;
        color: var(--text-muted);
    }

    .empty-state button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .error-banner {
        background: #ffebee;
        color: #c62828;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .error-banner button {
        background: none;
        border: none;
        color: #c62828;
        font-weight: bold;
        cursor: pointer;
    }
    @media (max-width: 767px) {
        .library-container {
            padding: 1rem;
        }

        .books-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
        }

        h1 {
            font-size: 1.8rem;
        }

        .add-btn {
            font-size: 0;
            padding: 0;
            width: 3.5rem; /* Slightly larger for easier tapping */
            height: 3.5rem;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .add-btn .btn-text {
            display: none;
        }

        .plus-icon {
            width: 24px;
            height: 24px;
        }

        .sheet-btn {
            width: 100%;
            padding: 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-secondary);
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            text-align: left;
            color: var(--text-color);
        }

        .sheet-btn.danger {
            color: #d32f2f;
            background: #ffebee;
        }

        .sheet-btn.success {
            color: #2e7d32;
            background: #e8f5e9;
        }
    }
</style>
