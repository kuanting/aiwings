<template>
  <div class="container">
    <div class="container__vertical">
      <a-row justify="space-around">
        <a-col flex="auto">
          <Switch
            item-name="Props Control"
            :status="isArm"
            :is-loading="isLanding"
            check-title="ARM"
            un-check-title="DISARM"
            :click-handler="armableHandler"
          />
        </a-col>
        <a-col flex="auto">
          <Switch
            item-name="Flight Control"
            :status="isTakeoff"
            :is-disabled="!isArm"
            :is-loading="isLanding"
            check-title="LAND"
            un-check-title="TAKEOFF"
            :click-handler="flightHandler"
          />
        </a-col>
      </a-row>
      <a-row justify="space-around">
        <a-col flex="auto">
          <InputNumber
            item-name="Altitude(Max:100)"
            :value="altitude"
            :max="Number(100)"
            :min="Number(1)"
            :change-handler="altitudeChangeHandler"
            :enter-handler="altitudeEnterHandler"
          />
        </a-col>
        <a-col flex="auto">
          <InputNumber
            item-name="Speed(Max:15)"
            :value="speed"
            :max="Number(15)"
            :min="Number(1)"
            :change-handler="speedChangeHandler"
            :enter-handler="speedEnterHandler"
          />
        </a-col>
        <a-col flex="auto">
          <InputNumber
            item-name="Yaw(Max:359)"
            :value="yaw"
            :max="Number(359)"
            :min="Number(0)"
            :change-handler="yawChangeHandler"
            :enter-handler="yawEnterHandler"
          />
        </a-col>
      </a-row>
      <a-row justify="space-around">
        <a-col flex="auto">
          <RadioGroup
            :mode="flightMode"
            :change-handler="flightModeChangeHandler"
          />
        </a-col>
        <a-col flex="auto"
          ><Button
            button-name="Emergency STOP"
            type="primary"
            danger
            :click-handler="emergencyStopHandler"
        /></a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
import Switch from '../../UI/Switch.vue'
import InputNumber from '../../UI/InputNumber.vue'
import RadioGroup from '../../UI/RadioGroup.vue'
import Button from '../../UI/Button.vue'
import { ref } from '@vue/reactivity'
import { useStore } from 'vuex'
import { computed, watch } from '@vue/runtime-core'
import socket from '../../../lib/websocket'
import { message } from 'ant-design-vue'
export default {
  name: 'TabControl',
  components: {
    Switch,
    InputNumber,
    RadioGroup,
    Button
  },
  setup() {
    const isArm = ref(false)
    const isTakeoff = ref(false)
    const isLanding = ref(false)
    const altitude = ref(3)
    const speed = ref(3)
    const yaw = ref(0)
    const flightMode = ref('')

    const store = useStore()
    const drone = computed(() => store.getters['drone/getDroneInfo'])
    const destination = computed(() => store.getters['drone/getDestination'])

    watch(drone, (drone) => {
      flightMode.value = drone.mode
      isArm.value = drone.isArmed === 'ARM' ? true : false
      isTakeoff.value =
        drone.isArmed === 'ARM' && drone.altitude > 0.5 ? true : false
      isLanding.value =
        drone.mode === 'LAND' && drone.isArmed === 'ARM' ? true : false
    })

    watch([isTakeoff, altitude], ([isTakeoff, altitude]) => {
      store.dispatch('drone/updateFlightStatus', { isTakeoff, altitude })
    })

    const sendDroneCommand = (command) => socket.emit('send-drone', command)

    const armableHandler = () => {
      if (isArm.value) {
        sendDroneCommand({ cmd: 'DISARM' })
        return
      }
      sendDroneCommand({ cmd: 'ARM' })
    }

    const flightHandler = () => {
      if (isTakeoff.value) {
        sendDroneCommand({ cmd: 'LAND' })
        message.success('LANDING')
        return
      }
      sendDroneCommand({ cmd: 'TAKEOFF', altitude: altitude.value })
      message.success('TAKEOFF')
    }

    const altitudeChangeHandler = (value) => {
      if (value === '' || value < 1) value = 1
      if (value > 100) value = 100
      altitude.value = value
    }
    const altitudeEnterHandler = () => {
      if (isTakeoff.value) {
        if (destination.value.lng === 0) {
          sendDroneCommand({
            cmd: 'GOTO',
            altitude: altitude.value,
            lng: drone.value.longitude,
            lat: drone.value.latitude
          })
        } else {
          sendDroneCommand({
            cmd: 'GOTO',
            altitude: altitude.value,
            lng: destination.value.lng,
            lat: destination.value.lat
          })
        }

        message.success(`Change ALTITUDE to ${altitude.value}m`)
        return
      }
      message.error('Please TAKEOFF the drone first')
    }

    const speedChangeHandler = (value) => {
      if (value === '' || value < 1) value = 1
      if (value > 15) value = 15
      speed.value = value
    }
    const speedEnterHandler = () => {
      if (isTakeoff.value) {
        sendDroneCommand({ cmd: 'CHANGE_SPEED', speed: speed.value })
        message.success(`Change SPEED to ${speed.value}m/s`)
        return
      }

      message.error('Please TAKEOFF the drone first')
    }

    const yawChangeHandler = (value) => {
      if (value === '' || value < 0) value = 0
      if (value > 359) value = 359
      yaw.value = value
    }
    const yawEnterHandler = () => {
      if (isTakeoff.value) {
        sendDroneCommand({ cmd: 'CHANGE_YAW', angle: yaw.value })
        message.success(`Change YAW to ${yaw.value}`)
        return
      }
      message.error('Please TAKEOFF the drone first')
    }

    const flightModeChangeHandler = (e) => {
      sendDroneCommand({ cmd: e.nativeEvent.target.value })
      message.success(`Change MODE to ${e.nativeEvent.target.value}`)
    }

    const emergencyStopHandler = () => {
      sendDroneCommand({
        cmd: 'GOTO',
        altitude: altitude.value,
        lng: drone.value.longitude,
        lat: drone.value.latitude
      })
      store.dispatch('drone/updateDestination', {
        lng: drone.value.longitude,
        lat: drone.value.latitude
      })
      message.warn(`Emergency Stop`)
    }

    return {
      isArm,
      isTakeoff,
      isLanding,
      altitude,
      speed,
      yaw,
      flightMode,
      armableHandler,
      flightHandler,
      altitudeChangeHandler,
      altitudeEnterHandler,
      speedChangeHandler,
      speedEnterHandler,
      yawChangeHandler,
      yawEnterHandler,
      flightModeChangeHandler,
      emergencyStopHandler
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  @media (min-width: 800px) {
    align-items: center;
  }

  .container__vertical {
    width: 100%;
  }
}
.ant-col {
  text-align: center;
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
