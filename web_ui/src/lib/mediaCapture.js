import user from '../services/user'
import { notification } from 'ant-design-vue'

/**
 * 從指定的 HTML5 <video> 元素的影像錄影並下載
 * @param {HTMLVideoElement} video
 * @param {String} id - droneID
 * @param {String} saveLocation - 其值為 "frontend(預設)" 或 "backend"
 */

export class videoElementRecorder {
  constructor(video, id, saveLocation = 'frontend') {
    this.video = video
    this.id = id
    this.chunks = []
    this.mediaRecorder = null
    this.testBlob = null
    this.saveLocation = saveLocation

    this.initMediaRecorder() // 初始化 MediaRecorder
  }

  initMediaRecorder() {
    const stream = this.video.captureStream() // 為 HTMLVideoElement 創建一个 MediaStream 對象
    this.mediaRecorder = new MediaRecorder(stream) // 創建一个 MediaRecorder 對象

    // 定義mediaRecorder的事件被觸發時的處理方法
    this.mediaRecorder.onstart = () => {
      this.chunks = [] // 初始化陣列
      this.testBlob = null
    }
    this.mediaRecorder.ondataavailable = (e) => {
      //有足夠的音頻或視頻數據被緩衝，或結束錄製時，ondataavailable 事件就會觸發。【這樣避免了數鴂Blob過大】
      console.log('e.data = ', e.data) //型態是blob
      this.testBlob = e.data
      this.chunks.push(e.data) // 將blob存入陣列
    }
    this.mediaRecorder.onstop = () => {
      console.log('this.chunks[0].stream() = ', this.chunks[0].stream()) //返回值：ReadableStream，讀取時傳回 Blob 的內容

      const blob = new Blob(this.chunks, { type: 'video/webm' })
      if (blob) {
        const currentTime = getDateTimeString()
        console.log(`結束錄製時間: ${currentTime}`)
        if (this.saveLocation == 'frontend') {
          downloadBlob(blob, `${this.id} ${currentTime}.webm`)
        } else if (this.saveLocation == 'backend') {
          saveBlobToBackend(blob, 'userName', this.id, `${currentTime}.webm`)
        }
      }
    }
  }

  /**
   * 開始錄影
   */
  startRecord() {
    console.log(this.id, '開始錄影')
    this.mediaRecorder.start() // 啟動錄製【觸發onstart】
  }

  /**
   * 停止錄影並下載影片
   */
  stopRecord() {
    this.mediaRecorder.stop() // 結束錄製【觸發 ondataavailable 和onstop 事件】
  }

  /**
   * 取得錄影狀態
   * @returns {String}
   */
  getRecordingStatus() {
    return this.mediaRecorder.state
  }

  getVideoBlob() {
    return this.testBlob
  }
}

// 也可以後端去取得用戶名稱，只是會變成一直開啟關閉DB連線不太好，還沒想到更好的方法
/**
 * 從指定的 HTML5 <video> 元素的影像連續截圖並下載。
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 * @param {String} userName
 * @param {String} id - droneID
 * @param {String} saveLocation - 其值為 "frontend(預設)" 或 "backend"
 */
export class videoElementScreenshot {
  constructor(video, canvas, userName, id, saveLocation = 'frontend') {
    this.video = video
    this.canvas = canvas
    this.userName = userName
    this.id = id
    this.continuousCapture = false
    this.saveLocation = saveLocation
    // this.myReqId = null
  }

  /**
   * 啟動連續畫面擷取，每隔固定時間執行一次截圖。
   */
  startContinuousCapture() {
    this.continuousCapture = true

    const capturing = () => {
      if (this.continuousCapture) {
        this.screenshot()
        setTimeout(capturing, 200) // 每過指定時間再截圖
        // this.myReqId = requestAnimationFrame(capturing); // get another frame
      } else {
        // cancelAnimationFrame(this.myReqId)
        console.log('stop')
      }
    }

    capturing()
  }

