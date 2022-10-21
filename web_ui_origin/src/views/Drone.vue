<template>
  <section class="panel">
    <div class="control">
      <Control />
    </div>
    <div class="stream">
      <Stream />
    </div>
    <div class="map">
      <Mapbox />
    </div>
  </section>
</template>

<script>
import Stream from '../components/Stream/Stream.vue'
import Mapbox from '../components/Mapbox/Mapbox.vue'
import Control from '../components/Control/Control.vue'
import socket from '../lib/websocket'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
import { computed, onBeforeUnmount } from '@vue/runtime-core'
export default {
  name: 'Drone',
  components: { Stream, Mapbox, Control },
  setup() {
    const store = useStore()
    const rabbitmqIsInit = computed(() => store.getters.getRabbitmqIsInit)
    const user = computed(() => store.getters.getUserInfo)
    const saveLogs = (log) => store.dispatch('setLogs', log)

    // RabbitMQ queues establishment
    const rabbitmqInit = () => {
      saveLogs(`Websocket connected: ${socket.id}`)
      saveLogs(`Drone ID: ${user.value.droneId}`)
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
        const {
          drone_info: {
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
        const droneInfo = {
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
          speed
        }
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
.panel {
  height: calc(100vh - 60px);
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 40% 60%;
  @media (min-width: 800px) {
    grid-template-columns: 40% 60%;
    grid-template-rows: 50% 50%;
  }

  .control {
    grid-row: 1 / 2;
    @media (min-width: 800px) {
      width: 100%;
      height: 100%;
      grid-column: 1 / 2;
      grid-row: 1 / 2;
    }
  }
  .map {
    position: relative;
    grid-row: 2 / 3;
    @media (min-width: 800px) {
      grid-column: 2 / 3;
      grid-row: 1 / span 3;
    }
  }
  .stream {
    position: relative;
    visibility: hidden;
    background-image: url('~@/assets/live-stream.png');
    background-size: cover;
    @media (min-width: 800px) {
      visibility: visible;
      grid-column: 1 / 2;
      grid-row: 2 / 3;
    }
  }
}
</style>
