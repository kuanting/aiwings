export default {
  setDroneInfo(state, payload) {
    state.drone = payload
  },
  setFlightStatus(state, payload) {
    state.status = payload
  },
  setDestination(state, payload) {
    state.destination = payload
  }
}
