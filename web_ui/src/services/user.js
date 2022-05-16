/**
 * Auth APIs
 *
 * - User info
 * - Edit drone ID
 */
import axios from '../lib/axios'

export default {
  async getUserInfo() {
    return await axios.get('/user/me')
  },
  async editUserDroneId(droneId) {
    return await axios.post('/user/droneId', droneId)
  }
}
