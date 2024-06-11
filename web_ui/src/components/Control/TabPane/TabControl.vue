<template>
  <div class="container">
    <div class="container__vertical">
      <!-- new add select drone -->
      <a-select
        v-model:value="selectValue"
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
            :value="alt_byUser"
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
    const isTakeoff = computed(
      () => {
        return drone.value[defaultSelected.value]?.altitude > 0.5
      }
    )
    
    const isLanding = ref(false)
    const alt_byUser = ref(3)
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
    const defaultSelected = ref(false) //用戶所選的ID


    // new add
    if (userInfo.value.droneId[0]){
      defaultSelected.value = userInfo.value.droneId[0].id
      // console.log("defaultSelected.value = ",defaultSelected.value)
    }else{
      defaultSelected.value = 'No drone'
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

      // console.log("value = ",value) // 選擇test2無人機： value = {value: 'test2', label: 'test2', key: 'test2'}
      
      defaultSelected.value = value.value
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
      if (typeof drone[defaultSelected.value].mode === 'undefined') return
      if (
        drone[defaultSelected.value].isArmed === 'DISARM' &&
        drone[defaultSelected.value].mode === 'LAND'
      ) {
        flightModeChangeHandler('GUIDED')
      }

      flightMode.value = drone[defaultSelected.value].mode
      isArm.value = drone[defaultSelected.value].isArmed === 'ARM' ? true : false
      // isTakeoff.value =
      //   drone[defaultSelected].isArmed === 'ARM' &&
      //   drone[defaultSelected].altitude >= 0.5
      //     ? true
      //     : false

      // isLanding.value =
      //   drone[defaultSelected].mode === 'LAND' &&
      //   drone[defaultSelected].isArmed === 'ARM'
      //     ? true
      //     : false
    })

    watch([isTakeoff, alt_byUser], ([isTakeoff, alt_byUser]) => {
      console.log(isTakeoff, alt_byUser)
      store.dispatch('drone/updateFlightStatus', {
        droneID: defaultSelected.value,
        status: { alt_byUser, isTakeoff }
      })
    })
    const sendDroneCommand = (command) => socket.emit('send-drone', command)

    const flightHandler = () => {
      if (isTakeoff.value || drone.value[defaultSelected.value].altitude > 0.5) {
        sendDroneCommand({ droneID: defaultSelected.value, cmd: 'LAND' }) // LAND 降落
        message.success('LANDING')
        console.log("LAND")
        isTakeoff.value = false
        return
      }
      sendDroneCommand({ droneID: defaultSelected.value, cmd: 'ARM' }) // ARM 解鎖
      //TAKEOFF 起飛
      setTimeout(() => {
        sendDroneCommand({
          droneID: defaultSelected.value,
          cmd: 'TAKEOFF',
          altitude: alt_byUser.value
        })
        message.success('TAKEOFF')
        console.log("TAKEOFF")
        isTakeoff.value = true
      }, 2000)     
    }

    const altitudeChangeHandler = (value) => {
      if (value === '' || value < 1) value = 1
      if (value > 100) value = 100
      alt_byUser.value = value
    }


    /* 在高度框中按下enter時觸發，將更改無人機高度 */
    const altitudeEnterHandler = () => {
      if (isTakeoff.value) {//如果已經起飛
        sendDroneCommand({
          droneID: defaultSelected.value,
          cmd: 'GOTO',
          altitude: alt_byUser.value,
          lng: drone.value[defaultSelected.value].longitude,
          lat: drone.value[defaultSelected.value].latitude
        })

        message.success(`Change ALTITUDE to ${alt_byUser.value}m`)
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
          droneID: defaultSelected.value,
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
        console.log("mode.target.value =",mode
                    ,"\n___flightModeChangeHandler()__mode = ",mode)
      }
      sendDroneCommand({ droneID: defaultSelected.value, cmd: mode })
      message.success(`Change MODE to ${mode}`)
    }


    const emergencyStopHandler = () => {
      // sendDroneCommand({
      //   droneID: defaultSelected,
      //   cmd: 'GOTO',
      //   altitude: 0,
      //   lng: drone.value[defaultSelected].longitude,
      //   lat: drone.value[defaultSelected].latitude
      // })
      sendDroneCommand({ droneID: defaultSelected.value, cmd: 'LAND' })



      store.dispatch('drone/updateDestination', {
        droneID: defaultSelected.value, //++
        lng: drone.value[defaultSelected.value].longitude,
        lat: drone.value[defaultSelected.value].latitude
      })
      message.warn(`Emergency Stop`)
    }

    return {
      isArm,
      isTakeoff,
      isLanding,
      alt_byUser,
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
      // value: ref({
      //   value: defaultSelected
      // }),

      selectValue: ref({
        value: defaultSelected.value
      }),
      defaultSelected,

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
