<script>
  import { app } from './config/firebase.js';
  console.log('Firebase from Svelte:', app);
</script>

<main>
  <h1>Book Borrow</h1>
  <p>Svelte + Firebase initialized!</p>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
</style>
