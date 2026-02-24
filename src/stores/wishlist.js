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
    serverTimestamp
} from 'firebase/firestore';
import { addBook } from './books';

export const wishlist = writable([]);
export const isLoadingWishlist = writable(false);

let unsubscribeWishlist = null;

export const fetchWishlist = (userId) => {
    isLoadingWishlist.set(true);
    if (unsubscribeWishlist) {
        unsubscribeWishlist();
        unsubscribeWishlist = null;
    }

    if (!userId) {
        wishlist.set([]);
        isLoadingWishlist.set(false);
        return;
    }

    const q = query(collection(db, "wishlist"), where("userId", "==", userId));
    unsubscribeWishlist = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        wishlist.set(items);
        isLoadingWishlist.set(false);
    }, (error) => {
        console.error("Error fetching wishlist:", error);
        isLoadingWishlist.set(false);
    });
};

export const addToWishlist = async (bookData) => {
    try {
        if (!auth.currentUser) throw new Error("User not authenticated");

        const { title, coverUrl } = bookData;

        await addDoc(collection(db, "wishlist"), {
            title,
            coverUrl: coverUrl || null,
            userId: auth.currentUser.uid,
            createdAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        return { success: false, error: error.message };
    }
};

export const removeFromWishlist = async (wishId) => {
    try {
        await deleteDoc(doc(db, "wishlist", wishId));
        return { success: true };
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        return { success: false, error: error.message };
    }
};

export const moveToLibrary = async (wishId, bookData) => {
    try {
        const result = await addBook({
            title: bookData.title,
            coverUrl: bookData.coverUrl,
            coverFile: null
        });

        if (result.success) {
            await deleteDoc(doc(db, "wishlist", wishId));
            return { success: true };
        } else {
            return result;
        }
    } catch (error) {
        console.error("Error moving to library:", error);
        return { success: false, error: error.message };
    }
};
