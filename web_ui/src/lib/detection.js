import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { keep, mod } from '@tensorflow/tfjs'

let requestAnimationId
let detectEnabled = false
var model = null

/**
 * Object detection canvas initialization
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 */
const setupCanvasContainer = (video, canvas) => {
  // video.addEventListener('loadedmetadata', () => { // 監聽此HTML元素上的影像是否加載完成，如果是，執行後方程式【注意：綁定監聽是件必須在事件發生前綁定，否則沒用(意思就是在影片開始撥放錢就要綁訂了)】
  canvas.height = video.videoHeight
  canvas.width = video.videoWidth //不該用offsetWidth，可能會與video影像大小不匹配，導致繪製影像時出現圖片被放大到超級大的狀況
  const ctx = canvas.getContext('2d')
  ctx.lineWidth = 3
  ctx.strokeStyle = '#ffffff'
  ctx.font = '20px sans-serif'
  ctx.fillStyle = '#ff0000'
  // })
}

const startDetection = async () => {
  if (model == null) {
    console.log(`偵測模型下載中`)
    model = await cocoSsd.load({ base: 'mobilenet_v2' })
    console.log(`模型下載完成 =>`, model)
  }
  detectEnabled = true //啟動偵測
  return true
}
const stopDetection = () => {
  detectEnabled = false //關閉偵測
  // model = null
}

/**
 * Load model and started to draw bounding boxes
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 */
const start = async (video, canvas) => {
  // console.log(`偵測模型下載中`)
  // model = await cocoSsd.load({ base: 'mobilenet_v2' })
  // console.log(`模型下載完成`)

  console.log("297*401 \ncanvas寬高= ", canvas.width,
    "\nVideo寬高 = ", video.videoWidth) //Video寬高 和 canvas寬高 需要匹配

  requestAnimationId = window.requestAnimationFrame(
    detectAndUpdate.bind(null, video, canvas)
  )
}

async function detectAndUpdate(video, canvas) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  // ctx.drawImage(video, 0, 0); // 以畫布的(0,0)為起點，繪製video上的影像
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight); // 以畫布的(0,0)為起點，繪製video上的影像
  // 設定canvas畫布的大小為影像的原始大小，繪製也繪製影像的原始大小。當canvas標籤被縮放時，是整個畫布縮放，繪製的圖像會跟著canvas畫布起縮放

  if (detectEnabled && model) {
    const detections = await model.detect(video, 50, 0.3)
    drawBoundingBox(detections, canvas)
  }

  requestAnimationId = window.requestAnimationFrame(
    detectAndUpdate.bind(null, video, canvas)
  )
}

const drawBoundingBox = async (detections, canvas) => {
  // console.log("drawBoundingBox,>> canvas =", canvas)
  const ctx = canvas.getContext('2d')
  // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  detections.forEach((detection) => {
    const { bbox, class: classification, score } = detection
    const [xStartPoint, yStartPoint, width, height] = bbox
    const textPosX = xStartPoint
    const textPosY = yStartPoint - 3
    const scorePosY = yStartPoint + 20
    const scoreFixed = `${(score * 100).toFixed(2)}%`

    ctx.fillText(classification, textPosX, textPosY)
    ctx.fillText(scoreFixed, textPosX, scorePosY)
    ctx.strokeRect(xStartPoint, yStartPoint, width, height) //畫出矩形【顏色寬度等等，是根據先前在setupCanvasContainer中的設置】
  })
}

/**
 * Clean canvas
 * @param {HTMLCanvasElement} canvas
 */
const cleanBoundingBox = (canvas) => {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

const stopCanvasVideo = () => window.cancelAnimationFrame(requestAnimationId)

export default {
  setupCanvasContainer,
  startDetection,
  stopDetection,
  start,
  cleanBoundingBox,
  stopCanvasVideo
}
