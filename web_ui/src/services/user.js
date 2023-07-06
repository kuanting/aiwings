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
 }
 