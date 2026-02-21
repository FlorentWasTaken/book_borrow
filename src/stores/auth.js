import { writable } from 'svelte/store';
import { auth, db } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    updateEmail,
    updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export const user = writable(null);
export const isLoading = writable(true);

let unsubscribeFirestore = null;

onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
        // If we already have a listener for a different user (shouldn't happen often), unsubscribe
        if (unsubscribeFirestore) {
            unsubscribeFirestore();
            unsubscribeFirestore = null;
        }

        const userDocRef = doc(db, "users", currentUser.uid);

        // Realtime listener
        unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
            let userData = { role: 'user' };

            if (docSnap.exists()) {
                userData = { role: 'user', ...docSnap.data() };
            } else {
                // Create user doc if it doesn't exist
                userData = {
                    email: currentUser.email,
                    username: currentUser.displayName || 'User',
                    role: 'user',
                    createdAt: new Date().toISOString()
                };
                setDoc(userDocRef, userData).catch(e => console.error("Error creating user doc:", e));
            }

            user.set({ ...currentUser, ...userData });
            isLoading.set(false);
        }, (error) => {
            console.error("Firestore Realtime Error:", error);
            // Fallback to basic auth info if firestore fails
            user.set({ ...currentUser, role: 'user' });
            isLoading.set(false);
        });

    } else {
        if (unsubscribeFirestore) {
            unsubscribeFirestore();
            unsubscribeFirestore = null;
        }
        user.set(null);
        isLoading.set(false);
    }
});

export const register = async (email, password, username) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
            displayName: username
        });

        // Create user document in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            email: email,
            username: username,
            role: 'user', // Default role
            inventoryVisibility: 'friends', // Default visibility
            createdAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: error.code };
    }
};

export const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.code };
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.code };
    }
};

export const updateUser = async (data) => {
    try {
        if (!auth.currentUser) return { success: false, error: "No user logged in" };

        if (data.displayName) {
            await updateProfile(auth.currentUser, { displayName: data.displayName });
        }

        if (data.email && data.email !== auth.currentUser.email) {
            await updateEmail(auth.currentUser, data.email);
        }

        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const firestoreData = {};
        if (data.displayName) firestoreData.username = data.displayName;
        if (data.email) firestoreData.email = data.email;
        if (data.inventoryVisibility) firestoreData.inventoryVisibility = data.inventoryVisibility;

        if (Object.keys(firestoreData).length > 0)
            await updateDoc(userDocRef, /** @type {any} */(firestoreData));

        user.update(currentUser => ({ ...currentUser, ...data }));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.code };
    }
};

export const updateUserPassword = async (newPassword) => {
    try {
        if (!auth.currentUser) return { success: false, error: "No user logged in" };
        await updatePassword(auth.currentUser, newPassword);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.code };
    }
};
