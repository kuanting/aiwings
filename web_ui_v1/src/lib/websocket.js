import { io } from 'socket.io-client'

const SOCKET_DOMAIN =
  process.env.NODE_ENV === 'production'
    ? 'https://ai-wings.ga:30110'
    : `${process.env.VUE_APP_BACKEND_SERVICE_PROTOCOL}://${process.env.VUE_APP_BACKEND_SERVICE_SERVICE_HOST}:${process.env.VUE_APP_BACKEND_SERVICE_SERVICE_PORT}`

const socket = io(SOCKET_DOMAIN)
export default socket
