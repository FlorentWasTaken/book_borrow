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
    serverTimestamp,
    getDocs,
    updateDoc,
    arrayUnion,
    arrayRemove,
    getDoc
} from 'firebase/firestore';

export const friends = writable([]);
export const friendRequests = writable([]);
export const isLoadingFriends = writable(false);

let unsubscribeFriends = null;
let unsubscribeRequests = null;

const fetchUsersByIds = async (userIds) => {
    if (!userIds || userIds.length === 0) return [];

    try {
        const users = [];
        const chunkSize = 10;
        for (let i = 0; i < userIds.length; i += chunkSize) {
            const chunk = userIds.slice(i, i + chunkSize);
            const q = query(collection(db, "users"), where("__name__", "in", chunk));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });
        }
        return users;
    } catch (e) {
        console.error("Error fetching users by ids", e);
        return [];
    }
};

export const listenToFriends = (userId) => {
    isLoadingFriends.set(true);
    if (unsubscribeFriends) {
        unsubscribeFriends();
        unsubscribeFriends = null;
    }

    if (!userId) {
        friends.set([]);
        isLoadingFriends.set(false);
        return;
    }

    const userRef = doc(db, "users", userId);
    unsubscribeFriends = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            const friendIds = userData.friends || [];

            if (friendIds.length > 0) {
                const friendUsers = await fetchUsersByIds(friendIds);
                friends.set(friendUsers);
            } else {
                friends.set([]);
            }
        }
        isLoadingFriends.set(false);
    }, (error) => {
        console.error("Error listening to friends:", error);
        isLoadingFriends.set(false);
    });
};

export const listenToFriendRequests = (userId) => {
    if (unsubscribeRequests) {
        unsubscribeRequests();
        unsubscribeRequests = null;
    }

    if (!userId) {
        friendRequests.set([]);
        return;
    }

    const q = query(collection(db, "friend_requests"),
        where("receiverId", "==", userId),
        where("status", "==", "pending")
    );

    unsubscribeRequests = onSnapshot(q, async (snapshot) => {
        const requests = [];
        const senderIds = [];

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            requests.push({ id: doc.id, ...data });
            if (!senderIds.includes(data.senderId)) {
                senderIds.push(data.senderId);
            }
        });

        if (senderIds.length > 0) {
            const senders = await fetchUsersByIds(senderIds);
            const requestsWithSenders = requests.map(req => {
                const sender = senders.find(s => s.id === req.senderId);
                return { ...req, sender };
            });
            friendRequests.set(requestsWithSenders);
        } else {
            friendRequests.set([]);
        }

    }, (error) => {
        console.error("Error listening to friend requests:", error);
    });
};

export const checkSentRequestStatus = async (senderId, receiverId) => {
    try {
        const q = query(collection(db, "friend_requests"),
            where("senderId", "==", senderId),
            where("receiverId", "==", receiverId),
            where("status", "==", "pending")
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (e) {
        console.error("Error checking sent request", e);
        return false;
    }
}

export const sendFriendRequest = async (receiverId) => {
    try {
        if (!auth.currentUser) throw new Error("Not authenticated");

        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().friends?.includes(receiverId)) {
            return { success: false, error: "Vous êtes déjà amis." };
        }

        const q = query(collection(db, "friend_requests"),
            where("senderId", "==", auth.currentUser.uid),
            where("receiverId", "==", receiverId),
            where("status", "==", "pending")
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return { success: false, error: "Demande déjà envoyée." };
        }

        await addDoc(collection(db, "friend_requests"), {
            senderId: auth.currentUser.uid,
            receiverId: receiverId,
            status: 'pending',
            createdAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending friend request", error);
        return { success: false, error: error.message };
    }
};

export const acceptFriendRequest = async (requestId, senderId) => {
    try {
        if (!auth.currentUser) throw new Error("Not authenticated");

        await deleteDoc(doc(db, "friend_requests", requestId));

        const currentUserRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(currentUserRef, {
            friends: arrayUnion(senderId)
        });

        const senderRef = doc(db, "users", senderId);
        await updateDoc(senderRef, {
            friends: arrayUnion(auth.currentUser.uid)
        });

        return { success: true };
    } catch (error) {
        console.error("Error accepting friend request", error);
        return { success: false, error: error.message };
    }
};

export const rejectFriendRequest = async (requestId) => {
    try {
        await deleteDoc(doc(db, "friend_requests", requestId));
        return { success: true };
    } catch (error) {
        console.error("Error rejecting friend request", error);
        return { success: false, error: error.message };
    }
}

export const removeFriend = async (friendId) => {
    try {
        if (!auth.currentUser) throw new Error("Not authenticated");

        const currentUserRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(currentUserRef, {
            friends: arrayRemove(friendId)
        });
        const friendRef = doc(db, "users", friendId);
        await updateDoc(friendRef, {
            friends: arrayRemove(auth.currentUser.uid)
        });

        return { success: true };
    } catch (error) {
        console.error("Error removing friend", error);
        return { success: false, error: error.message };
    }
}
