<script>
    import { onMount } from "svelte";
    import { db } from "../config/firebase";
    import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
    import { user } from "../stores/auth";
    import { navigate } from "svelte-routing";

    let users = [];
    let loading = true;
    let error = "";

    onMount(async () => {
        if (!$user || $user.role !== "admin") {
            navigate("/");
            return;
        }
        await fetchUsers();
    });

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            users = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            loading = false;
        } catch (e) {
            error = "Erreur lors du chargement des utilisateurs : " + e.message;
            loading = false;
        }
    };

    const toggleAdmin = async (u) => {
        try {
            const newRole = u.role === "admin" ? "user" : "admin";
            await updateDoc(doc(db, "users", u.id), { role: newRole });
            // Update local state
            users = users.map((user) =>
                user.id === u.id ? { ...user, role: newRole } : user,
            );
        } catch (e) {
            alert("Erreur : " + e.message);
        }
    };
</script>

<div class="admin-panel">
    <h2>Panel Administrateur</h2>

    {#if loading}
        <p>Chargement...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else}
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Pseudo</th>
                        <th>Rôle</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each users as u}
                        <tr>
                            <td>{u.email}</td>
                            <td>{u.username}</td>
                            <td>
                                <span
                                    class="badge"
                                    class:admin={u.role === "admin"}
                                >
                                    {u.role}
                                </span>
                            </td>
                            <td>
                                {#if u.email !== $user.email}
                                    <button
                                        class="action-btn"
                                        on:click={() => toggleAdmin(u)}
                                    >
                                        {u.role === "admin"
                                            ? "Retirer Admin"
                                            : "Passer Admin"}
                                    </button>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

<style>
    .admin-panel {
        padding: 2rem;
        background-color: var(--card-bg);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
    }

    h2 {
        color: var(--primary);
        margin-bottom: 2rem;
    }

    .table-responsive {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    th,
    td {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color, #eee);
        color: var(--text-color);
    }

    th {
        font-weight: 600;
        background-color: rgba(0, 0, 0, 0.02);
    }

    .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.85rem;
        background-color: #e0e0e0;
        color: #333;
    }

    .badge.admin {
        background-color: var(--primary);
        color: white;
    }

    .action-btn {
        padding: 0.5rem 1rem;
        background-color: transparent;
        border: 1px solid var(--primary);
        color: var(--primary);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.9rem;
    }

    .action-btn:hover {
        background-color: var(--primary);
        color: white;
    }

    .error {
        color: #d32f2f;
    }
</style>
