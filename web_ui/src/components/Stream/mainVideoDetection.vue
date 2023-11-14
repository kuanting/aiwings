<template>
  <div class="AAAA" ref="AAAA" style="padding-bottom: 40px;">

    <div class="mainV">
      <video ref="mainVideoRef" :srcObject="srcObject" autoplay ></video>
      <canvas ref="mainCanvasRef"></canvas>
    </div>

    <div class="info_dashboard">
      <p>
        Information display
        TEST ==
      </p>
      <button @click="clickBtn()">{{ DetectionBtnText }}</button>
      <button @click="isCocoSsd = !isCocoSsd" :disabled="Detection">{{ usingModelText }}</button>
      <button @click="RotateVideo()">RotateVideo</button>
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
    const AAAA =ref(null)
    const mainVideoRef = ref(null) 
    const mainCanvasRef = ref(null) // for 顯示偵測結果  

    /************************************* */
    const isCocoSsd = ref(false)
    const usingModelText = computed(()=>{
      return isCocoSsd.value ? "cocoSsd model" : "yolov8n model"
    })
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
    /************************************* */
    const rotate = ref(0)
    const RotateVideo = ()=>{
      console.log("RotateVideo")
      // 旋轉影像與畫布方向
      rotate.value = rotate.value + 90
      mainVideoRef.value.style.transform = `rotate(${rotate.value}deg)`
      mainCanvasRef.value.style.transform = `rotate(${rotate.value}deg)`

      if(rotate.value%180){
        // 轉為橫向時，變更最大寬高
        const rotatedMaxWidth = AAAA.value.clientHeight - parseFloat(AAAA.value.style.paddingBottom); // 最大寬度變成容器的高度
        const rotatedMaxHeight = AAAA.value.clientWidth;                                              // 最大高度變成容器的寬度
        mainVideoRef.value.style.maxWidth = `${rotatedMaxWidth}px`;
        mainVideoRef.value.style.maxHeight = `${rotatedMaxHeight}px`;
      }else{
        // 直向時，還原最大寬高
        mainVideoRef.value.style.maxWidth = `100%`;
        mainVideoRef.value.style.maxHeight = `100%`;
      }

      // 調整畫布大小同影像大小
      mainCanvasRef.value.style.height = `${mainVideoRef.value.offsetHeight}px`
      mainCanvasRef.value.style.width = `${mainVideoRef.value.offsetWidth}px`
    }
    
    return {
      AAAA,
      mainVideoRef,
      mainCanvasRef,

      Detection,
      DetectionBtnText,
      clickBtn,

      isCocoSsd,
      usingModelText,
      
      RotateVideo,
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
  // padding-bottom: 40px; // 底部空出 40px 給 info_dashboard，上方剩餘空間給 mainV，寫在html
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
  max-width: 100%; /* 不超过容器宽度 */
  max-height: 100%; /* 不超过容器高度 */

  transform-origin: center center; // 旋轉基準點為圖片中心
  transition: transform 0.5s ease; // 旋轉過度效果
}
.mainV > canvas{
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
