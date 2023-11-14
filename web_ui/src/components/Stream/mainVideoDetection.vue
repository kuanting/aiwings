<template>
  <div class="AAAA">

  <div class="mainV">
    <video ref="mainVideoRef" :srcObject="srcObject" autoplay ></video>
    <canvas ref="mainCanvasRef" width="640" height="640"></canvas>
  </div>
  <!-- 因為模型的輸入張量為[1, 640, 640, 3]，所以設定canvas畫布的初始大小為 640 x 640  -->

  <div class="info_dashboard">
    <p>
      Information display
      TEST ==
    </p>
    <button @click="clickBtn()">{{ DetectionBtnText }}</button>
    <button @click="chooseModel()">{{ usingModelText }}</button>
  </div>  
    
  </div>


</template>

<script>
import { ref, reactive, computed, watch } from '@vue/runtime-core'
import detection from '../../lib/detection'


export default {
  name: 'monitor',
  props: {
    /* srcObject：來自父組件的媒體流 */
    srcObject: MediaStream,
  },

  setup(props) {
    /*********************************/
    const mainVideoRef = ref(null) 
    const mainCanvasRef = ref(null) // for 顯示偵測結果  

    /************************************* */
    const isCocoSsd = ref(false)
    const usingModelText = computed(()=>{
      return isCocoSsd.value ? "cocoSsd model" : "yolov8n model"
    })
    const chooseModel = ()=>{
      if(!Detection.value)
        isCocoSsd.value = !isCocoSsd.value
    }
    /************************************* */
    /*********************************/
    const Detection = ref(false)
    const DetectionBtnText = computed(()=>{
      return Detection.value ? "停止偵測" : "開始偵測"
    })
    const clickBtn = ()=>{
      if(mainVideoRef.value.srcObject)
        Detection.value = !Detection.value
      if(Detection.value){
        // 把 640 x 640 的畫布，縮放延展為原始圖片大小
        mainCanvasRef.value.style.height = `${mainVideoRef.value.offsetHeight}px`
        mainCanvasRef.value.style.width = `${mainVideoRef.value.offsetWidth}px`
        detection.startDetection(mainVideoRef.value, mainCanvasRef.value, isCocoSsd.value)
      }else{
        detection.stopDetection(mainCanvasRef.value)
      }
    }
    
    
    return {
      mainVideoRef,
      mainCanvasRef,

      Detection,
      DetectionBtnText,
      clickBtn,

      isCocoSsd,
      usingModelText,
      chooseModel,

    }
  }
}

</script>


<style lang="scss" scoped>
/* scoped: 避免目前元件的 style 會污染到子元件的 style */

.AAAA{
  height: 100%;
  width: 100%;
  /***** 定位 *****/
  position: relative;
  padding-bottom: 40px; // 底部空出 40px 給 info_dashboard，上方剩餘空間給 mainV
  /***** flex 外元素屬性 *****/
  display: flex;
  
  // background-color: #f43b3b;
}


/******************************************************************************************/
.mainV{
  /***** 作為父層被定位 *****/
  position: relative; //相對定位
  /***** flex 外元素屬性 *****/
  display: flex;
  align-items: center; // 使內容物垂直居中 
  justify-content: center; // 使內容物水平居
  /***** 水平居中內元素 *****/
  margin: 0 auto; // 因為只有單元素，用這個來水平居中內元素
  // background-color: rgba(75, 59, 255, 0.542);
}
.mainV > video{
  max-width: 100%;
  max-height: 100%;
}
.mainV > canvas{
  // // 把 640 x 640 的畫布，縮放延展為原始圖片大小
  // // 用 js 來動態指定canvas畫布大小為影像大小
  width: 100%;
  height: 100%;  
  /* 定位父層 div 以便與影像進行疊圖 */
  position: absolute; 
  /*******************/
  pointer-events: none; // 穿透屬性
  // background-color: rgba(221, 250, 32, 0.496);
}

/******************************************************************************************/
.info_dashboard{
  background-color: #c0d6df;

  width: 100%; 
  height: 40px;
  padding: 3px;

  /***** flex 外元素屬性 *****/
  display: flex;  // 屬性之一：預設元素橫向排列

  /* 定位父層 div 以便定在最下方 */
  position: absolute;
  bottom: 0;
}
</style>
