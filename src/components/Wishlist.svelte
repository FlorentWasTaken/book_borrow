<script>
    import { onMount } from "svelte";
    import {
        wishlist,
        isLoadingWishlist,
        fetchWishlist,
        removeFromWishlist,
        moveToLibrary,
        addToWishlist,
    } from "../stores/wishlist";
    import { user } from "../stores/auth";
    import { books, fetchUserBooks } from "../stores/books";
    import { friends } from "../stores/friends";
    import { db } from "../config/firebase";
    import { collection, query, where, getDocs } from "firebase/firestore";
    import AddBookModal from "./AddBookModal.svelte";
    import ConfirmationModal from "./ConfirmationModal.svelte";
    import Loader from "./Loader.svelte";
    import BottomSheet from "./BottomSheet.svelte";

    let isAddModalOpen = false;
    let isConfirmModalOpen = false;
    let confirmTitle = "";
    let confirmMessage = "";
    let confirmAction = null;
    let isDangerAction = false;
    let error = "";
    let sheetBook = null;
    let friendsBooks = [];

    onMount(() => {
        if ($user) {
            fetchWishlist($user.uid);
            fetchUserBooks($user.uid);
        }
    });

    $: if ($friends && $friends.length > 0) {
        loadFriendsBooks();
    }

    async function loadFriendsBooks() {
        try {
            const friendIds = $friends.map((f) => f.id);
            if (friendIds.length === 0) return;

            let allBooks = [];
            for (let i = 0; i < friendIds.length; i += 10) {
                const chunk = friendIds.slice(i, i + 10);
                const q = query(
                    collection(db, "books"),
                    where("ownerId", "in", chunk),
                );
                const snapshot = await getDocs(q);
                snapshot.forEach((doc) =>
                    allBooks.push({ id: doc.id, ...doc.data() }),
                );
            }
            friendsBooks = allBooks;
        } catch (e) {
            console.error("Error fetching friends books:", e);
        }
    }

    $: isOwnedByMe = (wishTitle) => {
        if (!wishTitle) return false;
        return $books.some(
            (b) => b.title?.toLowerCase() === wishTitle.toLowerCase(),
        );
    };

    $: ownedByFriends = (wishTitle) => {
        if (!wishTitle) return null;
        const owners = friendsBooks
            .filter((b) => b.title?.toLowerCase() === wishTitle.toLowerCase())
            .map((b) => b.ownerId);

        if (owners.length === 0) return null;
        const uniqueOwners = [...new Set(owners)];
        const names = uniqueOwners.map((id) => {
            const friend = $friends.find((f) => f.id === id);
            return friend ? friend.username || friend.email : "Un ami";
        });
        return names;
    };

    function openAddModal() {
        isAddModalOpen = true;
    }

    async function handleAddWish(event) {
        const { title, coverUrl } = event.detail;
        const result = await addToWishlist({ title, coverUrl });
        if (!result.success) {
            error = "Erreur lors de l'ajout à la wishlist : " + result.error;
        }
    }

    function openConfirm(title, message, action, danger = false) {
        confirmTitle = title;
        confirmMessage = message;
        confirmAction = action;
        isDangerAction = danger;
        isConfirmModalOpen = true;
    }

    async function handleRemove(book) {
        openConfirm(
            "Retirer de la wishlist",
            `Voulez-vous vraiment retirer "${book.title}" de votre liste d'envies ?`,
            async () => {
                const result = await removeFromWishlist(book.id);
                if (!result.success) {
                    error = "Erreur lors de la suppression : " + result.error;
                }
            },
            true,
        );
    }

    async function handleGotIt(book) {
        openConfirm(
            "Je l'ai !",
            `Voulez-vous déplacer "${book.title}" dans votre bibliothèque ?`,
            async () => {
                const result = await moveToLibrary(book.id, book);
                if (!result.success) {
                    error = "Erreur lors du déplacement : " + result.error;
                }
            },
        );
    }

    function handleCardClick(book) {
        if (window.innerWidth <= 768) {
            sheetBook = book;
        }
    }
</script>