  /**
   * 停止連續畫面擷取。
   */
  stopContinuousCapture() {
    this.continuousCapture = false
  }

  /**
   * 取得錄影狀態
   * @returns {String}
   */
  isCapturing() {
    return this.continuousCapture
  }

  /**
   * 截取當前影片畫面並下載。
   */
  screenshot() {
    const currentTime = getDateTimeString()
    console.log(`screenshot當前時間: ${currentTime}`)

    const ctx = this.canvas.getContext('2d')
    ctx.canvas.width = this.video.videoWidth
    ctx.canvas.height = this.video.videoHeight
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.drawImage(this.video, 0, 0, ctx.canvas.width, ctx.canvas.height)

    this.canvas.toBlob(async (blob) => {
      // console.log("blob = ",blob)
      if (blob) {
        if (this.saveLocation == 'frontend') {
          downloadBlob(blob, `${this.id} ${currentTime}.png`) //前端網頁存取
        } else if (this.saveLocation == 'backend') {
          saveBlobToBackend(blob, this.userName, this.id, `${currentTime}.png`) //上傳到後端存取
        }
      }
    })
  }
}

/**
 * 將影像的blob檔轉換成檔案並下載
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename) {
  var href = URL.createObjectURL(blob) // 從 Blob 取出資料
  var link = document.createElement('a')
  document.body.appendChild(link)
  link.href = href
  link.download = filename
  link.click()
}

/**
 * 取得格式化後的當前日期時間字串，用於檔案名稱。
 * @returns {String} - 格式化後的日期時間字串。
 */
export function getDateTimeString() {
  var currentDate = new Date()
  // 從Date物件中取得當前日期時間，並用 string.padStart(len, '0')的方式補零
  var year = currentDate.getFullYear()
  var month = `${currentDate.getMonth() + 1}`.padStart(2, '0') // 月份是从0开始的，所以要加1
  var day = `${currentDate.getDate()}`.padStart(2, '0')
  var hours = `${currentDate.getHours()}`.padStart(2, '0')
  var minutes = `${currentDate.getMinutes()}`.padStart(2, '0')
  var seconds = `${currentDate.getSeconds()}`.padStart(2, '0')
  var milliseconds = `${currentDate.getMilliseconds()}`.padStart(3, '0')

  return `${year}${month}${day}_${hours}${minutes}${seconds}.${milliseconds}`
}

/**
 * 將截圖儲存到後端【no 影片，影片檔案太大不合適，大檔案影片尚未成功】
 * @param {Blob} blob
 * @param {String} droneID
 * @param {string} filename
 */
export async function saveBlobToBackend(blob, userName, droneID, filename) {
  if (blob) {
    let fd = new FormData() // 創建 FormData 來傳送 blob
    fd.append('files', blob)
    fd.append('userName', userName)
    fd.append('droneID', droneID)
    fd.append('fileName', filename)
    // console.log("fd.get('files') = ",fd.get('files'))

    const { data, status } = await user.saveDroneVideoBlob(fd)
    console.log('message from backend: ', data.msg)

    if (status >= 400) {
      notification.success({ message: data.msg })
    }
  }
}

/** 分段上傳(還在測試) */
// export async function uploadFileByChunks(blob, userName, droneID, filename){
//   if(!blob){
//     console.log("沒有數續")
//     return
//   }
//   console.log("有Blob", blob.length
//   )
//   for(let i=0;  i<blob.length
//     ; i++){
//     let fd = new FormData(); // 創建 FormData 來傳送 blob
//     fd.append('files', blob[i]);
//     fd.append('userName', userName);
//     fd.append('droneID', droneID);
//     fd.append('fileName', filename);

//     if(i == (blob.length-1))
//       fd.append('isEND', true);
//     else
//       fd.append('isEND', false);

//     const { data } = await user.testSaveVideo(fd)
//     console.log("message from backend: ",data.msg)

//   }

// }
