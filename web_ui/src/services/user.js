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
     return await axios.post('/user/edit_droneId', droneId)
   },
   
   //New add
   async enrollDroneId(droneId) {
     return await axios.post('/user/add_drones', droneId)
   },
 
   //delete ID
   async deleteDroneId(droneId) {
     return await axios.post('/user/delete_drones', droneId)
   },

   // Save video screenshots of front-end users to the back-end
  async saveDroneVideoBlob(formData) {
    return await axios.post(
      '/user/saveDroneVideoBlob', 
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
 