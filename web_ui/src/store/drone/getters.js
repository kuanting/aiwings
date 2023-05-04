export default {
  //這邊都要傳droneID進來，才可以選擇要用哪一個drone 的資訊
  //droneID可以用array or object
  //但不管是array or object因為都不確定是有幾個id傳進來，所以要用迴圈
  // getDroneInfo(state, droneId) {
  //   return {
  //     ...state.drone[droneId],
  //     isArmed:
  //       state.drone[droneId].isArmed === '' || state.drone[droneId].isArmed === 'null'
  //         ? ''
  //         : state.drone[droneId].isArmed === '0'
  //         ? 'DISARM'
  //         : 'ARM'
  //   }
  // },

  //origin
  getDroneInfo(state) {
    return {
      ...state.drone,

      //改成在 drone["id"].isArmed 做操作
      
      // isArmed:
      //   state.drone.isArmed === '' || state.drone.isArmed === 'null'
      //     ? ''
      //     : state.drone.isArmed === '0'
      //     ? 'DISARM'
      //     : 'ARM'
    }
  },

  //特定drone的INFO
  getSpecificDroneInfo(state){
    return function(droneID){
      return state.drone[droneID]
    }
  },

  //origin
  getDroneCoords(state) {
    return [state.drone.longitude, state.drone.latitude]
  },

  getHeading(state) {
    return state.drone.heading
  },
  getAltitude(state) {
    //state.drone["droneID"].status.altitudeㄌ
    // return state.status.altitude
    return function(droneID){
      return state.drone[droneID].status.altitude
    }
  },
  //origin
  // getTakeoffStatus(state) {
  //   //state.drone["droneID"].status.isTakeoff
  //   return state.status.isTakeoff
  // },

  getTakeoffStatus(state) {
    //state.drone["droneID"].status.isTakeoff
    // return state.status.isTakeoff
    return function(droneId){
      return state.drone[droneId].status.isTakeoff
    }
  },

  getDestination(state) {
    //state.drone["droneID"].status.isTakeoff
    // return state.destination
    return function(droneID){
      return state.drone[droneID].destination
    }
  }
}
