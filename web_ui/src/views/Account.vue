<template>
  <div class="container">
    <AccountForm />
  </div>
</template>

<script>
import AccountForm from '../components/Account/AccountForm.vue'
export default {
  name: 'Account',
  components: {
    AccountForm
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  overflow: scroll;
}
</style>
