<template>
  <div class="wrap">
    <div class="main_frame">
      <div class="main_video">
        <video
          ref="remoteMainVideoEl"
          poster="../../assets/live-stream.png"
          autoplay
        ></video>
        <canvas ref="canvasEl" class="boundingBox"></canvas>
      </div>
      <div class="info_dashboard">
        <h1>
          Information display<br />
          TEST
        </h1>
      </div>
    </div>
    <div class="select_frame">
      <div class="subvideo_content">
        <div v-for="index in droneArr" class="subVideoStream">
          <!-- <div class="details">
            <h2>{{ index.id }}</h2>
          </div> -->
          <div
            class="video"
            @click="
              startPeerNegotiation(index.id), select_drone_video(index.id)
            "
          >
            <video
              ref="remoteSubVideoEl"
              poster="../../assets/live-stream.png"
              autoplay
            ></video>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { onBeforeUnmount, ref, computed } from '@vue/runtime-core'
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
    const remoteSubVideoEl = ref(null)
    const canvasEl = ref(null)

    // let test1 = ref(null)

    let pc
    let recorder
    let localStream
    let remoteStream
    let dummyStream
    let localDisplayStream
    let select_droneID
    const store = useStore()
    const rabbitmqIsInit = computed(() => store.getters.getRabbitmqIsInit)
    const userInfo = computed(() => store.getters.getUserInfo)
    const droneArr = userInfo.value.droneId
    const user = computed(() => store.getters.getUserInfo)
    const setLogs = (log) => store.dispatch('setLogs', log)

    const select_drone_video = (droneID) => {
      console.log('click', droneID)
      // remoteMainVideoEl.value.srcObject = remoteSubVideoEl
    }

    const rabbitmqInit = () => {
      // setLogs(`Websocket connected: ${socket.id}`)
      console.log(socket.id)
      for (let i in user.value.droneId) {
        setLogs(`Drone ID: ${user.value.droneId[i]}`)
        console.log(user.value.droneId[i])
      }
      socket.emit('establish-rabbitmq-connection-webrtc', user.value.droneId)
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

    const onIceCandidate = (event) => {
      if (event.candidate) {
        setTimeout(() => {
          socket.emit('send-webrtc', {
            droneID: select_droneID,
            type: 'candidate',
            payload: event.candidate
          })
          setLogs('Send candidate')
        }, 1000)
      }
    }

    // handle receive media track event
    const onTrack = (event) => {
      //consoloe.log()
      // console.log('ontrack event: ', event)
      setLogs('Received track')
      recordButton.isReady = true
      remoteStream = event.streams[0]
      remoteSubVideoEl.value.srcObject = remoteStream
      detection.setupCanvasContainer(remoteSubVideoEl.value, canvasEl.value)
      detection.start(remoteSubVideoEl.value, canvasEl.value)
    }

    // handle connection change
    const onIceConnectionStateChange = () => {
      setLogs(`ICE connection Change: ${pc.iceConnectionState}`)
      if (pc.iceConnectionState === 'disconnected') {
        if (recordButton.isRecording) {
          recordButton.isRecording = false
          recorder.stop()
          localDisplayStream.getTracks().forEach((track) => track.stop())
        }
        recordButton.isReady = false
        remoteStream.getTracks().forEach((track) => track.stop())
        remoteSubVideoEl.value.srcObject = new MediaStream()

        // clean stream canvas
        detection.cleanBoundingBox(canvasEl.value)
        detection.stopDetection()
      }
    }

    const onIceConnectionGatheringChange = () => {
      setLogs(`ICE gathering Change: ${pc.iceGatheringState}`)
    }

    // peer connection initialization
    const initPeerConnection = () => {
      // console.log("droneID, initPeerConnection: ", droneId)
      if (pc?.connectionState) {
        setLogs('Close previous peer connection')
        pc.close()
      }
      pc = createPeerConnection()
      console.log('Create peer connection: ', pc)

      setLogs('Create peer connection')
      // pc.onicecandidate = onIceCandidate(pc, droneId)
      pc.onicecandidate = onIceCandidate
      pc.ontrack = onTrack
      pc.oniceconnectionstatechange = onIceConnectionStateChange
      pc.onicegatheringstatechange = onIceConnectionGatheringChange
      if (localStream) {
        localStream.getTracks().forEach((track) => pc.addTrack(track))
        setLogs('Add local tracks to peer connection')
      } else {
        dummyStream.getTracks().forEach((track) => pc.addTrack(track))
        setLogs('No local stream,add dummy track to peer connection')
      }
    }

    const startPeerNegotiation = async (droneID) => {
      select_droneID = droneID
      initPeerConnection()
      const offer = await createOfferAndSetLocalSDP(pc)
      console.log('offer: ', offer)
      setLogs('Create offer & set offer becomes local SDP')
      //Fixedme here，這裡要改成傳droneIDs })
      setLogs('Send offer')
    }

    // webRTC establish workflow
    getLocalStream()
      .then((mediaStream) => {
        localStream = mediaStream
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
        // const streamCtx = canvasEl.value.getContext('2d')
        // streamCtx.font = '20pt Arial'
        // streamCtx.fillText('Waiting Stream Signal', 20, 50)
      })
      .finally(() => {
        socket.on('webrtc-topic', async (data) => {
          console.log(data)
          if (data.type === 'offer') {
            setLogs('Received offer')
            initPeerConnection()
            await pc.setRemoteDescription(data.payload)
            setLogs('Set offer becomes remote SDP')
            const answer = await createAnswerAndSetLocalSDP(pc)
            setLogs('Create answer & set answer becomes local SDP')
            socket.emit('send-webrtc', {
              droneID: select_droneID,
              type: 'answer',
              payload: answer
            })
            setLogs('Send answer')
          }

          if (data.type === 'answer') {
            setLogs('Received answer')
            await pc.setRemoteDescription(data.payload)
            setLogs('Set answer becomes remote SDP')
          }

          if (data.type === 'candidate') {
            await pc.addIceCandidate(data.payload)
            setLogs('Add received candidate')
          }
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
      droneArr,
      select_drone_video,
      startPeerNegotiation
    }
  }
}
</script>

<style lang="scss" scoped>
.wrap {
  width: 100%;
  height: calc(100vh - 10px);
  display: flex;
  position: fixed;
  background: #c7c4c4ca;
}
.main_frame {
  border-radius: 3%;
  // background: rgb(23, 151, 68, 0.3);
  width: 70%;
  height: 93%;
  padding: 10px;
  margin: 1%;
  background: #6f6e6eca;

  .main_video {
    display: flex;
    width: 100%;
    height: 80%;
    border-radius: 3%;
    // background-image: url('../../assets/live-stream.png');
    background-size: 100% 100%;
    @media (min-width: 300px) {
      visibility: visible;
    }
    video {
      object-fit: fill;
      width: 100%;
      background-size: 100% 100%;
      height: auto;
      border-radius: 5%;
      // background-image: url('../../assets/live-stream.png');
    }
  }
  .info_dashboard {
    background-color: rgb(90, 55, 194);
    display: flex;
    margin: 2%;
    width: auto;
    height: 15%;
    border-radius: 3%;
  }
}
.select_frame {
  /* background: blue; */
  width: 25%;
  height: 100%;
  padding: 10px;
  margin: 1%;
  display: flex;
  flex-direction: column;
  flex: 0 0;
  flex-basis: auto;
  background: #6f6e6eca;
  border-radius: 3%;
  .subvideo_content {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
  }
  .subVideoStream {
    display: flex;
    width: 100%;
    height: 30%;
    padding: 10px;
    margin-right: 5%;
  }
  // .details {
  //   background-color: rgba(1, 313, 3, 0.5);
  //   width: 30%;
  //   height: 100%;
  //   align-items: center;
  //   border-radius: 5%;
  //   margin: 10px;
  // }

  .video {
    width: 100%;
    height: 100%;
    // background-image: url('../../assets/live-stream.png');
    // background-size: 100% 100%;
    border-radius: 5%;
    margin: 10px;
    video {
      object-fit: fill;
      width: 100%;
      height: 100%;
      border-radius: 5%;
    }
  }
}
</style>