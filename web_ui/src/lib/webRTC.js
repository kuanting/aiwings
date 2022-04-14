/**
 * @returns {RTCPeerConnection}
 */
export const createPeerConnection = () => {
  return new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  })
}

/**
 * @param {RTCPeerConnection} pc
 * @returns {Promise<RTCSessionDescriptionInit>} answer
 */
export const createAnswerAndSetLocalSDP = async (pc) => {
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  return answer
}

export const createOfferAndSetLocalSDP = async (pc) => {
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  return offer
}

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
