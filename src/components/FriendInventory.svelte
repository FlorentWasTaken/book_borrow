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
    import BookCard from "./BookCard.svelte";
    import Loader from "./Loader.svelte";

    export let id;

    let targetUser = null;
    let books = [];
    let isLoading = true;
    let accessStatus = "checking"; // 'checking', 'granted', 'denied', 'not_found'

    onMount(async () => {
        if (!id) {
            accessStatus = "not_found";
            isLoading = false;
            return;
        }

        try {
            // Fetch target user data
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
                await fetchBooks();
            } else {
                accessStatus = "denied";
            }
        } catch (error) {
            console.error("Error fetching user for inventory:", error);
            accessStatus = "not_found";
        } finally {
            isLoading = false;
        }
    });

    const fetchBooks = async () => {
        try {
            const q = query(
                collection(db, "books"),
                where("ownerId", "==", id),
            );
            const querySnapshot = await getDocs(q);
            books = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error("Error fetching books:", error);
        }
    };
</script>

<div class="inventory-container">
    {#if isLoading}
        <Loader message="Chargement de l'inventaire..." />
    {:else if accessStatus === "not_found"}
        <div class="message-container">
            <h2>Utilisateur introuvable</h2>
            <p>Cet utilisateur n'existe pas ou a été supprimé.</p>
        </div>
    {:else if accessStatus === "denied"}
        <div class="message-container">
            <h2>Accès refusé</h2>
            <p>
                L'inventaire de {targetUser?.username || "cet utilisateur"} est privé.
                {#if targetUser?.inventoryVisibility === "friends"}
                    Vous devez être amis pour y accéder.
                {/if}
            </p>
        </div>
    {:else if accessStatus === "granted"}
        <header class="inventory-header">
            <h1>Bibliothèque de {targetUser?.username || "l'utilisateur"}</h1>
            <button class="back-btn" on:click={() => window.history.back()}>
                Retour
            </button>
        </header>

        {#if books.length === 0}
            <div class="empty-state">
                <p>Cet utilisateur n'a aucun livre dans son inventaire.</p>
            </div>
        {:else}
            <div class="books-grid">
                {#each books as book (book.id)}
                    <BookCard {book} readOnly={true} />
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
    }
</style>