<div class="wishlist-container">
    <header class="wishlist-header">
        <h1>Wishlist</h1>
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span class="btn-text">Ajouter un souhait</span>
        </button>
    </header>

    {#if error}
        <div class="error-banner">
            {error}
            <button on:click={() => (error = "")}>x</button>
        </div>
    {/if}

    {#if $isLoadingWishlist}
        <Loader message="Chargement de votre wishlist..." />
    {:else if $wishlist.length === 0}
        <div class="empty-state">
            <p>Votre wishlist est vide.</p>
            <button on:click={openAddModal}
                >Ajouter un livre que vous convoitez</button
            >
        </div>
    {:else}
        <div class="books-grid">
            {#each $wishlist as book (book.id)}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="book-card" on:click={() => handleCardClick(book)}>
                    <div class="cover-container">
                        <img
                            src={book.coverUrl ||
                                "/src/assets/book_placeholder.svg"}
                            alt={book.title}
                        />
                        <div class="overlay">
                            <button
                                on:click|stopPropagation={() =>
                                    handleGotIt(book)}>Je l'ai !</button
                            >
                            <button
                                class="danger"
                                on:click|stopPropagation={() =>
                                    handleRemove(book)}>Retirer</button
                            >
                        </div>

                        {#if isOwnedByMe(book.title)}
                            <div class="ownership-badge mine">
                                Dans ma bibliothèque
                            </div>
                        {:else if ownedByFriends(book.title)}
                            <div
                                class="ownership-badge friend"
                                title={ownedByFriends(book.title).join(", ")}
                            >
                                Chez {ownedByFriends(book.title).join(", ")}
                            </div>
                        {/if}
                    </div>
                    <div class="info">
                        <h3 title={book.title}>{book.title}</h3>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <AddBookModal
        bind:isOpen={isAddModalOpen}
        on:add={handleAddWish}
        title=""
        hideFileUpload={true}
    />

    <ConfirmationModal
        bind:isOpen={isConfirmModalOpen}
        title={confirmTitle}
        message={confirmMessage}
        isDanger={isDangerAction}
        on:confirm={confirmAction}
    />

    {#if sheetBook}
        <BottomSheet
            isOpen={!!sheetBook}
            title={sheetBook.title}
            on:close={() => (sheetBook = null)}
        >
            <button
                class="sheet-btn success"
                on:click={() => {
                    handleGotIt(sheetBook);
                    sheetBook = null;
                }}>Je l'ai !</button
            >
            <button
                class="sheet-btn danger"
                on:click={() => {
                    handleRemove(sheetBook);
                    sheetBook = null;
                }}>Retirer</button
            >
        </BottomSheet>
    {/if}
</div>

<style>
    .wishlist-container {
        padding: 2rem;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
    }

    .wishlist-header {
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
        font-family: "Montserrat", sans-serif;
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

    .books-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 2rem;
        justify-items: center;
    }

    .book-card {
        width: 100%;
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
        z-index: 10;
    }

    .cover-container:hover .overlay {
        opacity: 1;
    }

    .ownership-badge {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: bold;
        color: white;
        white-space: nowrap;
        z-index: 5;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        max-width: 90%;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .ownership-badge.mine {
        background-color: var(--primary, #007bff);
    }

    .ownership-badge.friend {
        background-color: #28a745;
        cursor: help;
    }

    button.danger {
        background: #dc3545;
    }

    .overlay button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background: var(--primary, #007bff);
        color: white;
        cursor: pointer;
        font-weight: bold;
        width: 80%;
    }

    .info {
        padding: 10px;
        text-align: center;
    }

    h3 {
        margin: 0;
        font-size: 1rem;
        color: var(--text-color, #fff);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
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
        .books-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
        }

        .cover-container {
            height: auto;
            aspect-ratio: 2/3;
        }

        .overlay {
            display: none !important;
        }

        h3 {
            font-size: 0.8rem;
        }

        .add-btn {
            font-size: 0;
            padding: 0;
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 50%;
            justify-content: center;
        }

        .add-btn .btn-text {
            display: none;
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
