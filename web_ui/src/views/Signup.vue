<template>
  <div class="container">
    <SignupForm />
  </div>
</template>

<script>
import SignupForm from '../components/Signup/SignupForm.vue'
export default {
  name: 'Signup',
  components: { SignupForm }
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
