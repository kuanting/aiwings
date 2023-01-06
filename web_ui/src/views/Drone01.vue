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
          <Stream />
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

    const droneList = user.value.droneId
    for (let i in droneList){
      const droneInfo = {
          [droneList[i].id]: {
            timeStamp:'',
            roll: '',
            yaw: '',
            pitch: '',
            voltage: '',
            percentage: '',
            hpop: '',
            gpsCount: '',
            mode: '',
            isArmed: '',
            heading: '',
            latitude: '',
            longitude: '',
            altitude: '',
            speed: '',
            status: {
              altitude: 3,
              //isTakeoff 預設要改成false
              isTakeoff: false
            },
            destination: {
              lng: 0,
              lat: 0
            }
          }
        }      
        store.dispatch('drone/setDroneInfo', droneInfo)
    }
    const rabbitmqInit = () => {
      // console.log('user: ', user.value.droneId[0])
      saveLogs(`Websocket connected: ${socket.id}`)

      for (let i in user.value.droneId) {
        saveLogs(`Drone ID: ${user.value.droneId[i]}`)
      }

      //FIXME
      //這邊要再看一下
      // for (let i in user.value.droneId){
      //   // console.log(typeof(user.value.droneId[i]))
      //   socket.emit('establish-rabbitmq-connection', user.value.droneId[i])
      // }
      socket.emit('establish-rabbitmq-connection', user.value.droneId)
    }
    // Trigger RabbitMQ when the first come or refresh pages
    if (!rabbitmqIsInit.value) {
      rabbitmqInit()
      store.dispatch('setRabbitmqIsInit', true)
    }
    // Websocket event listening
    socket.on('connect', () => rabbitmqInit())
    socket.on('disconnect', (reason) => {
      saveLogs(`Websocket disconnected: ${reason}`)
    })
    socket.on('queue-created', (queueName) => {
      saveLogs(`Queue created: ${queueName}`)
    })

    socket.on('drone-topic', (data) => {
      if (data.type === 'message') {
        // console.log('Here: ', data.drone_info.drone_id)
        // console.log('droneInfo from backend: ', data)
        const {
          drone_info: {
            drone_id: drone_id,
            timestamp: timeStamp,
            attitude: { yaw, roll, pitch },
            battery: { voltage, percentage },
            gps_status: { hpop, gps_count: gpsCount },
            heartbeat: { flight_mode: mode, is_armed: isArmed },
            location: {
              heading,
              lat: latitude,
              lng: longitude,
              relative_alt: altitude
            },
            speed: { air_speed: speed }
          }
        } = data

        //改成這種形態
        const droneInfo = {
          [drone_id]: {
            timeStamp,
            roll,
            yaw,
            pitch,
            voltage,
            percentage,
            hpop,
            gpsCount,
            mode,
            isArmed,
            heading,
            latitude,
            longitude,
            altitude,
            speed,
            status: {
              altitude: 3,
              //isTakeoff 預設要改成false
              isTakeoff: false
            },
            destination: {
              lng: 0,
              lat: 0
            }
          }
        }
        // console.log(droneInfo)
        // const droneInfo_origin = {
        //     timeStamp,
        //     roll,
        //     yaw,
        //     pitch,
        //     voltage,
        //     percentage,
        //     hpop,
        //     gpsCount,
        //     mode,
        //     isArmed,
        //     heading,
        //     latitude,
        //     longitude,
        //     altitude,
        //     speed
        //   }

        //setDroneInfo 是加在vuex/drone module
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
        background-color: #545353ec;

        background-image: url('../assets/live-stream.png');
        background-size: 100% 100%;
        @media (min-width: 300px) {
          visibility: visible;
        }
      }

      .bottomcenter-box {
        width: 50%;
        height: 60%;
        // align-items: center;
        background-color: #545353ec;
        overflow: scroll;
      }

      .bottomright-box {
        width: 25%;
        height: 400px;
        // position: absolute;
        // bottom: 0px;
        // right:10px;
        background-color: #545353ec;
      }
    }
  }
}
</style>
