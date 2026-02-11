export const getErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/configuration-not-found':
            return "L'authentification Email/Mot de passe n'est pas activée dans la console Firebase.";
        case 'auth/email-already-in-use':
            return "Cette adresse email est déjà utilisée.";
        case 'auth/invalid-email':
            return "L'adresse email n'est pas valide.";
        case 'auth/operation-not-allowed':
            return "Cette opération n'est pas autorisée.";
        case 'auth/weak-password':
            return "Le mot de passe est trop faible.";
        case 'auth/user-disabled':
            return "Cet utilisateur a été désactivé.";
        case 'auth/user-not-found':
            return "Aucun utilisateur trouvé avec cet email.";
        case 'auth/wrong-password':
            return "Mot de passe incorrect.";
        case 'auth/invalid-credential':
            return "Identifiants invalides.";
        default:
            return "Une erreur inconnue est survenue : " + errorCode;
    }
};
