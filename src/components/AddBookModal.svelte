<script>
    import { createEventDispatcher } from "svelte";

    /** @type {boolean} */
    export let isOpen = false;
    /** @type {string} */
    export let title = "Ajouter un livre";
    /** @type {boolean} */
    export let hideFileUpload = false;

    /** @type {string} */
    let bookTitle = "";
    /** @type {File | null} */
    let coverFile = null;
    /** @type {string} */
    let previewUrl = "";
    /** @type {boolean} */
    let isSubmitting = false;

    const dispatch = createEventDispatcher();

    /** @type {any[]} */
    let searchResults = [];
    /** @type {boolean} */
    let showSuggestions = false;
    /** @type {any} */
    let searchTimeout;
    /** @type {HTMLElement | undefined} */
    let container;

    const BOOKS_API_KEY = import.meta.env.VITE_BOOKS_API_KEY;

    /**
     * @param {string} query
     * @returns {Promise<void>}
     */
    async function searchBooks(query) {
        console.log("searchBooks called with query:", query);
        if (!query || query.length < 3) {
            console.log("Query too short or empty, clearing suggestions");
            searchResults = [];
            showSuggestions = false;
            return;
        }

        let response;
        let success = false;

        // 1. Try Google Books API with dedicated key
        try {
            const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=15&langRestrict=fr&key=${BOOKS_API_KEY}`;
            console.log("Attempt 1: Fetching from Google Books with API Key...");
            response = await fetch(url);
            console.log("Response status:", response.status);
            if (response.ok) {
                success = true;
            }
        } catch (e) {
            console.error("Attempt 1 failed:", e);
        }

        // 2. Try Google Books API without key (fallback)
        if (!success) {
            try {
                const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=15&langRestrict=fr`;
                console.log("Attempt 2: Fetching from Google Books without key...");
                response = await fetch(url);
                console.log("Response status:", response.status);
                if (response.ok) {
                    success = true;
                }
            } catch (e) {
                console.error("Attempt 2 failed:", e);
            }
        }

        // 3. Try Open Library API (final bulletproof fallback)
        let isOpenLibrary = false;
        if (!success) {
            try {
                const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query + ' language:fre')}&lang=fr&limit=15`;
                console.log("Attempt 3: Fetching from Open Library API...");
                response = await fetch(url);
                console.log("Response status:", response.status);
                if (response.ok) {
                    success = true;
                    isOpenLibrary = true;
                }
            } catch (e) {
                console.error("Attempt 3 failed:", e);
            }
        }

        if (!success || !response) {
            console.error("All search attempts failed.");
            searchResults = [];
            showSuggestions = false;
            return;
        }

        try {
            const data = await response.json();
            console.log("Selected API raw data:", data);

            if (isOpenLibrary) {
                if (data.docs && data.docs.length > 0) {
                    searchResults = data.docs.map((/** @type {any} */ doc) => ({
                        id: doc.key,
                        title: doc.title,
                        authors: doc.author_name || [],
                        coverUrl: doc.cover_i 
                            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` 
                            : null,
                    }));
                    showSuggestions = true;
                    console.log("Mapped searchResults (Open Library):", searchResults);
                } else {
                    searchResults = [];
                    showSuggestions = false;
                }
            } else {
                // Google Books mapping
                if (data.items) {
                    searchResults = data.items.map((/** @type {any} */ item) => ({
                        id: item.id,
                        title: item.volumeInfo.title,
                        authors: item.volumeInfo.authors || [],
                        coverUrl:
                            item.volumeInfo.imageLinks?.thumbnail ||
                            item.volumeInfo.imageLinks?.smallThumbnail ||
                            null,
                    }));
                    showSuggestions = true;
                    console.log("Mapped searchResults (Google Books):", searchResults);
                } else {
                    searchResults = [];
                    showSuggestions = false;
                }
            }
        } catch (e) {
            console.error("Error processing search response:", e);
            searchResults = [];
            showSuggestions = false;
        }
    }

    /**
     * @param {any} e
     */
    function handleTitleInput(e) {
        bookTitle = e.target.value;
        coverFile = null;

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchBooks(bookTitle);
        }, 500);
    }

    /**
     * @param {any} book
     */
    function selectBook(book) {
        bookTitle = book.title;
        if (book.coverUrl) {
            let secureUrl = book.coverUrl.replace("http:", "https:");
            previewUrl = secureUrl;
        } else {
            previewUrl = "";
        }

        showSuggestions = false;
    }

    /**
     * @param {any} event
     */
    function handleClickOutside(event) {
        if (container && !container.contains(event.target)) {
            showSuggestions = false;
        }
    }

    /**
     * @param {any} event
     */
    function handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            coverFile = file;
            previewUrl = URL.createObjectURL(file);
        } else {
            coverFile = null;
            previewUrl = "";
        }
    }

    /**
     * @returns {Promise<void>}
     */
    async function handleSubmit() {
        if (bookTitle.trim()) {
            isSubmitting = true;
            /** @type {{ title: string, coverFile?: File, coverUrl?: string }} */
            let payload = { title: bookTitle };
            if (coverFile) {
                payload.coverFile = coverFile;
            } else if (previewUrl && previewUrl.startsWith("http")) {
                payload.coverUrl = previewUrl;
            }

            dispatch("add", payload);
            setTimeout(() => {
                bookTitle = "";
                coverFile = null;
                previewUrl = "";
                isSubmitting = false;
                isOpen = false;
                searchResults = [];
            }, 1000);
        }
    }

    function handleClose() {
        isOpen = false;
        bookTitle = "";
        coverFile = null;
        previewUrl = "";
        searchResults = [];
    }
