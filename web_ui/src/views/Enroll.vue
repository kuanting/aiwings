//enroll view

<template>
  <div class="container">
    <Enroll />
  </div>
</template>

<script>
import Enroll from'../components/Enroll_drones/Enroll.vue'
export default {
  name: 'Login',
  components: { Enroll }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
