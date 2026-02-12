import { writable } from 'svelte/store';
import { db, auth } from '../config/firebase';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    updateDoc,
    serverTimestamp,
    getDocs
} from 'firebase/firestore';

export const books = writable([]);
export const isLoadingBooks = writable(false);
export const users = writable([]);

let unsubscribeOwned = null;
let unsubscribeBorrowed = null;

export const getAllUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        users.set(usersList);
        return usersList;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

export const fetchUserBooks = (userId) => {
    isLoadingBooks.set(true);
    if (unsubscribeOwned) {
        unsubscribeOwned();
        unsubscribeOwned = null;
    }
    if (unsubscribeBorrowed) {
        unsubscribeBorrowed();
        unsubscribeBorrowed = null;
    }

    if (!userId) {
        books.set([]);
        isLoadingBooks.set(false);
        return;
    }

    let ownedBooks = [];
    let borrowedBooks = [];

    const updateBooksStore = () => {
        // De-duplicate if needed, though they shouldn't overlap
        const allBooks = [...ownedBooks, ...borrowedBooks];
        books.set(allBooks);
        isLoadingBooks.set(false);
    };

    // Query 1: Owned Books
    const qOwned = query(collection(db, "books"), where("ownerId", "==", userId));
    unsubscribeOwned = onSnapshot(qOwned, (snapshot) => {
        ownedBooks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        updateBooksStore();
    }, (error) => {
        console.error("Error fetching owned books:", error);
        isLoadingBooks.set(false);
    });

    // Query 2: Borrowed Books
    const qBorrowed = query(collection(db, "books"), where("lentTo", "==", userId));
    unsubscribeBorrowed = onSnapshot(qBorrowed, (snapshot) => {
        borrowedBooks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        updateBooksStore();
    }, (error) => {
        console.error("Error fetching borrowed books:", error);
        // Don't necessarily stop loading if owned query is fine, but good to know
    });
};

// Helper to convert file to base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

export const addBook = async (bookData) => {
    try {
        if (!auth.currentUser) throw new Error("User not authenticated");

        const { title, coverUrl, coverFile } = bookData;
        let finalCoverUrl = coverUrl;

        // If a file is provided, convert to Base64
        if (coverFile) {
            try {
                // Basic validation for size (e.g., limit to ~1MB to avoid Firestore document limits)
                if (coverFile.size > 1048576) {
                    return { success: false, error: "L'image est trop volumineuse (max 1Mo)." };
                }
                finalCoverUrl = await fileToBase64(coverFile);
            } catch (e) {
                console.error("Error converting file:", e);
                return { success: false, error: "Erreur lors du traitement de l'image." };
            }
        }

        await addDoc(collection(db, "books"), {
            title,
            coverUrl: finalCoverUrl || null,
            ownerId: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            status: 'available', // available, lent
            lentTo: null
        });
        return { success: true };
    } catch (error) {
        console.error("Error adding book:", error);
        return { success: false, error: error.message };
    }
};

export const deleteBook = async (bookId) => {
    try {
        await deleteDoc(doc(db, "books", bookId));
        return { success: true };
    } catch (error) {
        console.error("Error deleting book:", error);
        return { success: false, error: error.message };
    }
};

export const lendBook = async (bookId, targetUser) => {
    try {
        await updateDoc(doc(db, "books", bookId), {
            status: 'lent',
            lentTo: targetUser.id,
            lentToEmail: targetUser.email,
            lentToName: targetUser.username || targetUser.email,
            lentAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("Error lending book:", error);
        return { success: false, error: error.message };
    }
};

export const returnBook = async (bookId) => {
    try {
        await updateDoc(doc(db, "books", bookId), {
            status: 'available',
            lentTo: null,
            lentToEmail: null,
            lentToName: null,
            lentAt: null
        });
        return { success: true };
    } catch (error) {
        console.error("Error returning book:", error);
        return { success: false, error: error.message };
    }
}

export const giveBook = async (bookId, targetUser) => {
    try {
        await updateDoc(doc(db, "books", bookId), {
            ownerId: targetUser.id,
            status: 'available',
            lentTo: null,
            lentToEmail: null,
            lentToName: null
        });
        return { success: true };
    } catch (error) {
        console.error("Error giving book:", error);
        return { success: false, error: error.message };
    }
};
