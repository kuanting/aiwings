/**
 * Auth APIs
 *
 * - User info
 * - Edit drone ID
 * - Enroll Drones
 */

import axios from '../lib/axios'

export default {
  async getUserInfo() {
    return await axios.get('/user/me')
  },
  //Fixed API endpoint
  async editUserDroneId(droneId) {
    return await axios.post('/user/droneId', droneId)
  },
  
  //New add
  async enrollDroneId(droneId) {
    return await axios.post('/user/drones', droneId)
  },
}
