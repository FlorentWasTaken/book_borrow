<script>
    import { slide } from "svelte/transition";

    let sections = [
        {
            id: "add",
            title: "➕ Ajouter un Livre",
            isOpen: true,
            content: `
                <p>Enrichissez votre bibliothèque en quelques clics.</p>
                <ul>
                    <li>Cliquez sur le bouton <strong>+ Ajouter un livre</strong> en haut à droite.</li>
                    <li>Entrez le <strong>titre</strong> du livre.</li>
                    <li>Ajoutez une <strong>image de couverture</strong> (via URL ou fichier).</li>
                    <li>Validez pour l'ajouter à votre collection.</li>
                </ul>
            `,
        },
        {
            id: "actions",
            title: "🤝 Prêter ou Donner",
            isOpen: false,
            content: `
                <p>Partagez vos lectures avec d'autres utilisateurs.</p>
                <ul>
                    <li><strong>Prêter :</strong> Cliquez sur "Prêter" sur la carte d'un livre. Choisissez l'utilisateur à qui vous le prêtez. le livre reste le vôtre mais est marqué comme "Prêté".</li>
                    <li><strong>Retour :</strong> Quand vous récupérez votre livre, cliquez sur "Marquer comme rendu".</li>
                    <li><strong>Donner :</strong> Si vous voulez céder définitivement un livre, utilisez l'option "Donner". Le livre disparaîtra de votre bibliothèque et apparaîtra dans celle du nouveau propriétaire.</li>
                </ul>
            `,
        },
        {
            id: "profile",
            title: "👤 Mon Profil",
            isOpen: false,
            content: `
                <p>Gérez vos informations personnelles.</p>
                <ul>
                    <li>Accédez à votre profil via le menu latéral.</li>
                    <li>Vous pouvez y changer votre <strong>pseudo</strong>, votre <strong>mot de passe</strong> ou supprimer votre compte.</li>
                </ul>
            `,
        },
    ];

    function toggleSection(index) {
        sections = sections.map((section, i) => {
            if (i === index) {
                return { ...section, isOpen: !section.isOpen };
            }
            return { ...section, isOpen: false }; // Close others for accordion effect
        });
    }
</script>

<div class="user-guide">
    <h2>📖 Guide d'Utilisation</h2>
    <div class="guide-container">
        {#each sections as section, index}
            <div class="guide-section" class:open={section.isOpen}>
                <button
                    class="guide-header"
                    on:click={() => toggleSection(index)}
                    aria-expanded={section.isOpen}
                >
                    <span class="title">{section.title}</span>
                    <span class="icon">{section.isOpen ? "−" : "+"}</span>
                </button>
                {#if section.isOpen}
                    <div class="guide-content" transition:slide>
                        {@html section.content}
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>

<style>
    .user-guide {
        margin-top: 2rem;
        width: 100%;
        max-width: 800px;
        background: var(--card-bg);
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    h2 {
        color: var(--primary);
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
        text-align: center;
        border-bottom: 2px solid var(--primary-light, #eee);
        padding-bottom: 0.5rem;
    }

    .guide-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .guide-section {
        border: 1px solid var(--border-color, #eee);
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
    }

    .guide-section.open {
        border-color: var(--primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .guide-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: var(--bg-secondary, #f9f9f9);
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-color);
        transition: background-color 0.2s;
    }

    .guide-header:hover {
        background-color: var(--bg-hover, #f0f0f0);
    }

    .guide-section.open .guide-header {
        background-color: var(--primary-light);
        color: var(--primary);
    }

    .icon {
        font-size: 1.5rem;
        line-height: 1;
        font-weight: normal;
    }

    .guide-content {
        padding: 1rem 1.5rem;
        background: var(--card-bg);
        color: var(--text-color);
        line-height: 1.6;
        border-top: 1px solid var(--border-color, #eee);
    }

    .guide-content :global(ul) {
        padding-left: 1.5rem;
        margin: 0.5rem 0;
    }

    .guide-content :global(li) {
        margin-bottom: 0.5rem;
    }

    .guide-content :global(strong) {
        color: var(--primary);
    }
</style>
