<script>
    import { createEventDispatcher } from "svelte";

    export let isOpen = false;
    export let title = "Confirmation";
    export let message = "Êtes-vous sûr ?";
    export let confirmText = "Confirmer";
    export let cancelText = "Annuler";
    export let isDanger = false;

    const dispatch = createEventDispatcher();

    function handleConfirm() {
        dispatch("confirm");
        isOpen = false;
    }

    function handleClose() {
        dispatch("cancel");
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
            <p>{message}</p>
            <div class="actions">
                <button type="button" on:click={handleClose}
                    >{cancelText}</button
                >
                <button
                    type="button"
                    class:danger={isDanger}
                    class:primary={!isDanger}
                    on:click={handleConfirm}>{confirmText}</button
                >
            </div>
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
        text-align: center;
    }

    h2 {
        margin-top: 0;
        color: var(--text-color);
    }

    p {
        margin-bottom: 2rem;
        color: var(--text-muted, #666);
    }

    .actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }

    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background: #f0f0f0;
        color: #333;
        font-weight: 600;
    }

    button.primary {
        background: var(--primary, #007bff);
        color: white;
    }

    button.danger {
        background: #dc3545;
        color: white;
    }

    button:hover {
        opacity: 0.9;
    }
</style>
