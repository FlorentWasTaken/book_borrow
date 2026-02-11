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
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const user = writable(null);
export const isLoading = writable(true);

onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
        let userData = { role: 'user' }; // Default if fetch fails
        try {
            const userDocRef = doc(db, "users", currentUser.uid);

            // Timeout promise to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Firestore timeout")), 5000)
            );

            const userDoc = await Promise.race([
                getDoc(userDocRef),
                timeoutPromise
            ]);

            if (userDoc.exists()) {
                userData = { role: 'user', ...userDoc.data() };
            } else {
                // Create user doc for existing users who login for the first time after this update
                userData = {
                    email: currentUser.email,
                    username: currentUser.displayName || 'User',
                    role: 'user',
                    createdAt: new Date().toISOString()
                };
                // Don't await this if it's blocked, let it fail silently or in background
                setDoc(userDocRef, userData).catch(e => console.error("Error creating user doc:", e));
            }
        } catch (e) {
            console.error("Firestore Error or Timeout (User Data):", e);
            // Fallback to default user role
        }

        user.set({ ...currentUser, ...userData });
    } else {
        user.set(null);
    }
    isLoading.set(false);
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

        // Force update of the user store
        const updatedUser = { ...auth.currentUser, ...data };
        user.set(updatedUser);
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
