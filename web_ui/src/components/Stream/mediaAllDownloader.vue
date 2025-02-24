<template>
  <div class="media-capture-section">
    <div class="feature-box">
      <IconAnimate
        :method="selectedMethod.value == '1' ? 'record' : 'camera'"
        :is-start="isStart"
      />
      <div style="display: flex; flex-wrap: wrap; align-items: center">
        <a-select
          v-model:value="selectedMethod"
          label-in-value
          :options="saveMethodOptions"
          :disabled="isStart"
          dropdown-class-name=""
          style="width: 170px"
          size="small"
          @change="handleMethodChange"
        ></a-select>

        <a-select
          v-model:value="selectedLocation"
          label-in-value
          :options="saveLocationOptions"
          :disabled="isStart"
          dropdown-class-name=""
          style="width: 110px; height: 20px"
          size="small"
          @change="handleLocationChange"
        ></a-select>

        <!-- 截圖 -->
        <a-button
          v-if="selectedMethod.label == saveMethodOptions[2].label"
          class="btn-Start"
          size="small"
          html-type="button"
          style="width: 55px"
          @click="oneScreenshot()"
        >
          Capture <DownloadOutlined />
        </a-button>

        <!-- 連續截圖或錄影 -->
        <div v-else>
          <a-button
            v-if="!isStart"
            class="btn-Start"
            size="small"
            html-type="button"
            @click="saveFrames()"
          >
            start
          </a-button>
          <a-button
            v-if="isStart"
            class="btn-Start"
            size="small"
            html-type="button"
            @click="saveFrames()"
          >
            stop <DownloadOutlined />
          </a-button>
        </div>
      </div>
    </div>

    <div v-for="drone in droneArr">
      <!-- 創建從網頁端截圖影像並下載所需的 <canvas> 元素 -->
      <canvas
        :ref="(el) => (canvasRefMap[drone.id] = el)"
        style="display: none"
      ></canvas>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { onMounted, ref, reactive, computed } from 'vue'
import { notification } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'

import {
  videoElementRecorder,
  videoElementScreenshot
} from '../../lib/mediaCapture'
import IconAnimate from './IconAnimate.vue'

