import { createStore } from 'vuex'
import drone from './drone'

// Global states
export default createStore({
  state: {
    logs: [],
    isAuthenticated: false,
    rabbitmqIsInit: false,
    rabbitmqAdminIsInit: false,
    user: {
      email: '',
      droneId: '',
      isAdmin: false
    }
  },
  actions: {
    setLogs({ commit }, payload) {
      commit('setLogs', {
        id: Date.now(),
        timeStamp: new Date().toLocaleString(),
        payload
      })
    },
    clearLogs({ commit }) {
      commit('clearLogs')
    },
    setUserInfo({ commit }, payload) {
      commit('setUserInfo', payload)
    },
    setIsAuth({ commit }, payload) {
      commit('setIsAuth', payload)
    },
    setRabbitmqIsInit({ commit }, payload) {
      commit('setRabbitmqIsInit', payload)
    },
    setRabbitmqAdminIsInit({ commit }, payload) {
      commit('setRabbitmqAdminIsInit', payload)
    }
  },
  mutations: {
    setLogs(state, payload) {
      state.logs.unshift(payload)
    },
    clearLogs(state) {
      state.logs = []
    },
    setUserInfo(state, payload) {
      state.user = payload
    },
    setIsAuth(state, payload) {
      state.isAuthenticated = payload
    },
    setRabbitmqIsInit(state, payload) {
      state.rabbitmqIsInit = payload
    },
    setRabbitmqAdminIsInit(state, payload) {
      state.rabbitmqAdminIsInit = payload
    }
  },
  getters: {
    getLogs(state) {
      return state.logs
    },
    getUserInfo(state) {
      return state.user
    },
    getUsername(state) {
      return state.user.email.substr(0, state.user.email.indexOf('@'))
    },
    getIsAuth(state) {
      return state.isAuthenticated
    },
    getIsAdmin(state) {
      return state.user.isAdmin
    },
    getRabbitmqIsInit(state) {
      return state.rabbitmqIsInit
    },
    getRabbitmqAdminIsInit(state) {
      return state.rabbitmqAdminIsInit
    }
  },
  modules: {
    // Dedicate modules for drone-related
    drone
  }
})
