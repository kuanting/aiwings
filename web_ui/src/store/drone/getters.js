export default {
  getDroneInfo(state) {
    return {
      ...state.drone,
      isArmed:
        state.drone.isArmed === '' || state.drone.isArmed === 'null'
          ? ''
          : state.drone.isArmed === '0'
          ? 'DISARM'
          : 'ARM'
    }
  },
  getDroneCoords(state) {
    return [state.drone.longitude, state.drone.latitude]
  },
  getHeading(state) {
    return state.drone.heading
  },
  getAltitude(state) {
    return state.status.altitude
  },
  getTakeoffStatus(state) {
    return state.status.isTakeoff
  },
  getDestination(state) {
    return state.destination
  }
}
