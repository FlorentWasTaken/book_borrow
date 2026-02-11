import { writable } from 'svelte/store';
import { auth } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';

export const user = writable(null);
export const isLoading = writable(true);

onAuthStateChanged(auth, (currentUser) => {
    user.set(currentUser);
    isLoading.set(false);
});

export const register = async (email, password, username) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
            displayName: username
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
