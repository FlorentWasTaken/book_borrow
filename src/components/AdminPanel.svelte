<script>
    import { onMount } from "svelte";
    import { db } from "../config/firebase";
    import {
        collection,
        getDocs,
        doc,
        updateDoc,
        deleteDoc,
    } from "firebase/firestore";
    import { auth } from "../config/firebase";
    import { user } from "../stores/auth";
    import { navigate } from "svelte-routing";
    import { addNotification } from "../stores/notifications";
    import Modal from "./Modal.svelte";

    let users = [];
    let loading = true;
    let error = "";

    // Modal state
    let showDeleteModal = false;
    let showEditModal = false;
    let userToDelete = null;
    let userToEdit = null;
    let editForm = { username: "", email: "" };

    // Search & Sort state
    let searchQuery = "";
    let sortColumn = "email";
    let sortDirection = "asc";

    $: filteredUsers = users
        .filter(
            (u) =>
                u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.username &&
                    u.username
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())),
        )
        .sort((a, b) => {
            let aVal = a[sortColumn] || "";
            let bVal = b[sortColumn] || "";

            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

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
            addNotification(
                "Erreur lors du chargement des utilisateurs",
                "error",
            );
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
            addNotification(`Rôle mis à jour pour ${u.username}`, "success");
        } catch (e) {
            addNotification("Erreur : " + e.message, "error");
        }
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            sortDirection = sortDirection === "asc" ? "desc" : "asc";
        } else {
            sortColumn = column;
            sortDirection = "asc";
        }
    };

    const promptDelete = (u) => {
        userToDelete = u;
        showDeleteModal = true;
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await deleteDoc(doc(db, "users", userToDelete.id));
            // Update local state by removing deleted user
            users = users.filter((user) => user.id !== userToDelete.id);
            addNotification(
                `Utilisateur ${userToDelete.email} supprimé`,
                "success",
            );
        } catch (e) {
            addNotification(
                "Erreur lors de la suppression : " + e.message,
                "error",
            );
        } finally {
            showDeleteModal = false;
            userToDelete = null;
        }
    };

    const cancelDelete = () => {
        showDeleteModal = false;
        userToDelete = null;
    };

    // Edit logic
    const promptEdit = (u) => {
        userToEdit = u;
        editForm = { username: u.username || "", email: u.email || "" };
        showEditModal = true;
    };

    const saveEdit = async () => {
        if (!userToEdit) return;

        try {
            await updateDoc(doc(db, "users", userToEdit.id), {
                username: editForm.username,
            });

            // Update local state
            users = users.map((u) =>
                u.id === userToEdit.id
                    ? { ...u, username: editForm.username }
                    : u,
            );

            addNotification("Utilisateur modifié avec succès", "success");
            showEditModal = false;
            userToEdit = null;
        } catch (e) {
            addNotification("Erreur : " + e.message, "error");
        }
    };

    const cancelEdit = () => {
        showEditModal = false;
        userToEdit = null;
    };
</script>

<div class="admin-panel">
    <h2>Panel Administrateur</h2>

    <div class="controls">
        <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            bind:value={searchQuery}
            class="search-input"
        />
    </div>

    {#if loading}
        <p>Chargement...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else}
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th
                            on:click={() => handleSort("email")}
                            class="sortable"
                        >
                            Email {sortColumn === "email"
                                ? sortDirection === "asc"
                                    ? "▲"
                                    : "▼"
                                : ""}
                        </th>
                        <th
                            on:click={() => handleSort("username")}
                            class="sortable"
                        >
                            Pseudo {sortColumn === "username"
                                ? sortDirection === "asc"
                                    ? "▲"
                                    : "▼"
                                : ""}
                        </th>
                        <th
                            on:click={() => handleSort("role")}
                            class="sortable"
                        >
                            Rôle {sortColumn === "role"
                                ? sortDirection === "asc"
                                    ? "▲"
                                    : "▼"
                                : ""}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filteredUsers as u (u.id)}
                        <tr>
                            <td>{u.email}</td>
                            <td>{u.username || "-"}</td>
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
                                        title="Changer le rôle"
                                    >
                                        {u.role === "admin"
                                            ? "Retirer Admin"
                                            : "Passer Admin"}
                                    </button>
                                    <button
                                        class="action-btn edit"
                                        on:click={() => promptEdit(u)}
                                        title="Modifier l'utilisateur"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        class="action-btn delete"
                                        on:click={() => promptDelete(u)}
                                        title="Supprimer l'utilisateur"
                                    >
                                        🗑️
                                    </button>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

    <!-- Delete Modal -->
    <Modal
        isOpen={showDeleteModal}
        title="Supprimer l'utilisateur"
        message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        on:confirm={confirmDelete}
        on:close={cancelDelete}
    />

    <!-- Edit Modal -->
    <Modal
        isOpen={showEditModal}
        title="Modifier l'utilisateur"
        confirmText="Enregistrer"
        cancelText="Annuler"
        type="info"
        on:confirm={saveEdit}
        on:close={cancelEdit}
    >
        <div class="form-group">
            <label for="edit-username">Nom d'utilisateur</label>
            <input
                type="text"
                id="edit-username"
                bind:value={editForm.username}
                class="modal-input"
            />
        </div>
        <div class="form-group">
            <label for="edit-email">Email (Non modifiable)</label>
            <input
                type="email"
                id="edit-email"
                value={editForm.email}
                disabled
                class="modal-input disabled"
            />
        </div>
    </Modal>
</div>

<style>
    .admin-panel {
        padding: 2rem;
        background-color: var(--card-bg);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 100%; /* Use full width */
        margin: 0 auto;
    }

    /* ... existing styles ... */

    .action-btn.edit:hover {
        background-color: #2196f3;
        color: white;
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

    th:last-child,
    td:last-child {
        text-align: right;
        white-space: nowrap;
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

    .action-btn.delete {
        border-color: #d32f2f;
        color: #d32f2f;
        margin-left: 0.5rem;
    }

    .action-btn.delete:hover {
        background-color: #d32f2f;
        color: white;
    }

    .error {
        color: #d32f2f;
    }

    .controls {
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: flex-start;
    }

    .search-input {
        padding: 0.75rem;
        border: 1px solid var(--border-color, #ccc);
        border-radius: 4px;
        width: 100%;
        max-width: 400px;
        font-size: 1rem;
        background-color: var(--bg-color);
        color: var(--text-color);
    }

    th.sortable {
        cursor: pointer;
        user-select: none;
    }

    th.sortable:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }

    .action-btn.edit {
        border-color: #2196f3;
        color: #2196f3;
        margin-left: 0.5rem;
    }

    .action-btn.edit:hover {
        background-color: #2196f3;
        color: white;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--text-color, #333);
    }

    .modal-input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
    }

    .modal-input.disabled {
        background-color: #f5f5f5;
        color: #666;
        cursor: not-allowed;
    }
</style>
