<template>
  <div class="container">
    <div class="drone1">
      <img src="../../assets/drone1.gif" />
    </div>
    <div class="drone2">
      <img src="../../assets/drone1.gif" />
    </div>
    <div class="drone3"><img src="../../assets/drone1.gif" /></div>

    <!-- <p> DroneInfo </p> -->
  </div>
</template>

<script>
</script>


<style lang="scss" scoped>
.container {
  display: flex;
}
.drone1 {
  margin-top: 20px;
  margin-left: 50px;

  width: 70px;
  height: 70px;
}

.drone2 {
  margin-top: 20px;
  margin-left: 20px;
  width: 70px;
  height: 70px;
}

.drone3 {
  margin-top: 20px;
  margin-left: 20px;
  width: 70px;
  height: 70px;
}

img {
  width: 70px;
  height: 70px;
  border-radius: 50%; //圆角百分比ＦＦ
}
</style>