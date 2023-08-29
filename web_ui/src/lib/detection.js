import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { keep } from '@tensorflow/tfjs'

let requestAnimationId

/**
 * Object detection canvas initialization
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 */
const setupCanvasContainer = (video, canvas) => {
  video.addEventListener('loadedmetadata', () => { // 監聽此HTML元素上的影像是否加載完成，如果是，執行後方程式
    canvas.height = video.offsetHeight
    canvas.width = video.offsetWidth
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 3
    ctx.strokeStyle = '#ffffff'
    ctx.font = '20px sans-serif'
    ctx.fillStyle = '#ff00ff'
  })
}

/**
 * Load model and started to draw bounding boxes
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 */
const start = async (video, canvas) => {
  console.log(`偵測模型下載中`)
  const model = await cocoSsd.load({ base: 'mobilenet_v2' })
  console.log(`模型下載完成`)

  console.log("297*401 \ncanvas寬高= ", canvas.width,
    "\nVideo寬高 = ", video.width, video.offsetWidth, video.videoWidth, video.naturalWidth) //Video寬高 =  0 640
    
  requestAnimationId = window.requestAnimationFrame(
    detectAndUpdate.bind(null, model, video, canvas)
  )
}

async function detectAndUpdate(model, video, canvas) {
  // console.log("detectAndUpdate>>>Video寬 = ", video.width, video.videoWidth)
  const detections = await model.detect(video, 50, 0.3)

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.drawImage(video, 0, 0); // 以畫布的(0,0)為起點，繪製video上的影像


  drawBoundingBox(detections, canvas)
  requestAnimationId = window.requestAnimationFrame(
    detectAndUpdate.bind(null, model, video, canvas)
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

const stopDetection = () => window.cancelAnimationFrame(requestAnimationId)

export default {
  setupCanvasContainer,
  start,
  cleanBoundingBox,
  stopDetection
}
