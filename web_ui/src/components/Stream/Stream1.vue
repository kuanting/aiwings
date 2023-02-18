<template>
  <div class="wrap">
    <div class="main_frame">
      <div class="main_video"></div>
      <div class="info_dashboard"></div>
    </div>
    <div class="select_frame">
      <div class="subvideo_content">
        <div v-for="index in droneArr" class="subVideoStream" >
          <div class="details">
            <h2>{{ index.id }}</h2>
          </div>
          <div class="video" @click="select_drone_video(index.id)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, reactive } from '@vue/runtime-core'

export default {
  name: 'monitor',

  setup() {
    const store = useStore()
    const userInfo = computed(() => store.getters.getUserInfo)
    const droneArr = userInfo.value.droneId


    const select_drone_video = (droneID)=>{
      console.log('click', droneID)
    }
    return {
      droneArr,
      select_drone_video
    }
  }
}
</script>

<style lang="scss" scoped>
.wrap {
  width: 100%;
  height: calc(100vh - 10px);
  display: flex;
  position: fixed;
  background: #c7c4c4ca;
}
.main_frame {
  border-radius: 3%;
  // background: rgb(23, 151, 68, 0.3);
  width: 60%;
  height: 93%;
  padding: 10px;
  margin: 10px;
  background: #6f6e6eca;

  .main_video {
    display: flex;
    width: auto;
    height: 80%;
    border-radius: 3%;
    background-image: url('../../assets/live-stream.png');
    background-size: 100% 100%;
    @media (min-width: 300px) {
      visibility: visible;
    }
  }
  .info_dashboard {
    background-color: rgb(90, 55, 194);
    display: flex;
    margin: 2%;
    width: auto;
    height: 15%;
    border-radius: 3%;
  }
}
.select_frame {
  /* background: blue; */
  width: 35%;
  height: 100%;
  padding: 10px;
  margin: 1%;
  display: flex;
  flex-direction: column;
  flex: 0 0;
  flex-basis: auto;
  background: #6f6e6eca;
  border-radius: 3%;
  .subvideo_content {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
  }
  .subVideoStream {
    display: flex;
    width: 100%;
    height: 30%;
    padding: 10px;
    margin-right: 5%;
  }
  .details {
    background-color: rgba(1, 313, 3, 0.5);
    width: 30%;
    height: 100%;
    align-items: center;
    border-radius: 5%;
    margin: 10px;
  }

  .video {
    width: 70%;
    height: 100%;
    background-image: url('../../assets/live-stream.png');
    background-size: 100% 100%;
    border-radius: 5%;
    margin: 10px;
  }
}
</style>