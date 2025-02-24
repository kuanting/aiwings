import { reactive } from 'vue'

/***************** 引入 TensorFlow.js 函式庫 和 TensorFlow.js 的後端 *******************/
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgpu' // if chrome version 113 above you can use webgpu
import '@tensorflow/tfjs-backend-webgl'
// tfjs-node需要 AVX 處理器，並且 tfjs-node 函式庫使用 AVX 指令來提高其操作效能。如果你的CPU不支援AVX，你將無法使用tfjs-node。
// import tf from'@tensorflow/tfjs-node'

/******************* cocoSSD model *******************/
import * as cocoSsd from '@tensorflow-models/coco-ssd'
let cocoSsd_model
/******************* yolov8n model *******************/
// Note：網頁加載的根路徑在 vue 專案中的 'public/' 底下，所以http://localhost/model/yolov8n_web_model/model.json，此model/yolov8n_web_model位於public資料夾底下，tf.loadGraphModel(model_URL);可以直接使用相對路徑來獲取
const model_URL = `model/yolov8n_web_model/model.json`

const yolov8n_model = reactive({
  net: null,
  inputShape: [1, 0, 0, 3]
})

let isUsingCocoSsd = false // true => 用cocoSsd進行物件偵測
let detectEnabled = false

/**
 * Load model and started to detect
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 */
const startDetection = async (Frame, canvas, isCocoSsd) => {
  isUsingCocoSsd = isCocoSsd
  // 如果 isUsingCocoSsd = true ，下載cocoSsd model，否則下載yolov8n_model
  if (isUsingCocoSsd && cocoSsd_model == null) {
    console.log('------ cocoSsd model loading------')
    await tf.ready()
    cocoSsd_model = await cocoSsd.load({ base: 'mobilenet_v2' })
    console.log('--------- loading finish ---------')
  } else if (yolov8n_model.net == null) {
    await loadYolov8nModel(model_URL)
  }

  detectEnabled = true // 允許偵測
  detectVideo(Frame, yolov8n_model, canvas)
}

/**
 * stop detect video
 */
const stopDetection = () => {
  detectEnabled = false // 關閉偵測
}

/**
 * Function to detect video from every source.
 * @param {HTMLVideoElement} vidSource video source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 */
export const detectVideo = (vidSource, model, canvasRef) => {
  /* detectFrame(): Function to detect every frame from video  */
  const detectFrame = async () => {
    // WebRTC：vidSource.srcObject === null
    if (detectEnabled && vidSource.srcObject != null) {
      // 如果 isUsingCocoSsd = true ，用cocoSsd model進行偵測，否則用yolov8n_model
      if (isUsingCocoSsd) {
        detectByCocoSsd(vidSource, canvasRef)
      } else {
        await detect(vidSource, model, canvasRef)
      }

      requestAnimationFrame(detectFrame) // get another frame
    } else {
      // stop detect and clean canvas
      const ctx = canvasRef.getContext('2d')
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }
  }

  detectFrame() // initialize to detect every frame
}

// ---------------------------------------------------

import { renderBoxes } from './renderBox'
import labels from './labels.json'
const numClass = labels.length

/**
 * Preprocess image / frame before forwarded into the model
 * @param {HTMLVideoElement|HTMLImageElement} source
 * @param {Number} modelWidth
 * @param {Number} modelHeight
 * @returns input tensor, xRatio and yRatio
 */
const preprocess = (source, modelWidth, modelHeight) => {
  let xRatio, yRatio // ratios for boxes

  const input = tf.tidy(() => {
    const img = tf.browser.fromPixels(source)

    // padding image to square => [n, m] to [n, n], n > m
    const [h, w] = img.shape.slice(0, 2) // get source width and height
    const maxSize = Math.max(w, h) // get max size // 取得最長的那一邊的大小
    const imgPadded = img.pad([
      // 對圖像進行零元素填充，將圖片調整為正方形的尺寸
      [0, maxSize - h], // padding y [bottom only]  // 對底部填充 (maxSize - h) 個像素的零元素
      [0, maxSize - w], // padding x [right only]   // 對右側填充 (maxSize - h) 個像素的零元素
      [0, 0]
    ])

    xRatio = maxSize / w // update xRatio
    yRatio = maxSize / h // update yRatio
    // 紀錄圖片調整為正方形的尺寸後，邊長的縮放率【原本*Ratio = 變更的邊長】

    // console.log("tf.image.resizeBilinear(imgPadded, [modelWidth, modelHeight]) = ",tf.image
    // .resizeBilinear(imgPadded, [modelWidth, modelHeight]))

    return tf.image
      .resizeBilinear(imgPadded, [modelWidth, modelHeight]) // resize frame // 將已調整為正方形的圖片，用tf提供的Bilinear方法，縮放為模型的輸入尺寸
      .div(255.0) // normalize // 歸一化：將圖片的像素值除以255.0，使像素值縮放到 0 到 1 之間
      .expandDims(0) // add batch // 因為模型的輸入張量為[1,640,640,3]，原本的圖片只有[640,640,3]，所以需要再用expandDims為圖片新增一個新的維度--

    // 經過上述變動，將圖片轉換為模型的疏誤張量：[1, modelHeight, modelWidth, 3]
  })

  return [input, xRatio, yRatio]
}

