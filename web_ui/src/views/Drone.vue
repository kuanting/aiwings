<template>
  <div class="drone-page-root">
    <div class="map-container">
      <Mapbox />
    </div>
    <div class="covers">
      <div class="top-box">
        <div class="topleft-box">
          <management-title />
        </div>
        <div class="topright-box">
          <management-header />
        </div>
      </div>
      <div class="bottom-box">
        <div class="bottomleft-box">
          <!-- <Stream /> -->
        </div>
        <div class="bottomcenter-box">
          <DroneInfoDashBoardVue />
        </div>
        <div class="bottomright-box">
          <Control />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Mapbox from '../components/Mapbox/Mapbox.vue'
import ManagementTitle from '../components/Header/ManagementTitle.vue'
import ManagementHeader from '../components/Header/ManagementHeader.vue'
import Control from '../components/Control/Control.vue'
import Stream from '../components/Stream/Stream.vue'
import DroneInfoDashBoardVue from '../components/Drone_Dashboard/DroneInfoDashBoard.vue'
import socket from '../lib/websocket'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
import { computed, onBeforeUnmount } from '@vue/runtime-core'

import { transformDataFormat } from '../lib/transformDataFormat'

export default {
  name: 'Drone',
  components: {
    Mapbox,
    ManagementTitle,
    ManagementHeader,
    Stream,
    Control,
    DroneInfoDashBoardVue
  },
  setup() {
    const store = useStore()
    const rabbitmqIsInit = computed(() => store.getters.getRabbitmqIsInit)
    const user = computed(() => store.getters.getUserInfo)
    const saveLogs = (log) => store.dispatch('setLogs', log)

    /*************** rabbitmqInit *****************/
    const rabbitmqInit = () => {
      // console.log('user: ', user.value.droneId[0])
      // console.log("rabbitmqInit() \n socket.id = ",socket.id)
      saveLogs(`Websocket connected: ${socket.id}`)
      for (let i in user.value.droneId) {
        saveLogs(`Drone ID: ${user.value.droneId[i]}`)
      }
      socket.emit('establish-rabbitmq-connection-drone', user.value.droneId) //傳送此事件到後端，後端webSocket監聽到此事件後，會建立所有droneId的 rabbitMq Queue
    }

    // Trigger RabbitMQ when the first come or refresh pages
    console.log("rabbitmqIsInit.value = ",rabbitmqIsInit.value)
    if (!rabbitmqIsInit.value) {
      rabbitmqInit()
      store.dispatch('setRabbitmqIsInit', true)
    }

    
    /************ Websocket event listening *************/
    socket.on('connect', () => rabbitmqInit())
    socket.on('disconnect', (reason) => {
      saveLogs(`Websocket disconnected: ${reason}`)
    })
    socket.on('queue-created', (queueName) => {
      saveLogs(`Queue created: ${queueName}`)
    })

    socket.on('drone-topic', (data) => {
      // console.log("監聽無人機傳遞的資訊")
      if (data.type === 'message') {
        // console.log('Here: ', data.drone_info.drone_id)
        // console.log('droneInfo from backend: ', data)
        let droneInfo= transformDataFormat(data) // 轉換資料格式為適用於多台無人機的格式
        // 轉換後的資料格式為：droneInfo = {[drone_id]: {......}}
        store.dispatch('drone/setDroneInfo', droneInfo)
      }
      if (data.type === 'cmd_ack') {
        if (data.cmd_result.includes('ACCEPTED')) {
          message.success(data.cmd_result)
        } else {
          message.error(data.cmd_result)
        }
        saveLogs(data.cmd)
      }

      if (data.type === 'mission_ack') {
        if (data.mission_result.includes('ACCEPTED')) {
          message.success(data.mission_result)
        } else {
          message.error(data.mission_result)
        }
        saveLogs(data.mission_result)
      }

      if (data.type === 'apm_text') {
        saveLogs(data.text)
      }
    })

    // Remove listener to prevent multiple listening
    onBeforeUnmount(() => {
      console.log("------ onBeforeUnmount ----")
      store.dispatch('setRabbitmqIsInit', false)

      socket.off('connect')
      socket.off('disconnect')
      socket.off('queue-created')
      socket.off('drone-topic')
    })
  }
}
</script>

<style lang="scss" scoped>
.drone-page-root {
  width: 100vw;
  height: 100vh;

  .map-container {
    width: 100%;
    height: 100%;
    // background-color: aquamarine;
    position: relative;
    z-index: 88;
  }

  .covers {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    flex-direction: column;

    .top-box {
      display: flex;
      justify-content: space-between;
      padding: 40px;

      & > * {
        border-radius: 30px;
        z-index: 99;
      }

      .topleft-box {
        width: 220px;
        height: 50px;
        background: #545353ca;
      }
      .topright-box {
        width: 300px;
        height: 50px;
        background: #545353ca;
      }
    }

    .bottom-box {
      display: flex;
      align-items: flex-end;

      & > * {
        border-radius: 40px;
        z-index: 99;
      }

      & > *:not(:nth-child(1)) {
        margin-left: 20px;
      }

      .bottomleft-box {
        width: 30%;
        height: 400px;
        // background-color: #545353ec;
        // position: relative;

        // background-image: url('../assets/live-stream.png');
        // background-size: 100% 100%;
        // @media (min-width: 300px) {
        //   visibility: visible;
        // }
      }

      .bottomcenter-box {
        width: 40%;
        height: 25%;
        display: flex;
        // flex-direction: row;
        background-color: #545353ec;
      }

      .bottomright-box {
        width: 30%;
        height: 350px;
        // width: 50%;
        // height: 60%;
        // position: relative;
        
        background-color: #545353ec;
      }
    }
  }
}
</style>
