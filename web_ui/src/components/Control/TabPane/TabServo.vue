<template>
  <div class="container">
    <!-- new added select tool -->
    <a-select
      v-model:value="value"
      label-in-value
      style="width: 120px"
      :options="options"
      class="select"
      @change="handleChange"
    ></a-select>
    <!--  -->
    <Button
      button-name="SERVO UP"
      type="primary"
      :block="true"
      size="large"
      :click-handler="servoUpHandler"
      class="servo_button_top"
    >
      <UpCircleOutlined />
    </Button>
    <Button
      button-name="SERVO STOP"
      type="primary"
      :block="true"
      size="large"
      danger
      :click-handler="servoStopHandler"
      class="servo_button"
    >
      <PauseCircleOutlined />
    </Button>
    <Button
      button-name="SERVO DOWN"
      type="primary"
      :block="true"
      size="large"
      :click-handler="servoDownHandler"
      class="servo_button"
    >
      <DownCircleOutlined />
    </Button>
  </div>
</template>

<script>
import {
  UpCircleOutlined,
  PauseCircleOutlined,
  DownCircleOutlined
} from '@ant-design/icons-vue'
import Button from '../../UI/Button.vue'
import socket from '../../../lib/websocket'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { useStore } from 'vuex'
import { computed } from 'vue'
export default {
  name: 'TabServo',
  components: {
    Button,
    UpCircleOutlined,
    PauseCircleOutlined,
    DownCircleOutlined
  },

  setup() {
    const store = useStore()
    const userInfo = computed(() => store.getters.getUserInfo)
    const droneArr = userInfo.value.droneId
    // let defaultSelected = userInfo.value.droneId[0].id
    const defaultSelected = ref(false)

    // new add
    if (userInfo.value.droneId[0]) {
      defaultSelected.value = userInfo.value.droneId[0].id
    } else {
      defaultSelected.value = 'No drone'
    }

    let droneList = []
    for (let i in droneArr) {
      let droneID = droneArr[i].id
      droneList.push({ value: droneID, label: droneID })
    }
    const options = ref(droneList)

    const handleChange = (value) => {
      defaultSelected.value = value.value
      const drone_selected = computed(() =>
        store.getters['drone/getSpecificDroneInfo'](defaultSelected.value)
      )
      //dronechange表示選擇的droneID的data，drone變數表示的是全部的drone data
      console.log('changeDroneInfo', drone_selected.value)
    }

    const sendDroneCommand = (command) => socket.emit('send-drone', command)
    const servoUpHandler = () => {
      sendDroneCommand({ droneID: defaultSelected.value, cmd: 'SERVO_UP' })
      message.success('SERVO UP')
    }
    const servoStopHandler = () => {
      sendDroneCommand({ droneID: defaultSelected.value, cmd: 'SERVO_STOP' })
      message.success('SERVO STOP')
    }
    const servoDownHandler = () => {
      sendDroneCommand({ droneID: defaultSelected.value, cmd: 'SERVO_DOWN' })
      message.success('SERVO DOWN')
    }

    return {
      servoUpHandler,
      servoStopHandler,
      servoDownHandler,
      value: ref({
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
  padding: 0 1rem;
  // display: flex;
  flex-flow: column wrap;
  justify-content: space-evenly;
  align-items: center;
  .select {
    align-items: center;
  }
  .servo_button_top {
    margin-bottom: 3%;
    margin-top: 5%;
  }
  .servo_button {
    margin-bottom: 3%;
  }
}
</style>
