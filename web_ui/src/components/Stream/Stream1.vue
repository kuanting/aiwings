<template>
  <div class="wrap">
    
    <div class="main_frame frame_container" > 
      <!------------------------------------------->
      <div class="main_video" >
        <!-- <div style="background-color: rgb(255, 234, 77); width: 2000px; height: 30px;"></div> -->
        <video
          ref="remoteMainVideoEl"
          poster="../../assets/live-stream.png"
          autoplay
        ></video>
        <!-- <canvas ref="canvasEl" class="boundingBox" style="background-color: rgb(255, 234, 77); margin:10px"></canvas> -->
      </div>
      <div class="info_dashboard">
        <p>
          Information display
          TEST
        </p>
        <button @click="clickBtn()">{{ DetectionBtnText }}</button>
      </div>
      <!------------------------------------------->
    </div>
    <div class="select_frame frame_container">
      <!------------------------------------------->
      <!-- <div class="subvideo_content"> -->
        <div v-for="index in droneArr" class="subVideoStream">
          <div class="details">
            <h3>{{ index.id }}</h3>
          </div>
          <div
            class="video"
            @click="
              select_drone_video(index.id), startPeerNegotiation(index.id)
            "
          >
            <video
              :ref="el => {
                remoteSubVideoEl[index.id] = el;
              }"
              poster="../../assets/live-stream.png"
              autoplay
            ></video>
          </div>
        </div>
      <!-- </div> -->
      <!------------------------------------------->
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { onBeforeUnmount, onMounted, ref, computed } from '@vue/runtime-core'
import socket from '../../lib/websocket'
import detection from '../../lib/detection'
import {
  createPeerConnection,
  createAnswerAndSetLocalSDP,
  createOfferAndSetLocalSDP,
  getLocalStream
} from '../../lib/webRTC'
import { message } from 'ant-design-vue'

