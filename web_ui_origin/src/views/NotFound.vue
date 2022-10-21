<template>
  <div class="container">
    <a-result
      status="404"
      title="404"
      sub-title="Sorry, the page you visited does not exist. Redirect to home page in 5 seconds"
    >
    </a-result>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  width: 100%;
  height: calc(100vh - 60px);
  justify-content: center;
  align-items: center;

  img {
    width: 500px;
    height: 500px;
  }
}
</style>
