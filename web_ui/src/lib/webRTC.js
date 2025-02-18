/**
 * Initial peer connection instance
 * @returns {RTCPeerConnection}
 */
export const createPeerConnection = () => {
  return new RTCPeerConnection({
    // iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302' //// google提供的免費的地址
      },
      {
        urls: 'turn:relay1.expressturn.com:3478', //STUN or TURN URI
        username: 'efJOQ1TXPNAJYW2V54', //TURN username
        credential: 'BQ8uDasm0AkaePjZ' //TURN password
      }
    ]
  })
}

/**
 * Callee create answer and set as local SDP
 * @param {RTCPeerConnection} pc
 * @returns {Promise<RTCSessionDescriptionInit>} answer
 */
export const createAnswerAndSetLocalSDP = async (pc) => {
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  return answer
}

/**
 * Caller create offer and set as local SDP
 * @param {RTCPeerConnection} pc
 * @returns {Promise<RTCSessionDescriptionInit>} offer
 */
export const createOfferAndSetLocalSDP = async (pc) => {
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  return offer
}

/**
 * Get media stream
 * @returns {Promise<MediaStream>}
 */
export const getLocalStream = () => {
  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: ['user', 'environment'] },
      height: 640,
      width: 480
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  })
}