export default {
  name: 'monitor',

  setup() {
    const remoteMainVideoEl = ref(null)
    const remoteSubVideoEl = []

    // const TESTvideo = ref(null)
    const canvasEl = ref(null) // for 顯示偵測結果

    let pc = []
    let recorder
    let localStream
    let remoteStream
    let dummyStream
    let localDisplayStream
    const store = useStore()
    const rabbitmqIsInit = computed(() => store.getters.getRabbitmqIsInit)
    const userInfo = computed(() => store.getters.getUserInfo)
    const droneArr = userInfo.value.droneId
    const user = computed(() => store.getters.getUserInfo)
    const setLogs = (log) => store.dispatch('setLogs', log)

    /*************** */
    const Detection = ref(false)
    const DetectionBtnText = computed(()=>{
      return Detection.value ? "停止偵測" : "開始偵測"
    })
    const clickBtn = ()=>{
      Detection.value = !Detection.value
      if(Detection.value){
        startDetection()
      }
    }
    /*************** */

    const select_drone_video = (droneID) => {
      console.log('click', droneID,"，將此子畫面映射到主畫面上")
      // remoteMainVideoEl.value.srcObject = remoteSubVideoEl
      if(remoteSubVideoEl[droneID].srcObject){
        remoteMainVideoEl.value.srcObject = remoteSubVideoEl[droneID].srcObject
        remoteSubVideoEl[droneID].srcObject = remoteMainVideoEl.value.srcObject //有時子畫面不知為何不顯示，這樣強制出現...
      }

      // console.log("---detection.setupCanvasContainer(影像, 畫布)---")
      // detection.setupCanvasContainer(remoteMainVideoEl.value, canvasEl.value)
      // // detection.setupCanvasContainer(remoteSubVideoEl[droneID], canvasEl.value)
      // detection.start(remoteMainVideoEl.value, canvasEl.value)
      // // detection.start(remoteSubVideoEl[droneID], canvasEl.value)

    }
    

    const startDetection =()=>{
    //   if(remoteMainVideoEl.value.srcObject){
    //     console.log("---detection.setupCanvasContainer(影像, 畫布)---")
        
    //     detection.setupCanvasContainer(remoteMainVideoEl.value, canvasEl.value)
    //     // detection.setupCanvasContainer(remoteSubVideoEl[droneID], canvasEl.value)
    //     console.log("remoteMainVideoEl.value = ",remoteMainVideoEl.value,
    //                 "canvasEl.value",canvasEl.value)

    //     detection.start(remoteMainVideoEl.value, canvasEl.value)
    //     // detection.start(remoteSubVideoEl[droneID], canvasEl.value)
    //   }
    }

    const rabbitmqInit = () => {
      // setLogs(`Websocket connected: ${socket.id}`)
      console.log("----rabbitmqInit---\nsocket.id = ",socket.id)
      for (let i in user.value.droneId) {
        setLogs(`Drone ID: ${user.value.droneId[i]}`)
        console.log(user.value.droneId[i])
      }
      socket.emit('establish-rabbitmq-connection-webrtc', user.value.droneId)
      console.log("socket.emit('establish-rabbitmq-connection-webrtc', user.value.droneId)\n---------------")
    }
    // Trigger RabbitMQ when the first come or refresh pages
    if (!rabbitmqIsInit.value) {
      rabbitmqInit()
      store.dispatch('setRabbitmqIsInit', true)
    }

    // Websocket event listening
    socket.on('connect', () => rabbitmqInit())
    socket.on('disconnect', (reason) => {
      setLogs(`Websocket disconnected: ${reason}`)
    })
    socket.on('queue-created', (queueName) => {
      setLogs(`Queue created: ${queueName}`)
    })

    const onIceCandidate = (droneID, event) => {
      if (event.candidate) {
        setTimeout(() => {
          socket.emit('send-webrtc', {
            droneID: droneID,
            type: 'candidate',
            payload: event.candidate
          })
          setLogs('Send candidate')
        }, 1000)
      }
    }

    // handle receive media track event
    const onTrack = (droneID, event) => {
      console.log("----onTrack()---接收影像----droneID=",droneID)
      //consoloe.log()
      console.log('ontrack event.streams[0]: ', event.streams[0])
      setLogs('Received track')
      // recordButton.isReady = true
      remoteStream = event.streams[0]
      remoteSubVideoEl[droneID].srcObject = remoteStream
    }

    // handle connection change
    const onIceConnectionStateChange = (droneID) => {
      console.log("----onIceConnectionStateChange---","\n現在的ICE連線狀態是: ",pc[droneID].iceConnectionState)
      setLogs(`ICE connection Change: ${pc[droneID].iceConnectionState}`)
      if (pc[droneID].iceConnectionState === 'disconnected') {     
        console.log("ICE連線斷開")   
        // if (recordButton.isRecording) {
        //   recordButton.isRecording = false
        //   recorder.stop()
        //   localDisplayStream.getTracks().forEach((track) => track.stop())
        // }
        // recordButton.isReady = false
        remoteStream.getTracks().forEach((track) => track.stop())
        remoteSubVideoEl[droneID].srcObject = new MediaStream()
          
        // // clean stream canvas
        // detection.cleanBoundingBox(canvasEl.value)
        // detection.stopDetection()
      }
    }

    const onIceConnectionGatheringChange = (droneID) => {
      // console.log("---onIceConnectionGatheringChange--", "\niceGatheringState = ",pc[droneID].iceGatheringState)
      setLogs(`ICE gathering Change: ${pc[droneID].iceGatheringState}`)
    }

    // peer connection initialization
    const initPeerConnection = (droneID) => {
      // console.log("initPeerConnectsion: droneId=", droneID)

      if (pc[droneID]?.connectionState) {
        setLogs('Close previous peer connection')
        pc[droneID].close()
      }
      pc[droneID] = createPeerConnection()
      console.log('Create peer connection: ', pc[droneID])
      setLogs('Create peer connection')
      // pc.onicecandidate = onIceCandidate(pc, droneId)
      pc[droneID].onicecandidate = (event) => onIceCandidate(droneID, event)
      pc[droneID].ontrack = (event) => onTrack(droneID, event)
      pc[droneID].oniceconnectionstatechange = () => onIceConnectionStateChange(droneID)
      pc[droneID].onicegatheringstatechange = () => onIceConnectionGatheringChange(droneID)
      if (localStream) {
        localStream.getTracks().forEach((track) => pc[droneID].addTrack(track))
        setLogs('Add local tracks to peer connection')
      } else {
        dummyStream.getTracks().forEach((track) => pc[droneID].addTrack(track))
        setLogs('No local stream,add dummy track to peer connection')
      }
    }

    const startPeerNegotiation = async (droneID) => {
      // remoteSubVideoEl.value.srcObject = localStream
      // console.log(`droneID=${droneID}, \nremoteSubVideoEl[droneID] = `,remoteSubVideoEl[droneID])
      // select_droneID = droneID

      if(pc[droneID]==null){
        console.log(`*****startPeerNegotiation(${droneID})*****`)
        initPeerConnection(droneID)
        const offer = await createOfferAndSetLocalSDP(pc[droneID])
        console.log('offer: ', offer)
        setLogs('Create offer & set offer becomes local SDP')
        //Fixedme here，這裡要改成傳droneIDs })
        // socket.emit('send-webrtc', { droneID: droneID,  type: 'offer',  payload: offer})
        setLogs('Send offer')
        console.log(`****startPeerNegotiation(${droneID})**END*****`)
      }
    }

    // webRTC establish workflow
    getLocalStream()
      .then((mediaStream) => {
        console.log("getLocalStream() 成功")
        localStream = mediaStream

        //TESTvideo.value.srcObject  = localStream

        // remoteSubVideoEl.value.srcObject = localStream
        // console.log("remoteSubVideoEl.value = ",remoteSubVideoEl.value,
        //               "TESTvideo.value = ",TESTvideo.value)

        // document.getElementById('Tvideo').srcObject = localStream
        // console.log("document.getElementById('Tvideo') = ",document.getElementById('Tvideo').srcObject)
      })
      .catch((error) => {
        message.error(
          `Cannot add local stream to peer by reason of ${error.message}`
        )
        // create dummy stream
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        dummyStream = canvas.captureStream()

        // setup bounding box poster
        const streamCtx = canvasEl.value.getContext('2d')
        // streamCtx.width = 100
        // streamCtx.height = 100
        streamCtx.fillStyle = "blue"; //設置填充色為藍色
        streamCtx.fillRect(0, 0, streamCtx.width, streamCtx.height)
        streamCtx.fillStyle = "black"; //設置填充色為黑色
        streamCtx.font = '10pt Arial'
        streamCtx.fillText('Waiting Stream Signal', 20, 50)
      })
      .finally(() => {
        socket.on('webrtc-topic', async (data) => {
          console.log("接收的資料 = ",data)

          if (data.type === 'offer') {
            console.log('Received offer')
            setLogs('Received offer')
            initPeerConnection(data.id) 
            // await startPeerNegotiation(data.id)
            
            await pc[data.id].setRemoteDescription(data.payload)
            setLogs('Set offer becomes remote SDP')
            const answer = await createAnswerAndSetLocalSDP(pc[data.id])
            setLogs('Create answer & set answer becomes local SDP')
            socket.emit('send-webrtc', {
              droneID: data.id,  
              type: 'answer',
              payload: answer
            })
            setLogs('Send answer')
          }

          if (data.type === 'answer') {
            console.log('Received answer')
            setLogs('Received answer')
            await pc[data.id].setRemoteDescription(data.payload)
            setLogs('Set answer becomes remote SDP')
          }

          if (data.type === 'candidate') {
            
            await pc[data.id].addIceCandidate(data.payload)
            setLogs('Add received candidate')
            console.log('Add received candidate answer')
          }

          console.log("________WebRTC交換結束__________")
        })
      })

    onBeforeUnmount(() => {
       // Remove listener to prevent multiple listening
      socket.off('connect')
      socket.off('disconnect')
      socket.off('queue-created')
      socket.off('webrtc-topic')
      setTimeout(() => {
        localStream?.getTracks().forEach((track) => track.stop())
        dummyStream?.getTracks().forEach((track) => track.stop())
      }, 1000)
    })

    return {
      remoteMainVideoEl,
      remoteSubVideoEl,
      // TESTvideo,
      canvasEl,

      droneArr,
      select_drone_video,
      startPeerNegotiation,

      Detection,
      DetectionBtnText,
      clickBtn,
      startDetection
    }
  }
}
</script>

