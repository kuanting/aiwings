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

  // Add new drones
  async enrollDroneId(droneId) {
    return await axios.put('/user/drones', {
      droneId: droneId
    })
  },

  // Update a drone ID
  async editUserDroneId(originDroneId, droneId) {
    // PUT：需要更新資源的全部內容時【因為目前droneID名稱就是全部了，所以先採用PUT】
    // PATCH：只需要更新資源的一部分時
    return await axios.put(`/user/drones/${originDroneId}`, {
      droneId: droneId
    })
  },

  // Delete a drone ID
  async deleteDroneId(droneId) {
    return await axios.delete(`/user/drones/${droneId}`)
  },

  // Save video screenshots of front-end users to the back-end
  async saveDroneVideoBlob(formData) {
    return await axios.post(
      '/user/upload/images',
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
  },

  // 分段上傳(還在測試)
  // async testSaveVideo(formData) {
  //   return await axios.post(
  //     '/user/test', 
  //     formData,
  //     {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     }
  //   )
  // }
}
