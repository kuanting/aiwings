import { createStore } from 'vuex'
import drone from './drone'

// Global states
// 保存 APP 中資料狀態的地方，一個 APP 只會有一個 Store
export default createStore({
  // 被 Store 所管理的單一狀態值
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

  // 負責真正改變 State 的資料，屬於同步更新
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
    },
    setUserDroneID(state, payload) {
      state.user.droneId = payload
    },
    setMapboxInfo(state, payload) {
      state.mapbox = payload
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
      // substr 已棄用
      // return state.user.email ? state.user.email.substring(0, state.user.email.indexOf('@')) :'null'
      return state.user.email.substring(0, state.user.email.indexOf('@'))
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
    },
    getUserDroneIdNames(state) {
      return state.user.droneId.map((item) => item.id)
    }
  },
  modules: {
    // Dedicate modules for drone-related
    drone
  }
})