</script>

<svelte:window on:click={handleClickOutside} />

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
        <div
            class="modal-content"
            on:click|stopPropagation
            role="document"
        >
            <h2>{title}</h2>
            <form on:submit|preventDefault={handleSubmit}>
                <div class="form-group relative" bind:this={container}>
                    <label for="title">Titre du livre</label>
                    <input
                        type="text"
                        id="title"
                        value={bookTitle}
                        on:input={handleTitleInput}
                        required
                        disabled={isSubmitting}
                        placeholder="Recherchez un titre..."
                        autocomplete="off"
                    />

                    {#if showSuggestions && searchResults.length > 0}
                        <ul class="suggestions">
                            {#each searchResults as book}
                                <li>
                                    <button
                                        type="button"
                                        on:click|stopPropagation={() =>
                                            selectBook(book)}
                                    >
                                        {#if book.coverUrl}
                                            <img
                                                src={book.coverUrl}
                                                alt=""
                                                class="thumb"
                                            />
                                        {:else}
                                            <div class="thumb-placeholder">
                                                ?
                                            </div>
                                        {/if}
                                        <div class="info">
                                            <span class="book-title"
                                                >{book.title}</span
                                            >
                                            <span class="book-author"
                                                >{book.authors.join(", ")}</span
                                            >
                                        </div>
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>

                {#if !hideFileUpload}
                    <div class="form-group">
                        <label for="cover"
                            >Photo de couverture (Optionnel)</label
                        >
                        <input
                            type="file"
                            id="cover"
                            accept="image/*"
                            on:change={handleFileChange}
                            disabled={isSubmitting}
                        />
                        <small
                            >Laissez vide pour utiliser l'image trouvée ou par
                            défaut.</small
                        >
                    </div>
                {/if}

                {#if previewUrl}
                    <div class="preview">
                        <img src={previewUrl} alt="Prévisualisation" />
                    </div>
                {/if}

                <div class="actions">
                    <button
                        type="button"
                        on:click={handleClose}
                        disabled={isSubmitting}>Annuler</button
                    >
                    <button
                        type="submit"
                        class="primary"
                        disabled={!bookTitle.trim() || isSubmitting}
                    >
                        {isSubmitting ? "Ajout..." : "Ajouter"}
                    </button>
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

    input[type="text"],
    input[type="file"] {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }

    .preview {
        margin-bottom: 1rem;
        text-align: center;
    }

    .preview img {
        max-width: 100%;
        max-height: 200px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

    .form-group.relative {
        position: relative;
    }

    .suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--card-bg, #fff);
        border: 1px solid #ccc;
        border-radius: 0 0 4px 4px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 10;
        padding: 0;
        margin: 0;
        list-style: none;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .suggestions li button {
        width: 100%;
        text-align: left;
        padding: 0.5rem;
        background: none;
        border-bottom: 1px solid #eee;
        border-radius: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text-color, #333);
    }

    .suggestions li button:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }

    .suggestions .thumb {
        width: 40px;
        height: 60px;
        object-fit: cover;
    }

    .suggestions .thumb-placeholder {
        width: 40px;
        height: 60px;
        background: #eee;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
    }

    .suggestions .info {
        display: flex;
        flex-direction: column;
    }

    .suggestions .book-title {
        font-weight: bold;
        font-size: 0.9rem;
    }

    .suggestions .book-author {
        font-size: 0.8rem;
        color: #666;
    }

    small {
        display: block;
        margin-top: 5px;
        color: #666;
        font-size: 0.8rem;
    }
</style>
