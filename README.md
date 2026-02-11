# Book Borrow

A web application for managing book borrowing, built with **Svelte** and **Firebase**.

![Logo](./src/assets/logo.svg)

## 🛠️ Tech Stack

- **Frontend**: [Svelte](https://svelte.dev/) (Vite)
- **Backend (BaaS)**: [Firebase](https://firebase.google.com/)
  - **Authentication**: User management.
  - **Firestore**: Real-time NoSQL database.
- **Routing**: `svelte-routing`
- **Language**: JavaScript / CSS3 (Variables)

## 📦 Installation & Setup

1.  **Clone the project**
    ```bash
    git clone https://github.com/FlorentWasTaken/book_borrow.git
    cd book_borrow
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Firebase Configuration**
    Ensure you have environment variables or the `src/config/firebase.js` configuration file correctly set up with your API keys.

4.  **Start the development server**
    ```bash
    npm run dev
    ```

5.  **Build for production**
    ```bash
    npm run build
    ```

## 📝 Project Structure

- `src/components`: Reusable Svelte components (Login, AdminPanel, Sidebar...).
- `src/stores`: Global state management (Auth, Notifications).
- `src/config`: Firebase configuration.
- `src/assets`: Images and logos.

---

Developed with ❤️
