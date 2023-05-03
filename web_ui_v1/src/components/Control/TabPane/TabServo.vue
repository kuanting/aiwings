<template>
  <div class="container">
    <Button
      button-name="SERVO UP"
      type="primary"
      :block="true"
      size="large"
      :click-handler="servoUpHandler"
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
    >
      <PauseCircleOutlined />
    </Button>
    <Button
      button-name="SERVO DOWN"
      type="primary"
      :block="true"
      size="large"
      :click-handler="servoDownHandler"
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
export default {
  name: 'TabServo',
  components: {
    Button,
    UpCircleOutlined,
    PauseCircleOutlined,
    DownCircleOutlined
  },
  setup() {
    const sendDroneCommand = (command) => socket.emit('send-drone', command)
    const servoUpHandler = () => {
      sendDroneCommand({ cmd: 'SERVO_UP' })
      message.success('SERVO UP')
    }
    const servoStopHandler = () => {
      sendDroneCommand({ cmd: 'SERVO_STOP' })
      message.success('SERVO STOP')
    }
    const servoDownHandler = () => {
      sendDroneCommand({ cmd: 'SERVO_DOWN' })
      message.success('SERVO DOWN')
    }

    return {
      servoUpHandler,
      servoStopHandler,
      servoDownHandler
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
  flex-flow: column wrap;
  justify-content: space-evenly;
  align-items: center;
}
</style>
