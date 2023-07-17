/**
 * Drone record APIs
 *
 * - Save flight record
 * - Get flight records
 * - Get specific flight mission record
 */
import axios from '../lib/axios'

export default {
  /**
   * @param {Array} records
   */
  async saveFlightRecords(records) {
    return await axios.post('/drone/records', { records })
  },
  async getFlightRecords() {
    return await axios.get('/drone/records')
  },
  /**
   * @param {string} id
   */
  async getFlightRecord(id) {
    return await axios.get(`/drone/records/${id}`)
  }
}
