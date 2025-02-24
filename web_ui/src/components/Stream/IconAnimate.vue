<template>
  <div ref="iconBoxRef" class="CameraIcon ScreenshotAnimate">
    <div v-if="method == 'record'">
      <VideoCameraOutlined />
    </div>
    <div v-if="method == 'camera'">
      <CameraOutlined />
    </div>
  </div>
</template>
<script>
import { ref, computed, watch } from 'vue'
import { CameraOutlined, VideoCameraOutlined } from '@ant-design/icons-vue'

export default {
  name: 'IconAnimate',
  components: {
    CameraOutlined,
    VideoCameraOutlined
  },
  props: {
    /* srcObject：來自父組件的媒體流 */
    method: String || 'camera', // 'record' or 'camera'
    isStart: Boolean || false
  },
  setup(props) {
    /**************************************************************** */
    const iconBoxRef = ref(null)

    const isStart = computed(() => {
      return props.isStart
    })

    watch(isStart, (newValue) => {
      console.log('變更後：', newValue)
      if (newValue == true && props.method == 'camera') {
        iconBoxRef.value.classList.add('continuous')
      } else {
        iconBoxRef.value.classList.remove('continuous')
      }

      if (newValue == true && props.method == 'record') {
        iconBoxRef.value.classList.add('recording')
      } else {
        iconBoxRef.value.classList.remove('recording')
      }
    })

    return {
      iconBoxRef
    }
  }
}
</script>

<style lang="scss" scoped>
$Camera-icon-init-color: #a19bff;
$Camera-icon-recording-color: #ff8578;
$box-size: 55px;

.CameraIcon {
  width: $box-size;
  height: $box-size;
  aspect-ratio: 1 / 1; /* 設置寬高比 1:1 */
  font-size: calc($box-size / 1.5);
  border-radius: 5px;
  margin: 5px;
  background-color: $Camera-icon-init-color;

  /***** flex 外元素屬性 *****/
  display: flex;
  align-items: center; /* 使內容物垂直居中  */
  justify-content: center; /* 使內容物水平居 */
}

.ScreenshotAnimate {
  /* 動畫設定 Screenshot */
  animation-name: Screenshot;
}
.continuous {
  animation-duration: 0.2s;
  animation-iteration-count: infinite;
}

.recording {
  background-color: $Camera-icon-recording-color;
}

/* 前20%，維持深色，模擬按下按鈕，並且按鈕變小又變回原本大小 */
@keyframes Screenshot {
  0% {
    transform: scale(0.95);
    outline: 0rem solid darken($Camera-icon-init-color, 10%);
    background-color: darken($Camera-icon-init-color, 10%); /* 變成深色 */
  }
  20% {
    transform: scale(1);
    background-color: darken(
      $Camera-icon-init-color,
      10%
    ); /* 維持深色20%時間 */
  }
  20% {
    background-color: $Camera-icon-init-color; /* 切換為原本色 */
  }
  100% {
    outline: 0.3rem solid #ffffff00; /* outline變大並且漸漸轉為透明 */
  }
}
</style>
