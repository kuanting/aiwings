<!-- Root App -->
<template>
  <Header />
  <main>
    <router-view />
  </main>
</template>

<script>
import Header from './components/Header/Header.vue'
export default {
  name: 'App',
  components: {
    Header
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;1,300;1,400&display=swap');

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  scroll-behavior: smooth;
}

#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  main {
    position: relative;
    top: 60px;
    width: 100%;
    overflow: hidden;
  }
}
</style>
