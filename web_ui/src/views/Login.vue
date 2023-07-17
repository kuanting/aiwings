<template>
  <div class="container">
    <LoginForm />
  </div>
</template>

<script>
import LoginForm from '../components/Login/LoginForm.vue'
export default {
  name: 'Login',
  components: { LoginForm }
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