/**
 * Function run inference and do detection from source.
 * @param {HTMLImageElement|HTMLVideoElement} source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 */
export const detect = async (source, model, canvasRef) => {
  // console.log("yolov8n_model input image shape = ",model.inputShape)
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3) // get model width and height

  tf.engine().startScope() // start scoping tf engine
  const [input, xRatio, yRatio] = preprocess(source, modelWidth, modelHeight) // preprocess image

  const res = model.net.execute(input) // inference model
  const transRes = res.transpose([0, 2, 1]) // transpose result [b, det, n] => [b, n, det]
  // console.log("res = ",res.shape) // [1, 84, 8400]
  // console.log("transRes = ",transRes.shape) // [1, 8400, 84]

  /* 取出所有偵測結果的 boxes [y1, x1, y2, x2] */
  const boxes = tf.tidy(() => {
    const w = transRes.slice([0, 0, 2], [-1, -1, 1]) // get width
    const h = transRes.slice([0, 0, 3], [-1, -1, 1]) // get height
    const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2)) // x1
    const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2)) // y1
    return tf
      .concat(
        //  EX：tf.concat([t1, t2], 0) 將 t1、t2 在維度(axis) 為 0 的地方進行銜接
        [
          y1,
          x1,
          tf.add(y1, h), //y2
          tf.add(x1, w) //x2
        ],
        2
      )
      .squeeze() // 去掉(省略)單維度
  }) // process boxes [y1, x1, y2, x2]

  /* 取出所有偵測結果的分數和類別 */
  const [scores, classes] = tf.tidy(() => {
    // class scores
    const rawScores = transRes.slice([0, 0, 4], [-1, -1, numClass]).squeeze(0) // #6 only squeeze axis 0 to handle only 1 class models
    return [rawScores.max(1), rawScores.argMax(1)]
  }) // get max scores and classes index

  /* NMS方法選擇具有最高置信度的目標框 */
  // tf.image.nonMaxSuppressionAsync(boxes, scores, maxOutputSize, iouThreshold?, scoreThreshold?)
  // maxOutputSize：最終保留的偵測結果的最大數量
  // iouThreshold?：框與框之間的IOU(相交程度)大於多少會視為相同物件【預設0.5】，從中選出分數最高者
  // scoreThreshold?：分數低於多少會被過濾掉，不列入考慮
  const nms = await tf.image.nonMaxSuppressionAsync(
    boxes,
    scores,
    500,
    0.45,
    0.2
  ) // NMS to filter boxes

  /* 只取出NMS方法過濾出來的目標框 的boxes、 scores、classes */
  const boxes_data = boxes.gather(nms, 0).dataSync() // indexing boxes by nms index
  const scores_data = scores.gather(nms, 0).dataSync() // indexing scores by nms index
  const classes_data = classes.gather(nms, 0).dataSync() // indexing classes by nms index

  /* 畫出偵測結果 */
  renderBoxes(source, canvasRef, boxes_data, scores_data, classes_data, [
    xRatio,
    yRatio
  ]) // render boxes

  /* clear memory */
  tf.dispose([res, transRes, boxes, scores, classes, nms])

  tf.engine().endScope() // end of scoping
}

// ---------------------------------------------------------------

/**
 * 下載 TensorFlow SavedModel 格式的偵測模型
 */
const loadYolov8nModel = async (model_URL) => {
  try {
    console.log(`偵測模型下載中`)
    // load model
    await tf.ready()
    const model = await tf.loadGraphModel(model_URL)
    // Note：加載的根路徑在 vue 專案中的 'public/' 底下
    // loadLayersModel模式不適用於 TensorFlow SavedModel或其轉換形式。對於這些模型，請使用tf.loadGraphModel()。

    // warming up model
    const dummyInput = tf.ones(model.inputs[0].shape)
    const warmupResults = model.execute(dummyInput)

    // console.log("此模型的輸入張量 yolov8.inputs[0].shape = ", model.inputs[0].shape)
    yolov8n_model.net = Object.freeze(model)
    yolov8n_model.inputShape = model.inputs[0].shape

    // cleanup memory
    tf.dispose([warmupResults, dummyInput])

    console.log('模型加載成功: ', Object.freeze(model))
  } catch (error) {
    console.error(`模型加载失败: ${error}`)
  }
}

export default {
  startDetection,
  stopDetection
}

const detectByCocoSsd = async (vidSource, canvasRef) => {
  // cocoSsd 如果用webgpu會跳warning，但還是可以偵測的樣子
  const ctx = canvasRef.getContext('2d')
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  ctx.canvas.height = vidSource.videoHeight
  ctx.canvas.width = vidSource.videoWidth
  // 設定canvas畫布的大小為影像的原始大小，繪製也繪製影像的原始大小。當canvas標籤被縮放時，是整個畫布縮放，繪製的圖像會跟著canvas畫布起縮放

  const detections = await cocoSsd_model.detect(vidSource, 50, 0.3)
  drawBoundingBox(detections, canvasRef)
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
