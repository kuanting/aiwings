<!-- Root App -->
<template>
  <Header v-if="headerVisible" />
  <main :style="{ top: headerVisible ? '60px' : '' }">
    <router-view />
  </main>
</template>

<script>
import Header from './components/Header/Header.vue'
export default {
  name: 'App',
  components: {
    Header
  },
  data() {
    return {
      headerVisible: false
    }
  },
  watch: {
    $route(v) {
      this.headerVisible = !["/drone", "/drone01"].includes(v.path);
    }
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
    width: 100%;
    overflow: hidden;
  }
}
</style>