export default {
  name: 'DownloadFrame',
  components: {
    DownloadOutlined,
    IconAnimate
  },
  props: {
    /* srcObject：來自父組件的所有影像Element */
    videoRefs: Array
  },
  setup(props) {
    const store = useStore()
    const userInfo = computed(() => store.getters.getUserInfo)
    const username = computed(() => store.getters.getUsername)
    const droneArr = userInfo.value.droneId

    // const isContinuousCapture = ref(false)
    // const isRecording = ref(false)
    /*******************************************************/
    const canvasRefMap = reactive({}) // 存放所有canvas標籤的Ref
    const videoRecords = reactive({}) // 存放所有id的videoElementRecorder
    const continueScreenshots = reactive({}) // 存放所有id的videoElementScreenshot

    onMounted(() => {
      // console.log("onMounted>>>>來自父組件的：",props.videoRefs)
      // console.log("canvasRefMap = ",canvasRefMap)

      for (const drone of droneArr) {
        /********** 用於指定 <video> 元素 的 Recorder工具 初始化 ***********/
        videoRecords[drone.id] = new videoElementRecorder(
          props.videoRefs[drone.id],
          drone.id
        )
        /********** 用於指定 <video> 元素 的 Screenshot工具 初始化 ***********/
        continueScreenshots[drone.id] = new videoElementScreenshot(
          props.videoRefs[drone.id],
          canvasRefMap[drone.id],
          username,
          drone.id
        )
      }
    })

    /*******************************************************/
    // a-select 的 選項格式：{value: 數字或字串, label: 數字或字串, key: 數字或字串(會自動同value)}
    // label 才是顯示的名稱
    const saveMethodOptions = reactive([
      { value: '1', label: 'Record' },
      { value: '2', label: 'Continuous Screenshot' },
      { value: '3', label: 'Screenshot' }
    ])
    const selectedMethod = ref(saveMethodOptions[0]) // 預設顯示saveMethodOptions的第1項的label字樣
    const handleMethodChange = (value) => {
      console.log('handleMethodChange value = ', value, value.value)
      selectedMethod.value = value
    }

    const saveLocationOptions = reactive([
      { value: 'frontend', label: 'Download' }, // 前端網頁下載儲存
      { value: 'backend', label: 'Backend Save' } // 儲存到後端
    ])
    const selectedLocation = ref(saveLocationOptions[0]) // 預設顯示saveLocationOptions的第1項的label字樣
    const handleLocationChange = (value) => {
      console.log('handleLocationChange value = ', value, value.value)
      selectedLocation.value = value
    }

    /*******************************************************/
    const isStart = ref(false)

    const saveFrames = () => {
      const currentMethod = selectedMethod.value.label
      if (!isStart.value) {
        // Start "Record"
        if (currentMethod == saveMethodOptions[0].label) allStartRecord()
        // Start "Continuous Screenshot"
        else if (currentMethod == saveMethodOptions[1].label)
          allStartContinuousCapture()
      } else {
        // Stop "Record"
        if (currentMethod == saveMethodOptions[0].label) allStopRecord()
        // Stop "Continuous Screenshot"
        else if (currentMethod == saveMethodOptions[1].label)
          allStopContinuousCapture()
      }
    }
    /*******************************************************/

    /*******************************************************/
    const allStartContinuousCapture = () => {
      const noImageId = reactive([])
      for (const drone of droneArr) {
        if (props.videoRefs[drone.id].srcObject?.active == true) {
          continueScreenshots[drone.id].saveLocation =
            selectedLocation.value.value
          continueScreenshots[drone.id].startContinuousCapture()
        } else {
          console.log(`id :${drone.id} 沒有影像`)
          noImageId.push(drone.id)
        }
      }

      if (noImageId.length == droneArr.length)
        notification.info({ message: `No images available for capture` })
      else {
        isStart.value = true
      }
      // isContinuousCapture.value
    }

    const allStopContinuousCapture = () => {
      for (const drone of droneArr) {
        if (continueScreenshots[drone.id].isCapturing()) {
          continueScreenshots[drone.id].stopContinuousCapture()
        } else {
          console.log(`id :${drone.id} 沒有啟動連續截圖`)
        }
      }
      isStart.value = false
      // isContinuousCapture.value
    }

    /************** 影像錄製 *********************** */
    const allStartRecord = async () => {
      const noImageId = reactive([])
      for (const drone of droneArr) {
        // 錄影開始
        if (props.videoRefs[drone.id].srcObject) {
          videoRecords[drone.id].saveLocation = selectedLocation.value.value
          videoRecords[drone.id].startRecord()
        } else {
          console.log(`id :${drone.id} 沒有影像`)
          noImageId.push(drone.id)
        }
      }

      if (noImageId.length == droneArr.length)
        notification.info({ message: `No video available for recording` })
      else {
        isStart.value = true
      }
      // isRecording.value
    }

    const allStopRecord = () => {
      for (const drone of droneArr) {
        // 錄影結束
        if (videoRecords[drone.id].getRecordingStatus() == 'recording') {
          videoRecords[drone.id].stopRecord()
        } else {
          console.log(`id :${drone.id} 沒有錄影`)
        }
      }
      isStart.value = false
      // isRecording.value
    }

    /************** 影像截圖 *********************** */
    const oneScreenshot = () => {
      const noImageId = reactive([])
      for (const drone of droneArr) {
        if (props.videoRefs[drone.id].srcObject) {
          // 單個截圖
          continueScreenshots[drone.id].saveLocation =
            selectedLocation.value.value
          continueScreenshots[drone.id].screenshot()
        } else {
          console.log(`id :${drone.id} 沒有影像`)
          noImageId.push(drone.id)
        }
      }
      if (noImageId.length == droneArr.length)
        notification.info({ message: `No video available for capturing` })
    }

    return {
      selectedMethod,
      saveMethodOptions,
      handleMethodChange,
      selectedLocation,
      saveLocationOptions,
      handleLocationChange,

      isStart,
      saveFrames,

      droneArr,
      canvasRefMap,

      oneScreenshot
    }
  }
}
</script>

<style lang="scss" scoped>
button {
  font-size: 10px;
  border: none; /* 去除邊框 */
  border-radius: 4px;
  margin: 2px;
  cursor: pointer; /* 鼠標樣式，使其顯示為手指指針 */
}
.btn-Start {
  $primary-color: #0e5cc2; // 建立顏色變數
  background-color: $primary-color;
  color: #fff;

  &:hover {
    background-color: darken(
      $primary-color,
      10%
    ); // darken($color, 10%) 將顏色變暗 10%
  }
}
.btn-Stop {
  $primary-color: #f1d055; // 建立顏色變數
  background-color: $primary-color;
  color: #000000; /* 文字顏色 */

  &:hover {
    background-color: darken(
      $primary-color,
      10%
    ); // darken($color, 10%) 將顏色變暗 10%
  }
}
.feature-box {
  /***** flex 外元素屬性 *****/
  display: flex;
  justify-content: space-between; /* 主軸上的對齊方式 */
}
</style>
