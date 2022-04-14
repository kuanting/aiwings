<template>
  <div class="container">
    <div class="slider__wrapper">
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

    const sendDroneCommand = (command) => socket.emit('send-drone', command)
    const xAxisChangeHandler = (value) => {
      sendDroneCommand({ cmd: 'GIMBAL_LEFT_RIGHT', pwm: value })
      message.success(`Adjust X Axis to ${value}`)
    }
    const yAxisChangeHandler = (value) => {
      sendDroneCommand({ cmd: 'GIMBAL_FRONT_BACK', pwm: value })
      message.success(`Adjust Y Axis to ${value}`)
    }

    return {
      xAxisMarks,
      yAxisMarks,
      xAxisChangeHandler,
      yAxisChangeHandler
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;

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
      width: 100%;
    }
  }
}
</style>
