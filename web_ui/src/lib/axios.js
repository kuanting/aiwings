import axios from 'axios'
import { notification } from 'ant-design-vue'

axios.defaults.baseURL =
  import.meta.env.NODE_ENV === 'production'
    ? 'https://ai-wings.ga:30110/api/v1'
    : `${import.meta.env.VITE_APP_BACKEND_SERVICE_PROTOCOL}://${import.meta.env.VITE_APP_BACKEND_SERVICE_SERVICE_HOST}:${import.meta.env.VITE_APP_BACKEND_SERVICE_SERVICE_PORT}/api/v1`
axios.defaults.withCredentials = true

axios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response.status === 500) {
      notification.error({
        message: 'Error',
        description: error.response.data.msg,
        duration: 0
      })
      return
    }

    return Promise.reject(error)
  }
)

export default axios
