<template>
  <div class="container">
    <div class="slider__wrapper">
      <!-- new add select tool -->
      <a-select
        v-model:value="value"
        label-in-value
        style="width: 120px"
        :options="options"
        @change="handleChange"
      ></a-select>
      <!-- ----------------- -->
      <span class="slider__title">Adjust X Axis</span>
      <div class="slider__item">
        <Slider
          :initial-value="1500"
          :max="1800"
          :min="1200"
          :marks="xAxisMarks"
          :change-handler="xAxisChangeHandler"
        />
      </div>
    </div>
    <div class="slider__wrapper">
      <span class="slider__title">Adjust Y Axis</span>
      <div class="slider__item">
        <Slider
          :initial-value="1500"
          :max="1800"
          :min="1200"
          :marks="yAxisMarks"
          :change-handler="yAxisChangeHandler"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Slider from '../../UI/Slider.vue'
import { message } from 'ant-design-vue'
import socket from '../../../lib/websocket'
import { ref } from 'vue'
import { useStore } from 'vuex'
import { computed } from '@vue/runtime-core'

export default {
  name: 'TabGimbal',
  components: { Slider },
  setup() {
    const xAxisMarks = {
      1200: 'Left',
      1500: 'Middle',
      1800: 'Right'
    }
    const yAxisMarks = {
      1200: 'Front',
      1500: 'Middle',
      1800: 'Back'
    }
    const store = useStore()
    const userInfo = computed(() => store.getters.getUserInfo)
    const droneArr = userInfo.value.droneId
    // let defaultSelected = userInfo.value.droneId[0].id
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
      let defaultSelected = value
      const drone_selected = computed(() =>
        store.getters['drone/getSpecificDroneInfo'](defaultSelected.value)
      )
      //dronechange表示選擇的droneID的data，drone變數表示的是全部的drone data
      console.log('changeDroneInfo', drone_selected.value)
    }

    const sendDroneCommand = (command) => socket.emit('send-drone', command)
    const xAxisChangeHandler = (value) => {
      sendDroneCommand({
        droneID: defaultSelected,
        cmd: 'GIMBAL_LEFT_RIGHT',
        pwm: value
      })
      message.success(`Adjust X Axis to ${value}`)
    }
    const yAxisChangeHandler = (value) => {
      sendDroneCommand({
        droneID: defaultSelected,
        cmd: 'GIMBAL_FRONT_BACK',
        pwm: value
      })
      message.success(`Adjust Y Axis to ${value}`)
    }

    return {
      xAxisMarks,
      yAxisMarks,
      xAxisChangeHandler,
      yAxisChangeHandler,
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
  padding: 0 1rem;
  position: relative;
  // display: flex;
  // flex-direction: column;
  // justify-content: space-evenly;

  .slider__wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .slider__title {
      color: rgb(33, 125, 231);
      font-weight: 600;
    }
    .slider__item {
      width: 90%;
    }
  }
}
</style>
