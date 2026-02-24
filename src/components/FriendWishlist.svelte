<script>
    import { onMount } from "svelte";
    import { user } from "../stores/auth";
    import { db } from "../config/firebase";
    import {
        doc,
        getDoc,
        collection,
        query,
        where,
        getDocs,
    } from "firebase/firestore";
    import { books, fetchUserBooks } from "../stores/books";
    import BookCard from "./BookCard.svelte";
    import Loader from "./Loader.svelte";

    export let id;

    let targetUser = null;
    let friendBooks = [];
    let isLoading = true;
    let accessStatus = "checking";

    onMount(async () => {
        if (!id) {
            accessStatus = "not_found";
            isLoading = false;
            return;
        }

        try {
            const userRef = doc(db, "users", id);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                accessStatus = "not_found";
                isLoading = false;
                return;
            }

            targetUser = { id: userSnap.id, ...userSnap.data() };
            // @ts-ignore
            const visibility = targetUser.inventoryVisibility || "friends";
            // @ts-ignore
            const isFriend = targetUser.friends?.includes($user?.uid);
            const isSelf = $user?.uid === id;

            if (
                isSelf ||
                visibility === "public" ||
                (visibility === "friends" && isFriend)
            ) {
                accessStatus = "granted";
                await fetchWishlistItems();
            } else {
                accessStatus = "denied";
            }
        } catch (error) {
            console.error("Error fetching user for wishlist:", error);
            accessStatus = "not_found";
        } finally {
            isLoading = false;
        }

        if ($user) {
            fetchUserBooks($user.uid);
        }
    });

    $: isOwnedByMe = (wishTitle) => {
        if (!wishTitle) return false;
        return $books.some(
            (b) => b.title?.toLowerCase() === wishTitle.toLowerCase(),
        );
    };

    const fetchWishlistItems = async () => {
        try {
            const q = query(
                collection(db, "wishlist"),
                where("userId", "==", id),
            );
            const querySnapshot = await getDocs(q);
            friendBooks = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error("Error fetching wishlist items:", error);
        }
    };
</script>

<div class="inventory-container">
    {#if isLoading}
        <Loader message="Chargement de la wishlist..." />
    {:else if accessStatus === "not_found"}
        <div class="message-container">
            <h2>Utilisateur introuvable</h2>
            <p>Cet utilisateur n'existe pas ou a été supprimé.</p>
        </div>
    {:else if accessStatus === "denied"}
        <div class="message-container">
            <h2>Accès refusé</h2>
            <p>
                La wishlist de {targetUser?.username || "cet utilisateur"} est privée.
                {#if targetUser?.inventoryVisibility === "friends"}
                    Vous devez être amis pour y accéder.
                {/if}
            </p>
        </div>
    {:else if accessStatus === "granted"}
        <header class="inventory-header">
            <div class="header-titles">
                <h1>Wishlist de {targetUser?.username || "l'utilisateur"}</h1>
                <p class="subtitle">Livres que cette personne aimerait avoir</p>
            </div>
            <button class="back-btn" on:click={() => window.history.back()}>
                Retour
            </button>
        </header>

        {#if friendBooks.length === 0}
            <div class="empty-state">
                <p>La liste de souhaits de cet utilisateur est vide.</p>
            </div>
        {:else}
            <div class="books-grid wishlist-grid">
                {#each friendBooks as book (book.id)}
                    <div class="book-card">
                        <div class="cover-container">
                            <img
                                src={book.coverUrl ||
                                    "/src/assets/book_placeholder.svg"}
                                alt={book.title}
                            />
                            {#if isOwnedByMe(book.title)}
                                <div class="ownership-badge mine">
                                    Dans ma bibliothèque
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
    {/if}
</div>

<style>
    .inventory-container {
        padding: 2rem;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
    }

    .message-container {
        text-align: center;
        padding: 4rem;
        background: var(--card-bg, #fff);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .message-container h2 {
        color: var(--primary);
        margin-bottom: 1rem;
    }

    .inventory-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        border-bottom: 2px solid var(--text-muted);
        padding-bottom: 1rem;
    }

    .header-titles {
        display: flex;
        flex-direction: column;
    }

    .subtitle {
        color: var(--text-muted);
        margin: 5px 0 0 0;
        font-size: 1rem;
    }

    h1 {
        font-size: 2.5rem;
        color: var(--text-color);
        margin: 0;
        font-family: "Montserrat", sans-serif;
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

    .back-btn {
        background: var(--bg-secondary, rgba(0, 0, 0, 0.05));
        color: var(--text-color);
        border: 1px solid var(--border-color, #ccc);
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
    }

    .back-btn:hover {
        background: rgba(0, 0, 0, 0.1);
    }

    /* Wishlist specific card styles since it's read only for friends */
    .wishlist-grid .book-card {
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

    .wishlist-grid .book-card:hover {
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
    }

    .ownership-badge.mine {
        background-color: var(--primary, #007bff);
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

    @media (max-width: 767px) {
        .inventory-container {
            padding: 1rem;
        }

        .books-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
        }

        h1 {
            font-size: 1.8rem;
        }

        .cover-container {
            height: auto;
            aspect-ratio: 2/3;
        }

        h3 {
            font-size: 0.8rem;
        }
    }
</style>
