<template>
  <div class="container">
    <Button
      class="top-center"
      button-name="FORWARD"
      type="primary"
      size="large"
      :click-handler="sendDroneCommand.bind(null, 'Y', 1)"
    />
    <Button
      class="middle-end"
      button-name="RIGHT"
      type="primary"
      size="large"
      :click-handler="sendDroneCommand.bind(null, 'X', 1)"
    />
    <Button
      class="buttom-center"
      button-name="BACKWARD"
      type="primary"
      size="large"
      :click-handler="sendDroneCommand.bind(null, 'Y', -1)"
    />
    <Button
      class="middle-start"
      button-name="LEFT"
      type="primary"
      size="large"
      :click-handler="sendDroneCommand.bind(null, 'X', -1)"
    />
  </div>
</template>

<script>
import { computed } from '@vue/reactivity'
import Button from '../../UI/Button.vue'
import { useStore } from 'vuex'
import socket from '../../../lib/websocket'
import { message } from 'ant-design-vue'
export default {
  name: 'TabTweak',
  components: { Button },
  setup() {
    const store = useStore()
    const coords = computed(() => store.getters['drone/getDroneCoords'])
    const altitude = computed(() => store.getters['drone/getAltitude'])
    const isTakeoff = computed(() => store.getters['drone/getTakeoffStatus'])

    const newLatitide = (direction) => {
      const latitude = +coords.value[1]
      return latitude + direction * 0.00001
    }

    const newLongitude = (direction) => {
      const longitude = +coords.value[0]
      return longitude + direction * 0.00001
    }

    /**
     * @param {'X'|'Y'} axis X stand for longitude, Y stand for latitude
     * @param {number} direction go north or east -> 1, go south or west -> -1
     */
    const sendDroneCommand = (axis, direction) => {
      if (!isTakeoff.value) {
        message.error('Please TAKEOFF the drone first')
        return
      }
      let longitude = +coords.value[0]
      let latitude = +coords.value[1]
      if (axis === 'X') {
        longitude = newLongitude(direction)
      }
      if (axis === 'Y') {
        latitude = newLatitide(direction)
      }
      socket.emit('send-drone', {
        cmd: 'GOTO',
        altitude: altitude.value,
        lng: longitude,
        lat: latitude
      })
    }

    return { sendDroneCommand }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  position: relative;

  .top-center {
    position: absolute;
    left: 50%;
    top: 20%;
    transform: translateX(-50%);
  }
  .middle-end {
    position: absolute;
    right: 20%;
    top: 50%;
    transform: translateY(-50%);
  }
  .middle-start {
    position: absolute;
    left: 20%;
    top: 50%;
    transform: translateY(-50%);
  }
  .buttom-center {
    position: absolute;
    left: 50%;
    bottom: 20%;
    transform: translateX(-50%);
  }
}
</style>
