import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

let requestAnimationId

/**
 * Object detection canvas initialization
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 */
const setupCanvasContainer = (video, canvas) => {
  video.addEventListener('loadedmetadata', () => {
    canvas.height = video.offsetHeight
    canvas.width = video.offsetWidth
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 3
    ctx.strokeStyle = '#ff0000'
    ctx.font = '20px sans-serif'
    ctx.fillStyle = '#ff0000'
  })
}

/**
 * Load model and started to draw bounding boxes
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 */
const start = async (video, canvas) => {
  const model = await cocoSsd.load({ base: 'mobilenet_v2' })
  requestAnimationId = window.requestAnimationFrame(
    detectAndUpdate.bind(null, model, video, canvas)
  )
}

async function detectAndUpdate(model, video, canvas) {
  const detections = await model.detect(video, 50, 0.3)
  drawBoundingBox(detections, canvas)
  requestAnimationId = window.requestAnimationFrame(
    detectAndUpdate.bind(null, model, video, canvas)
  )
}

const drawBoundingBox = async (detections, canvas) => {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  detections.forEach((detection) => {
    const { bbox, class: classification, score } = detection
    const [xStartPoint, yStartPoint, width, height] = bbox
    const textPosX = xStartPoint
    const textPosY = yStartPoint - 3
    const scorePosY = yStartPoint + 20
    const scoreFixed = `${(score * 100).toFixed(2)}%`

    ctx.fillText(classification, textPosX, textPosY)
    ctx.fillText(scoreFixed, textPosX, scorePosY)
    ctx.strokeRect(xStartPoint, yStartPoint, width, height)
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
