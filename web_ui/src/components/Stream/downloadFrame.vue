<template>
  <div>
    <button @click="startRecord()">startRecord</button><br>
    <button @click="stopRecord()">stopRecord</button><br>
    <button @click="screenshot()">screenshot</button><br>
    <canvas ref="canvasRef" style="display: none;"></canvas>
  </div>
</template>

<script>
import { onBeforeUnmount, onMounted, ref, computed } from '@vue/runtime-core'
import user from '../../services/user'
import { notification } from 'ant-design-vue'


export default {
  name: 'downloadFrame',
  props: {
    /* srcObject：來自父組件的影像Element */
    mainVideoRef: HTMLVideoElement,
  },

  setup(props) {
    const canvasRef = ref(null)
    
    /************** 影像錄製 *********************** */
    let mediaRecorder;
    let chunks;
    const startRecord = async ()=>{
      console.log("開始錄影")

      // 創建一个 MediaStream 對象
      const stream = props.mainVideoRef.captureStream();
      // console.log("stream = ",stream)
      // 創建一个 MediaRecorder 對象
      mediaRecorder = new MediaRecorder(stream);

      // 定義mediaRecorder的事件被觸發時的處理方法
      mediaRecorder.onstart = () => chunks = []; // 初始化陣列
      mediaRecorder.ondataavailable = e => chunks.push(e.data); // 透過ondataavailable可以取得mediaRecorder目前存取的二進制資料(byteArray)【在結束錄製時才會觸發】
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, {type: "video/webm"});
        downloadBlob(blob, 'testfile.webm')
      };

      mediaRecorder.start(); // 啟動錄製【觸發onstart】
    }

    const stopRecord = ()=>{
      mediaRecorder.stop(); // 結束錄製【觸發ondataavailable、onstop】
    }

    /************** 影像截圖 *********************** */
    const screenshot = ()=>{
      const ctx = canvasRef.value.getContext('2d')
      ctx.canvas.width = props.mainVideoRef.videoWidth
      ctx.canvas.height = props.mainVideoRef.videoHeight
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      ctx.drawImage(props.mainVideoRef, 0, 0, ctx.canvas.width, ctx.canvas.height);
      
      canvasRef.value.toBlob(async(blob)=>{
        console.log(blob)
        downloadBlob(blob, 'testFile.png') //前端網頁存取


        // /** 如果要丟到後端存取 */

        // const formData = new FormData();
        // formData.append('image', blob, 'testFile.png'); // 'image' 是后端接收文件的字段名
        // console.log(typeof formData.get('image')); // string



        // const { data } = await user.saveDroneVideoBlob({
        //   formData
        // })
        // console.log("data = ",data)
        // notification.success({ message: data.msg }) 
      })


      
    }
    
    /************** 影像存檔 *********************** */
    const downloadBlob = (blob, filename)=>{
      var href = URL.createObjectURL(blob);
      // 從 Blob 取出資料
      var link = document.createElement("a");
      document.body.appendChild(link);
      link.href = href;
      link.download = filename;
      link.click();
    }

    return {
      canvasRef,

      startRecord,
      stopRecord,
      screenshot
    }
  }
}

</script>


<style lang="scss" scoped>
</style>
