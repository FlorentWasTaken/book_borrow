<script>
    import { fly } from "svelte/transition";
    import { removeNotification } from "../stores/notifications";

    export let notification;

    const { id, message, type } = notification;

    const icons = {
        success: "✅",
        error: "❌",
        info: "ℹ️",
        warning: "⚠️",
    };

    function handleKeydown(event) {
        if (event.key === "Enter" || event.key === " ") {
            removeNotification(id);
        }
    }
</script>

<div
    class="toast {type}"
    transition:fly={{ y: 20, duration: 300 }}
    on:click={() => removeNotification(id)}
    on:keydown={handleKeydown}
    role="button"
    tabindex="0"
>
    <span class="icon">{icons[type] || icons.info}</span>
    <span class="message">{message}</span>
</div>

<style>
    .toast {
        display: flex;
        align-items: center;
        background: white;
        border-radius: 8px;
        padding: 1rem 1.5rem;
        margin-bottom: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        min-width: 300px;
        max-width: 450px;
        border-left: 6px solid #ccc;
        pointer-events: auto;
    }

    .toast:hover {
        opacity: 0.95;
    }

    .toast.success {
        border-left-color: #4caf50;
    }
    .toast.error {
        border-left-color: #f44336;
    }
    .toast.info {
        border-left-color: #2196f3;
    }
    .toast.warning {
        border-left-color: #ff9800;
    }

    .icon {
        margin-right: 1rem;
        font-size: 1.2rem;
    }

    .message {
        color: #333;
        font-weight: 500;
        font-size: 0.95rem;
    }
</style>
