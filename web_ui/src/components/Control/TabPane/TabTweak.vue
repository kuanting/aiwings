<template>
  <div class="container">
    <a-select
      v-model:value="value"
      label-in-value
      style="width: 120px"
      :options="options"
      @change="handleChange"
    ></a-select>
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
import { ref } from 'vue'

export default {
  name: 'TabTweak',
  components: { Button },
  setup() {
    const store = useStore()
    const coords = computed(() => store.getters['drone/getDroneCoords'])
    const altitude = computed(() => store.getters['drone/getAltitude'])
    const isTakeoff = computed(() => store.getters['drone/getTakeoffStatus'])
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
        droneID: defaultSelected,
        cmd: 'GOTO',
        altitude: altitude.value,
        lng: longitude,
        lat: latitude
      })
    }

    return {
      sendDroneCommand,
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
  position: absolute;
  // display: flex;
  .top-center {
    position: absolute;
    left: 50%;
    top: 10%;
    transform: translateX(-50%);
  }
  .middle-end {
    position: absolute;
    right: 15%;
    top: 40%;
    transform: translateY(-50%);
  }
  .middle-start {
    position: absolute;
    left: 15%;
    top: 40%;
    transform: translateY(-50%);
  }
  .buttom-center {
    position: absolute;
    left: 50%;
    bottom: 30%;
    transform: translateX(-50%);
  }
  .ant-select {
    border-radius: 5%;
  }
}
</style>

<style lang="scss">

  .ant-select-dropdown {
    border-radius: 0 0 10px 10px; /* 圆角 */
    overflow: hidden;
    .ant-select-dropdown-menu,
    .ant-select-dropdown-menu-root,
    .ant-select-dropdown-menu-vertical {
      li:hover {
        /* // 鼠标 hover 效果 */
        background-color: rgba(132, 63, 255, 0.4);
      }
      background-color: #fff; /* 背景色 */
    }
    .ant-select-dropdown-menu-item-active {
      background-color: rgba(
        132,
        63,
        255,
        0.4
      );
       /* // 展开时。默认选中option的背景色 */
    }
  }
  /* // 聚焦时 边线颜色为背景色   失焦时蓝色高亮颜色替换成紫色 */
  .ant-select-focused .ant-select-selection,
  .ant-select-selection:focus,
  .ant-select-selection:active {
    border-color: transparent;
    box-shadow: 0 0 2px rgba(132, 63, 255, 1);
  }

</style>