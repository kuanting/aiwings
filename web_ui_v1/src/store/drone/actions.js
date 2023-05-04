export default {
  setDroneInfo({ commit }, payload) {
    commit('setDroneInfo', payload)
  },
  updateFlightStatus({ commit }, payload) {
    commit('setFlightStatus', payload)
  },
  updateDestination({ commit }, payload) {
    commit('setDestination', payload)
  }
}
