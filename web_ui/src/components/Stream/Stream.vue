<template>
  <div class="rtc-video">
    <!-- new add select -->
    <a-select
      v-model:value="value"
      label-in-value
      style="width: 120px"
      :options="options"
      @change="handleChange"
      class="dropdown-style"
    >
    </a-select>

    <video ref="remoteVideoEl" autoplay></video>
    <canvas ref="canvasEl" class="boundingBox"></canvas>
  </div>

  <div class="control__wrapper">
    <a-tooltip placement="right" color="blue" title="Establish WEBRTC">
      <a-button
        class="button"
        size="small"
        shape="circle"
        type="primary"
        @click="startPeerNegotiation"
      >
        <ApiOutlined />
      </a-button>
    </a-tooltip>
    <a-tooltip
      placement="right"
      color="blue"
      :title="recordButton.isRecording ? 'Stop recording' : 'Start recording'"
    >
      <a-button
        class="button"
        size="small"
        shape="circle"
        type="primary"
        :disabled="!recordButton.isReady"
        :danger="recordButton.isRecording"
        @click="handleRecording"
      >
        <CameraOutlined />
      </a-button>
    </a-tooltip>
  </div>
</template>

<script>
import socket from '../../lib/websocket'
import detection from '../../lib/detection'
import {
  createPeerConnection,
  createAnswerAndSetLocalSDP,
  createOfferAndSetLocalSDP,
  getLocalStream
} from '../../lib/webRTC'
import { ApiOutlined, CameraOutlined } from '@ant-design/icons-vue'
import { onBeforeUnmount, reactive, ref } from '@vue/runtime-core'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
export default {
  name: 'Stream',
  components: {
    ApiOutlined,
    CameraOutlined
  },
  setup() {
    const remoteVideoEl = ref(null)
    const canvasEl = ref(null)
    let pc
    let recorder
    let localStream
    let remoteStream
    let dummyStream
    let localDisplayStream
    const store = useStore()
    const recordButton = reactive({
      isReady: false,
      isRecording: false
    })

    const setLogs = (log) => store.dispatch('setLogs', log)

    //多做一個droneID來選擇，然後在 socket.emit('send-webrtc', {})新增droneID來加入
    const options = ref([
      {
        value: 'jack',
        label: 'Jack (100)'
      },
      {
        value: 'lucy',
        label: 'Lucy (101)'
      }
    ])

    const handleChange = (value) => {
      console.log(value) // { key: "lucy", label: "Lucy (101)" }
    }

    //handle ice candidate events
    //要看一下
    const onIceCandidate = (event) => {
      //console.log()
      console.log('onIceCandidate Event: ', event)
      if (event.candidate) {
        setTimeout(() => {
          socket.emit('send-webrtc', {
            // droneID:
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
      console.log('ontrack event: ', event)
      setLogs('Received track')
      // recordButton.isReady = true
      remoteStream = event.streams[0]
      remoteVideoEl.value.srcObject = remoteStream
      detection.setupCanvasContainer(remoteVideoEl.value, canvasEl.value)
      detection.start(remoteVideoEl.value, canvasEl.value)
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
        remoteVideoEl.value.srcObject = new MediaStream()

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
      if (pc?.connectionState) {
        setLogs('Close previous peer connection')
        pc.close()
      }
      pc = createPeerConnection()
      console.log('Create peer connection: ', pc)
      setLogs('Create peer connection')
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

    const startPeerNegotiation = async () => {
      initPeerConnection()
      const offer = await createOfferAndSetLocalSDP(pc)
      console.log('offer: ', offer)
      setLogs('Create offer & set offer becomes local SDP')
      //Fixedme here，這裡要改成傳droneID
      socket.emit('send-webrtc', { type: 'offer', payload: offer })
      setLogs('Send offer')
    }

    //
    // handle record events
    //

    const recordStarted = () => {
      setLogs('Start recording')
      message.success('Start recording')
    }

    const recordStopped = () => {
      setLogs('Stop recording')
      message.warn('Stop recording')
    }

    const recordDataAvailable = (event) => {
      const a = document.createElement('a')
      const timeStamp = new Date().toLocaleString()
      a.href = URL.createObjectURL(event.data)
      a.download = `drone-video-${timeStamp}.mp4`
      a.click()
    }

    const recordOccurError = (event) => setLogs(event.error.name)

    // screen record
    const initMediaRecorder = async () => {
      try {
        localDisplayStream = await navigator.mediaDevices.getDisplayMedia({
          width: 1920,
          heigh: 1080
        })
        recorder = new MediaRecorder(localDisplayStream, {
          mimeType: 'video/webm;codecs="h264,opus"',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 5000000
        })
        recorder.onstart = recordStarted
        recorder.onstop = recordStopped
        recorder.ondataavailable = recordDataAvailable
        recorder.onerror = recordOccurError
        recorder.start()
      } catch (error) {
        recordButton.isRecording = false
        message.error(`Record Canceled by reason of ${error}`)
      }
    }

    const handleRecording = () => {
      if (recordButton.isRecording) {
        recordButton.isRecording = false
        recorder.stop()
        localDisplayStream.getTracks().forEach((track) => track.stop())
        return
      }
      recordButton.isRecording = true
      initMediaRecorder()
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
          if (data.type === 'offer') {
            setLogs('Received offer')
            initPeerConnection()
            await pc.setRemoteDescription(data.payload)
            setLogs('Set offer becomes remote SDP')
            const answer = await createAnswerAndSetLocalSDP(pc)
            setLogs('Create answer & set answer becomes local SDP')
            socket.emit('send-webrtc', { type: 'answer', payload: answer })
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
      socket.off('webrtc-topic')
      setTimeout(() => {
        localStream?.getTracks().forEach((track) => track.stop())
        dummyStream?.getTracks().forEach((track) => track.stop())
      }, 1000)
    })

    return {
      remoteVideoEl,
      canvasEl,
      startPeerNegotiation,
      handleRecording,
      recordButton,
      value: ref({
        value: 'lucy'
      }),
      options,
      handleChange
    }
  }
}
</script>

<style lang="scss" scoped>
.rtc-video {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.control__wrapper {
  position: absolute;
  z-index: 10;
  top: 50%;
  left: 5px;
  display: flex;
  flex-direction: column;
  transform: translateY(-50%);

  .button {
    margin-right: 0;
    margin-bottom: 2px;
  }
  .rtc-video {
    position: relative;
    width: 80%;
    height: 80%;

    video {
      position: relative;
    }
    ::v-deep(.dropdown-style) {
      background: aqua !important;
      ::v-deep(.ant-select .ant-select-single) {
      }
    }
    .boundingBox {
      position: absolute;

      top: 0;
      left: 0;
      z-index: 5;
    }
  }
}
</style>
