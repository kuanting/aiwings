<template>
  <div class="container">
    <div class="container__vertical">
      <a-row justify="space-around">
        <a-col flex="auto">
          <a-popconfirm
            :title="confirmText"
            ok-text="Yes"
            cancel-text="No"
            placement="bottom"
            @confirm="flightHandler"
          >
            <Switch
              item-name="Flight Control"
              :status="isTakeoff"
              :is-loading="isLanding"
              check-title="LAND"
              un-check-title="TAKEOFF"
            />
          </a-popconfirm>
        </a-col>
        <a-col flex="auto">
          <Button
            button-name="Emergency STOP"
            type="primary"
            danger
            :click-handler="emergencyStopHandler"
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
      </a-row>
      <a-row justify="center">
        <a-col>
          <RadioGroup
            :mode="flightMode"
            :change-handler="flightModeChangeHandler"
          />
        </a-col>
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
    const flightMode = ref('')
    const store = useStore()
    const drone = computed(() => store.getters['drone/getDroneInfo'])
    const destination = computed(() => store.getters['drone/getDestination'])

    const confirmText = computed(
      () => `Are you sure to ${isTakeoff.value ? 'LAND' : 'TAKEOFF'}?`
    )

    watch(drone, (drone) => {
      /*
        When fulfill below situations, mode will change into GUIDED:

        1. In LAND mode and the drone is DISARM
       */
      if (typeof drone.mode === 'undefined') return
      if (drone.isArmed === 'DISARM' && drone.mode === 'LAND') {
        flightModeChangeHandler('GUIDED')
      }

      flightMode.value = drone.mode
      isArm.value = drone.isArmed === 'ARM' ? true : false
      isTakeoff.value =
        drone.isArmed === 'ARM' && drone.altitude >= 0.5 ? true : false
      isLanding.value =
        drone.mode === 'LAND' && drone.isArmed === 'ARM' ? true : false
    })

    watch([isTakeoff, altitude], ([isTakeoff, altitude]) => {
      store.dispatch('drone/updateFlightStatus', { isTakeoff, altitude })
    })

    const sendDroneCommand = (command) => socket.emit('send-drone', command)

    const flightHandler = () => {
      if (isTakeoff.value) {
        sendDroneCommand({ cmd: 'LAND' })
        message.success('LANDING')
        return
      }
      sendDroneCommand({ cmd: 'ARM' })
      setTimeout(() => {
        sendDroneCommand({ cmd: 'TAKEOFF', altitude: altitude.value })
        message.success('TAKEOFF')
      }, 2000)
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

    const flightModeChangeHandler = (mode) => {
      if (typeof mode === 'object') {
        mode = mode.target.value
      }
      sendDroneCommand({ cmd: mode })
      message.success(`Change MODE to ${mode}`)
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
      confirmText,
      flightMode,
      flightHandler,
      altitudeChangeHandler,
      altitudeEnterHandler,
      speedChangeHandler,
      speedEnterHandler,
      emergencyStopHandler,
      flightModeChangeHandler
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
