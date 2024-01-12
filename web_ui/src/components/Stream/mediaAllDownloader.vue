<template>
  <div class="media-capture-section">
    <div class="feature-box">
      Screenshot
      <button @click="oneScreenshot()">CaptureOne</button>
    </div>
    <div class="feature-box">
      Continuous Screenshot
      <div>
        <button  @click="allStartContinuousCapture()" >Start</button>
        <button  @click="allStopContinuousCapture()" >Stop</button>
      </div>
    </div>
    <div class="feature-box">
      Record
      <div><button @click="allStartRecord()">Start</button>
      <button @click="allStopRecord()">Stop</button></div>
    </div>
    <div v-for="drone in droneArr">
      <!-- 創建從網頁端截圖影像並下載所需的 <canvas> 元素 -->
      <canvas :ref="el => canvasRefMap[drone.id]=el" style="display: none;"></canvas>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { onBeforeUnmount, onMounted, ref, reactive, computed } from '@vue/runtime-core'
import user from '../../services/user'
import { notification } from 'ant-design-vue'

import {videoElementRecorder , videoElementScreenshot} from '../../lib/mediaCapture'
export default {
  name: 'downloadFrame',
  props: {
    /* srcObject：來自父組件的所有影像Element */
    videoRefs: Array,
  },

  setup(props) {
    const store = useStore()
    const userInfo = computed(() => store.getters.getUserInfo)
    const droneArr = userInfo.value.droneId
    /*******************************************************/
    const canvasRefMap = reactive({}) // 存放所有canvas標籤的Ref
    const videoRecords = reactive({})         // 存放所有id的videoElementRecorder
    const continueScreenshots = reactive({})  // 存放所有id的videoElementScreenshot
  
    onMounted(()=>{
      // console.log("onMounted>>>>來自父組件的：",props.videoRefs)
      // console.log("canvasRefMap = ",canvasRefMap)

      for(const drone of droneArr){
        /********** 用於指定 <video> 元素 的 Recorder工具 初始化 ***********/
        videoRecords[drone.id] = new videoElementRecorder(props.videoRefs[drone.id], drone.id)
        /********** 用於指定 <video> 元素 的 Screenshot工具 初始化 ***********/
        continueScreenshots[drone.id] = new videoElementScreenshot(props.videoRefs[drone.id], canvasRefMap[drone.id], drone.id)
      }
    })

    /*******************************************************/
    const allStartContinuousCapture = () =>{
      for(const drone of droneArr){
        if(props.videoRefs[drone.id].srcObject){
          continueScreenshots[drone.id].startContinuousCapture()
        }else{
          console.log(`id :${drone.id} 沒有影像`)
        }
      }
    }

    const allStopContinuousCapture = () =>{
      for(const drone of droneArr){
        if(continueScreenshots[drone.id].isCapturing()){
          continueScreenshots[drone.id].stopContinuousCapture()
        }else{
          console.log(`id :${drone.id} 沒有啟動連續截圖`)
        }
      }
    }

    /************** 影像錄製 *********************** */
    const allStartRecord = async ()=>{
      for(const drone of droneArr){
        // 錄影開始
        if(props.videoRefs[drone.id].srcObject){
          videoRecords[drone.id].startRecord()
        }else{
          console.log(`id :${drone.id} 沒有影像`)
        }
      }
    }

    const allStopRecord = ()=>{
      for(const drone of droneArr){
        // 錄影結束
        if(videoRecords[drone.id].getRecordingStatus() == 'recording'){
          videoRecords[drone.id].stopRecord()
        }else{
          console.log(`id :${drone.id} 沒有錄影`)
        }
      }
    }

    /************** 影像截圖 *********************** */
    const oneScreenshot = ()=>{
      for(const drone of droneArr){
        if(props.videoRefs[drone.id].srcObject){
          // 單個截圖
          continueScreenshots[drone.id].screenshot()
        }else{
          console.log(`id :${drone.id} 沒有影像`)
        }
      }

      // /** 如果要丟到後端存取 */

      // const formData = new FormData();
      // formData.append('image', blob, 'testFile.png'); // 'image' 是后端接收文件的字段名
      // console.log(typeof formData.get('image')); // string



      // const { data } = await user.saveDroneVideoBlob({
      //   formData
      // })
      // console.log("data = ",data)
      // notification.success({ message: data.msg }) 
      
    }

    return {
      droneArr,
      canvasRefMap,

      allStartContinuousCapture,
      allStopContinuousCapture,
      // create_mediaRecorder,
      allStartRecord,
      allStopRecord,
      oneScreenshot
    }
  }
}

</script>


<style lang="scss" scoped>
button {
  font-size: 10px ;
  background-color: #0e5cc2; 
  color: #fff; /* 文字顏色 */
  border: none; /* 去除邊框 */
  border-radius: 4px;
  margin: 2px;
  cursor: pointer; /* 鼠標樣式，使其顯示為手指指針 */  
}
.feature-box{
  /***** flex 外元素屬性 *****/
  display: flex;
  justify-content: space-between; /* 主軸上的對齊方式 */
}
</style>
