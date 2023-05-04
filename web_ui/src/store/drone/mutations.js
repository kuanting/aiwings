export default {
  //origin
  // setDroneInfo(state, payload) {
  //   state.drone = payload
  // },

  //change
  setDroneInfo(state, payload) {
    let data = Object.assign({},state.drone, payload);
    state.drone = data
  },



  setFlightStatus(state, payload) {
    state.drone[payload.droneID].status = payload.status
  },
  setDestination(state, payload) {
    // droneid = payload.droneID
    state.drone[payload.droneID].destination = {"lng":payload.lng, "lat":payload.lat}
  },
  // new added
  // setDrone(state, payload) {
  //   state.newAdd = payload
  // },
}
