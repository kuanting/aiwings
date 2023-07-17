<template>
  <div class="container">
    <div class="container__vertical">
      <!-- new add select drone -->
      <a-select
        v-model:value="value"
        label-in-value
        style="width: 120px"
        :options="options"
        @change="handleChange"
        dropdownClassName=""
      ></a-select>
      <!-- end -->
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
    //這邊要新增從user/state取得droneID，放在畫面上做選擇，然後再把選擇的droneID傳到vuex的getDroneInfo取得資訊
    const userInfo = computed(() => store.getters.getUserInfo)
    const droneArr = userInfo.value.droneId
    const confirmText = computed(
      () => `Are you sure to ${isTakeoff.value ? 'LAND' : 'TAKEOFF'}?`
    )
    let defaultSelected


    // new add
    if (userInfo.value.droneId[0]){
      defaultSelected = userInfo.value.droneId[0].id
    }else{
      defaultSelected = 'No droone'
    }


    let droneList = []
    for (let i in droneArr) {
      let droneID = droneArr[i].id
      droneList.push({ value: droneID, label: droneID })
    }
    const options = ref(droneList)
    const handleChange = (value) => {
      //defaultSelected 要用來表示目前所選擇要操作的droneID
      //且socket.emit("send-drone") 的時候 要回傳dorneID
      
      let defaultSelected = value
      const drone_selected = computed(() =>
        store.getters['drone/getSpecificDroneInfo'](defaultSelected.value)
      )
      //dronechange表示選擇的droneID的data，drone變數表示的是全部的drone data
      console.log('changeDroneInfo', drone_selected.value)
      if (drone_selected.value === undefined) {
        message.info("The drone you selected haven't connected!")
      } else {
        message.success(`The drone you select is ${defaultSelected.value}`)
      }
    }
    // ----end----

    //這邊要監視的是drone下的所有droneID的object
    // console.log("TabControl watch drone: ", drone_selected)

    //UPDATE
    // watch(drone, (drone) => {
    //   /*
    //     When fulfill below situations, mode will change into GUIDED:

    //     1. In LAND mode and the drone is DISARM
    //    */
    //   console.log('TabControl watch drone: ', drone)
    //   if (typeof drone.mode === 'undefined') return
    //   if (drone.isArmed === 'DISARM' && drone.mode === 'LAND') {
    //     flightModeChangeHandler('GUIDED')
    //   }

    //   flightMode.value = drone.mode
    //   isArm.value = drone.isArmed === 'ARM' ? true : false

    //   isTakeoff.value =
    //     drone.isArmed === 'ARM' && drone.altitude >= 0.5 ? true : false

    //   isLanding.value =
    //     drone.mode === 'LAND' && drone.isArmed === 'ARM' ? true : false
    // })

    //ORIGIN

    watch(drone, (drone) => {
      /*
        When fulfill below situations, mode will change into GUIDED:

        1. In LAND mode and the drone is DISARM
       */
      console.log('TabControl watch drone: ', drone[defaultSelected])
      if (typeof drone[defaultSelected].mode === 'undefined') return
      if (
        drone[defaultSelected].isArmed === 'DISARM' &&
        drone[defaultSelected].mode === 'LAND'
      ) {
        flightModeChangeHandler('GUIDED')
      }

      flightMode.value = drone[defaultSelected].mode
      isArm.value = drone[defaultSelected].isArmed === 'ARM' ? true : false

      isTakeoff.value =
        drone[defaultSelected].isArmed === 'ARM' &&
        drone[defaultSelected].altitude >= 0.5
          ? true
          : false

      isLanding.value =
        drone[defaultSelected].mode === 'LAND' &&
        drone[defaultSelected].isArmed === 'ARM'
          ? true
          : false
    })

    watch([isTakeoff, altitude], ([isTakeoff, altitude]) => {
      console.log(isTakeoff, altitude)
      store.dispatch('drone/updateFlightStatus', {
        droneID: defaultSelected,
        status: { altitude, isTakeoff }
      })
    })

    console.log(isTakeoff.value, isLanding.value)

    const sendDroneCommand = (command) => socket.emit('send-drone', command)

    const flightHandler = () => {
      if (isTakeoff.value) {
        sendDroneCommand({ droneID: defaultSelected, cmd: 'LAND' })
        message.success('LANDING')
        return
      }
      sendDroneCommand({ droneID: defaultSelected, cmd: 'ARM' })
      setTimeout(() => {
        sendDroneCommand({
          droneID: defaultSelected,
          cmd: 'TAKEOFF',
          altitude: altitude.value
        })
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
            droneID: defaultSelected,
            cmd: 'GOTO',
            altitude: altitude.value,
            lng: drone.value.longitude,
            lat: drone.value.latitude
          })
        } else {
          sendDroneCommand({
            droneID: defaultSelected,
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
        sendDroneCommand({
          droneID: 'e27d4dacf11f9cd5',
          cmd: 'CHANGE_SPEED',
          speed: speed.value
        })
        message.success(`Change SPEED to ${speed.value}m/s`)
        return
      }

      message.error('Please TAKEOFF the drone first')
    }

    const flightModeChangeHandler = (mode) => {
      if (typeof mode === 'object') {
        mode = mode.target.value
      }
      sendDroneCommand({ droneID: defaultSelected, cmd: mode })
      message.success(`Change MODE to ${mode}`)
    }
    const emergencyStopHandler = () => {
      sendDroneCommand({
        droneID: defaultSelected,
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
      flightModeChangeHandler,
      //new add above for select
      value: ref({
        value: defaultSelected
      }),
      options,
      handleChange
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
    height: 100%;
  }
  // .test{
  //   background-color: #111;
  // }
}
.ant-col {
  text-align: center;
  padding-top: 10px;
  padding-bottom: 30px;
}
</style>
