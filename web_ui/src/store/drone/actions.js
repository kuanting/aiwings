export default {
  //origin

  // setDroneInfo({ commit }, payload) {
  //   console.log("payload in droneInfo: ", payload)
  //   commit('setDroneInfo', payload)
  // },

  //change

  setDroneInfo({ commit }, payload) {
    // console.log("payload in droneInfo: ", payload)
    commit('setDroneInfo', payload)
  },

  updateFlightStatus({ commit }, payload) {
    commit('setFlightStatus', payload)
  },
  
  //原始
  updateDestination({ commit }, payload) {
    commit('setDestination', payload)
  }
  

}
