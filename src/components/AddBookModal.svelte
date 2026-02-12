<script>
    import { createEventDispatcher } from "svelte";

    export let isOpen = false;

    let title = "";
    let coverFile = null;
    let previewUrl = "";
    let isSubmitting = false;

    const dispatch = createEventDispatcher();

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
            dispatch("add", { title, coverFile });
            setTimeout(() => {
                title = "";
                coverFile = null;
                previewUrl = "";
                isSubmitting = false;
                isOpen = false;
            }, 1000);
        }
    }

    function handleClose() {
        isOpen = false;
        title = "";
        coverFile = null;
        previewUrl = "";
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
            <h2>Ajouter un livre</h2>
            <form on:submit|preventDefault={handleSubmit}>
                <div class="form-group">
                    <label for="title">Titre du livre</label>
                    <input
                        type="text"
                        id="title"
                        bind:value={title}
                        required
                        disabled={isSubmitting}
                        placeholder="Titre du livre"
                    />
                </div>
                <div class="form-group">
                    <label for="cover">Photo de couverture</label>
                    <input
                        type="file"
                        id="cover"
                        accept="image/*"
                        on:change={handleFileChange}
                        disabled={isSubmitting}
                    />
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
</style>
