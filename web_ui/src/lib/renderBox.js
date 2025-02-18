import labels from './labels.json'

/**
 * Render prediction boxes
 * @param {HTMLCanvasElement} canvasRef canvas tag reference
 * @param {Array} boxes_data boxes array
 * @param {Array} scores_data scores array
 * @param {Array} classes_data class array
 * @param {Array[Number]} ratios boxes ratio [xRatio, yRatio]
 */
export const renderBoxes = (
  source,
  canvasRef,
  boxes_data,
  scores_data,
  classes_data,
  ratios
) => {
  // console.log("renderBoxes")
  const ctx = canvasRef.getContext('2d')
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) // clean canvas
  // ctx.drawImage(source, 0, 0, ctx.canvas.width, ctx.canvas.height)

  // 因為模型的輸入張量為[1, 640, 640, 3]，所以設定canvas畫布的初始大小為 640 x 640
  // 偵測結果將繪製到 640 x 640 的畫布，然後畫布再縮放延展成 canvasRef 的大小
  ctx.canvas.height = 640
  ctx.canvas.width = 640

  // console.log("ratios =",ratios)

  const colors = new Colors()

  // font configs
  const font = `${Math.max(
    Math.round(Math.max(ctx.canvas.width, ctx.canvas.height) / 40),
    14
  )}px Arial`
  ctx.font = font
  ctx.textBaseline = 'top'

  for (let i = 0; i < scores_data.length; ++i) {
    // filter based on class threshold
    const klass = labels[classes_data[i]]
    const color = colors.get(classes_data[i])
    const score = (scores_data[i] * 100).toFixed(1)

    let [y1, x1, y2, x2] = boxes_data.slice(i * 4, (i + 1) * 4)
    x1 *= ratios[0]
    x2 *= ratios[0]
    y1 *= ratios[1]
    y2 *= ratios[1]
    const width = x2 - x1
    const height = y2 - y1
    // console.log("x1, y1, width, height, klass  = ",x1, y1, width, height, klass)

    // draw box.
    ctx.fillStyle = Colors.hexToRgba(color, 0.2)
    ctx.fillRect(x1, y1, width, height)

    // draw border box.
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(
      Math.min(ctx.canvas.width, ctx.canvas.height) / 220,
      2.5
    )
    ctx.strokeRect(x1, y1, width, height)

    // Draw the label background.
    ctx.fillStyle = color
    const textWidth = ctx.measureText(klass + ' - ' + score + '%').width
    const textHeight = parseInt(font, 10) // base 10
    const yText = y1 - (textHeight + ctx.lineWidth)
    ctx.fillRect(
      x1 - 1,
      yText < 0 ? 0 : yText, // handle overflow label box
      textWidth + ctx.lineWidth,
      textHeight + ctx.lineWidth
    )

    // Draw labels
    ctx.fillStyle = '#ffffff'
    ctx.fillText(klass + ' - ' + score + '%', x1 - 1, yText < 0 ? 0 : yText)
  }
}

class Colors {
  // ultralytics color palette https://ultralytics.com/
  constructor() {
    this.palette = [
      '#FF3838',
      '#FF9D97',
      '#FF701F',
      '#FFB21D',
      '#CFD231',
      '#48F90A',
      '#92CC17',
      '#3DDB86',
      '#1A9334',
      '#00D4BB',
      '#2C99A8',
      '#00C2FF',
      '#344593',
      '#6473FF',
      '#0018EC',
      '#8438FF',
      '#520085',
      '#CB38FF',
      '#FF95C8',
      '#FF37C7'
    ]
    this.n = this.palette.length
  }

  get(i) {
    return this.palette[Math.floor(i) % this.n]
  }

  static hexToRgba(hex, alpha) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? `rgba(${[
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ].join(', ')}, ${alpha})`
      : null
  }
}
