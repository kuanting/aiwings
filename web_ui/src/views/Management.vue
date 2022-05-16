<template>
  <div class="container"><Map :drone-info="droneInfo" /></div>
</template>

<script>
import socket from '@/lib/websocket'
import Map from '../components/Management/Map.vue'
import { computed, onBeforeUnmount, reactive } from '@vue/runtime-core'
import { useStore } from 'vuex'

export default {
  name: 'Management',
  components: {
    Map
  },
  setup() {
    const store = useStore()
    const rabbitmqAdminIsInit = computed(
      () => store.getters.getRabbitmqAdminIsInit
    )
    let droneInfo = reactive({
      id: '',
      lng: '',
      lat: '',
      alt: '',
      voltage: '',
      speed: ''
    })

    // Create RabbitMQ admin queues
    if (!rabbitmqAdminIsInit.value) {
      socket.emit('drone-admin')
      store.dispatch('setRabbitmqAdminIsInit', true)
    }

    // Websocket event listening
    socket.on('admin-drone-topic', (data) => {
      if (data.type === 'message') {
        const {
          battery: { voltage },
          drone_id: id,
          location: { lng, lat, relative_alt: alt },
          speed: { air_speed: speed }
        } = data.drone_info

        if (voltage) {
          droneInfo.id = id
          droneInfo.lng = lng
          droneInfo.lat = lat
          droneInfo.alt = alt
          droneInfo.voltage = voltage
          droneInfo.speed = speed
        }
      }
    })

    onBeforeUnmount(() => {
      socket.off('admin-drone-topic')
    })

    return {
      droneInfo
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: calc(100vh - 60px);
}
</style>
