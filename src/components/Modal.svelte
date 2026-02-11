<script>
    import { createEventDispatcher } from "svelte";
    import { fly, fade } from "svelte/transition";

    export let isOpen = false;
    export let title = "Confirmation";
    export let message = "Êtes-vous sûr ?";
    export let confirmText = "Confirmer";
    export let cancelText = "Annuler";
    export let type = "danger"; // danger, warning, info

    const dispatch = createEventDispatcher();

    const close = () => {
        dispatch("close");
    };

    const confirm = () => {
        dispatch("confirm");
    };

    function handleKeydown(e) {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
            close();
        }
    }
</script>

{#if isOpen}
    <div
        class="modal-backdrop"
        on:click={close}
        on:keydown={handleKeydown}
        role="button"
        tabindex="0"
        transition:fade={{ duration: 200 }}
    >
        <div
            class="modal"
            role="dialog"
            aria-modal="true"
            on:click|stopPropagation
            on:keydown|stopPropagation
            tabindex="-1"
            transition:fly={{ y: -20, duration: 300 }}
        >
            <header>
                <h3>{title}</h3>
                <button class="close-btn" on:click={close}>&times;</button>
            </header>
            <div class="content">
                <slot>
                    <p>{message}</p>
                </slot>
            </div>
            <footer>
                <button class="btn cancel" on:click={close}>{cancelText}</button
                >
                <button class="btn confirm {type}" on:click={confirm}
                    >{confirmText}</button
                >
            </footer>
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
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(2px);
    }

    .modal {
        background-color: var(--card-bg, white);
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 400px;
        overflow: hidden;
    }

    header {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--border-color, #eee);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    h3 {
        margin: 0;
        color: var(--text-color, #333);
        font-size: 1.1rem;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-muted, #666);
        padding: 0;
        line-height: 1;
    }

    .close-btn:hover {
        color: var(--text-color, #333);
    }

    .content {
        padding: 1.5rem;
        color: var(--text-color, #333);
    }

    p {
        margin: 0;
        line-height: 1.5;
    }

    footer {
        padding: 1rem 1.5rem;
        background-color: var(--bg-color, #f9f9f9);
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        border-top: 1px solid var(--border-color, #eee);
    }

    .btn {
        padding: 0.6rem 1.2rem;
        border-radius: 4px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.2s;
    }

    .btn.cancel {
        background-color: white;
        border-color: #ddd;
        color: #333;
    }

    .btn.cancel:hover {
        background-color: #f5f5f5;
    }

    .btn.confirm.danger {
        background-color: #d32f2f;
        color: white;
    }

    .btn.confirm.danger:hover {
        background-color: #b71c1c;
    }
</style>