<style lang="scss" scoped>
.wrap {
  width: 100%;
  height: calc(100vh - 60px);
  // position: fixed; //將其參考空間設定為「視窗」
  /* flex外元素屬性 */
  display: flex;
  overflow-x: auto; /* 添加水平滚动条 */
  background: #ffffff;
}
video{
  // width: 50%;//測試
  max-width:100%;
  max-height:100%;
  // object-fit: fill; /* 图片填充整个容器，忽略原始宽高比 */
  border-radius: 3%;
  padding: 2%;
}
.frame_container{
  margin: 10px;
  border-radius: 3%;
  padding: 10px;
  /***** flex 外元素屬性 *****/
  display: flex;
  flex-direction: column; //使其內容物以垂直排序
  // justify-content: center; /* 使其內容物水平居中 */
}
.main_frame {
  min-width: 600px;
  // height: 100%;//讓高度自動調整

  /***** flex 內元素屬性 *****/
  flex-grow: 1; //設置延展，使之可充滿剩餘空間【寬度自動調整】
  // background: rgb(23, 151, 68, 0.3);
  background: #4f6d7a;
  
  .main_video {
    width: 100%;
    height: calc(100% - 40px);

    /***** flex 內元素屬性 *****/
    flex-grow: 1; //設置延展，使之可充滿剩餘空間
    /***** flex 外元素屬性 *****/
    display: flex;
    justify-content: center; /* 內容物水平居中 */

    // background: #7ba9ffca;
  }
  .info_dashboard{
    // width: 100px; 
    height: 40px;
    padding: 3px;
    /***** flex 外元素屬性 *****/
    display: flex; 

    background-color: #c0d6df;
  }
}
.select_frame {
  width: 25%;
  min-width: 200px;
  // width: 10%; //測試
  // min-width: 10px; //測試
  // height: 100%;//讓高度自動調整

  /***** flex 外元素屬性 *****/
  display: flex;
  flex-direction: column; // 使其內容元素軸線方向為由上到下
  overflow: auto;
  
  background: #6c96a8;
}  
</style>