<script>
    import { createEventDispatcher } from "svelte";
    import { fade, fly } from "svelte/transition";

    export let isOpen = false;
    export let title = "";

    const dispatch = createEventDispatcher();

    function close() {
        isOpen = false;
        dispatch("close");
    }
</script>

{#if isOpen}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="backdrop"
        on:click={close}
        transition:fade={{ duration: 200 }}
    ></div>

    <div class="sheet" transition:fly={{ y: 300, duration: 300 }}>
        <div class="header">
            <h3>{title}</h3>
            <button class="close-btn" on:click={close}>&times;</button>
        </div>
        <div class="content">
            <slot />
        </div>
    </div>
{/if}

<style>
    .backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
    }

    .sheet {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: var(--card-bg, #fff);
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        padding: 1.5rem;
        z-index: 1001;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        max-height: 80vh;
        overflow-y: auto;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-color, #eee);
    }

    h3 {
        margin: 0;
        font-size: 1.2rem;
        color: var(--text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 90%;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-muted);
        padding: 0;
        line-height: 1;
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
</style>
