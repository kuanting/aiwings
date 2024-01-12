/**
 * 從指定的 HTML5 <video> 元素的影像錄影並下載
 * @param {HTMLVideoElement} video
 * @param {String} id
 */

export class videoElementRecorder {
  constructor(video, id) {
    this.video = video;
    this.id = id
    this.chunks = [];
    this.mediaRecorder = null;
    this.initMediaRecorder(); // 初始化 MediaRecorder
  }

  initMediaRecorder(){
    const stream = this.video.captureStream(); // 為 HTMLVideoElement 創建一个 MediaStream 對象
    this.mediaRecorder = new MediaRecorder(stream); // 創建一个 MediaRecorder 對象

    // 定義mediaRecorder的事件被觸發時的處理方法
    this.mediaRecorder.onstart = () => this.chunks = []; // 初始化陣列
    this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data); // 取得目前存取的byteArray【在結束錄製時才會觸發】
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: "video/webm" });
      if(blob){
        const currentTime = getDateTimeString()
        console.log(`結束錄製時間: ${currentTime}`);
        downloadBlob(blob, `${this.id} ${currentTime}.webm`)
      }
    };
  }

  /**
   * 開始錄影
   */
  startRecord() {
    console.log(this.id, "開始錄影")
    this.mediaRecorder.start(); // 啟動錄製【觸發onstart】
  }

  /**
   * 停止錄影並下載影片
   */
  stopRecord() {
    this.mediaRecorder.stop(); // 結束錄製【觸發 ondataavailable 和onstop 事件】
  }

  /**
   * 取得錄影狀態
   * @returns {String}
   */
  getRecordingStatus(){
    return this.mediaRecorder.state
  }
}


/**
 * 從指定的 HTML5 <video> 元素的影像連續截圖並下載。
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 * @param {String} id
 */
export class videoElementScreenshot {
  constructor(video, canvas, id) {
    this.video = video;
    this.canvas = canvas;
    this.id = id;
    this.continuousCapture = false
    // this.myReqId = null
  }
  
  /**
   * 啟動連續畫面擷取，每隔固定時間執行一次截圖。
   */
  startContinuousCapture() {
    this.continuousCapture = true

    const capturing = ()=>{
      if(this.continuousCapture){
        this.screenshot()
        setTimeout(capturing, 200); // 每過指定時間再截圖
        // this.myReqId = requestAnimationFrame(capturing); // get another frame
      }else{
        // cancelAnimationFrame(this.myReqId)
        console.log("stop")
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
    return this.continuousCapture;
  }

  /**
   * 截取當前影片畫面並下載。
   */
  screenshot(){
    const currentTime = getDateTimeString()
    console.log(`screenshot當前時間: ${currentTime}`);

    const ctx = this.canvas.getContext('2d')
    ctx.canvas.width = this.video.videoWidth
    ctx.canvas.height = this.video.videoHeight
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.drawImage(this.video, 0, 0, ctx.canvas.width, ctx.canvas.height);
    
    this.canvas.toBlob(async(blob)=>{
      // console.log("blob = ",blob)
      if(blob){
        downloadBlob(blob, `${this.id} ${currentTime}.png`) //前端網頁存取
      }
    })
  }
}

/**
 * 將影像的blob檔轉換成檔案並下載
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename){
  var href = URL.createObjectURL(blob);  // 從 Blob 取出資料
  var link = document.createElement("a");
  document.body.appendChild(link);
  link.href = href;
  link.download = filename;
  link.click();
}

/**
 * 取得格式化後的當前日期時間字串，用於檔案名稱。
 * @returns {String} - 格式化後的日期時間字串。
 */
export function getDateTimeString(){
  var currentDate = new Date();
  // 從Date物件中取得當前日期時間，並用 string.padStart(len, '0')的方式補零
  var year = currentDate.getFullYear();
  var month = `${(currentDate.getMonth() + 1)}`.padStart(2, '0'); // 月份是从0开始的，所以要加1
  var day = `${currentDate.getDate()}`.padStart(2, '0');
  var hours = `${currentDate.getHours()}`.padStart(2, '0');
  var minutes = `${currentDate.getMinutes()}`.padStart(2, '0');
  var seconds = `${currentDate.getSeconds()}`.padStart(2, '0');
  var milliseconds = `${currentDate.getMilliseconds()}`.padStart(3, '0');

  return `${year}${month}${day}_${hours}${minutes}${seconds}.${milliseconds}`
}