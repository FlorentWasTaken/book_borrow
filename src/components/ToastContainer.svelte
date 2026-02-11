<script>
    import { notifications } from "../stores/notifications";
    import Toast from "./Toast.svelte";
</script>

<div class="toast-container">
    {#each $notifications as notification (notification.id)}
        <Toast {notification} />
    {/each}
</div>

<style>
    .toast-container {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        pointer-events: none;
    }
</style>
