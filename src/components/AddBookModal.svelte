<script>
    import { createEventDispatcher } from "svelte";

    export let isOpen = false;

    let title = "";
    let coverFile = null;
    let previewUrl = "";
    let isSubmitting = false;

    const dispatch = createEventDispatcher();

    let searchResults = [];
    let showSuggestions = false;
    let searchTimeout;

    async function searchBooks(query) {
        if (!query || query.length < 3) {
            searchResults = [];
            showSuggestions = false;
            return;
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=15&langRestrict=fr`,
            );
            const data = await response.json();

            if (data.items) {
                searchResults = data.items.map((item) => ({
                    id: item.id,
                    title: item.volumeInfo.title,
                    authors: item.volumeInfo.authors || [],
                    coverUrl:
                        item.volumeInfo.imageLinks?.thumbnail ||
                        item.volumeInfo.imageLinks?.smallThumbnail ||
                        null,
                }));
                showSuggestions = true;
            } else {
                searchResults = [];
                showSuggestions = false;
            }
        } catch (e) {
            console.error("Error searching books:", e);
            searchResults = [];
            showSuggestions = false;
        }
    }

    function handleTitleInput(e) {
        title = e.target.value;
        coverFile = null;

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchBooks(title);
        }, 500);
    }

    function selectBook(book) {
        title = book.title;
        if (book.coverUrl) {
            let secureUrl = book.coverUrl.replace("http:", "https:");
            previewUrl = secureUrl;
        } else {
            previewUrl = "";
        }

        showSuggestions = false;
    }

    function handleClickOutside() {
        showSuggestions = false;
    }

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

    async function handleSubmit() {
        if (title.trim()) {
            isSubmitting = true;
            let payload = { title };
            if (coverFile) {
                payload.coverFile = coverFile;
            } else if (previewUrl && previewUrl.startsWith("http")) {
                payload.coverUrl = previewUrl;
            }

            dispatch("add", payload);
            setTimeout(() => {
                title = "";
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
        title = "";
        coverFile = null;
        previewUrl = "";
        searchResults = [];
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
        <div
            class="modal-content"
            on:click|stopPropagation
            role="document"
            on:click={handleClickOutside}
        >
            <h2>Ajouter un livre</h2>
            <form on:submit|preventDefault={handleSubmit}>
                <div class="form-group relative">
                    <label for="title">Titre du livre</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
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

                <div class="form-group">
                    <label for="cover">Photo de couverture (Optionnel)</label>
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
                        disabled={!title.trim() || isSubmitting}
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
