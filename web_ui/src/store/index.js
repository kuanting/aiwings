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
    },
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
    },
    // addNewDroneId({ commit }, payload) {
    //   commit('addNewDroneID', payload)
    // }
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
    setUserDroneID(state, payload){
      state.user.droneId = payload
    },
    setMapboxInfo(state, payload){
      state.mapbox = payload
    },
    addNewDroneID(state,payload){
      // console.log("原state.user.droneId=",state.user.droneId)
      console.log("payload=",payload) // ct
      const droneID = state.user.droneId
      for(var i=0; i<droneID.length; i++){
        if(droneID[i].id == payload) return //發現已存在此id，退出addNewDroneID函式
      }
      droneID.push({id:payload})
      // console.log("後state.user.droneId=",state.user.droneId)
    },
    deleteDroneID(state,payload){
      ///刪除陣列中的指定ID
      const droneID = state.user.droneId
      console.log("payload = ",payload)

      // 另一個成功法
      const temp = droneID.filter((item) => item.id != payload.id );
      for(var i=0; i<temp.length ;i++){
        droneID[i] = temp[i]
      }
      droneID.pop() //移除多的
      console.log(">> 刪後 droneID = ",droneID)

      // // 另一個成功法
      // var ID = droneID.pop() 
      // const temp = []
      // while(ID.id != payload.id){
      //   temp.push(ID)
      //   ID = droneID.pop()
      // }
      // while(temp[0] != null){ //不能 temp != [] 或 temp != null
      //   droneID.push(temp.pop())
      // }
      // console.log(">> 刪後 droneID = ",droneID)
    
      
      // delete droneID[payload] // 是成功刪除了，但v-for沒辦法執行，因為缺了一塊？此處變成undefind沒辦法取得 .id 的值
      // //split無法使用因為不是單純陣列(有key的複合陣列無法用split)
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
    },
    getUserDroneIdNames(state){
      return state.user.droneId.map(item => item.id);
      // return state.user.droneId.filter(item => item.id);
      // return state.user.droneId.filter(item => ({ id: item.id }));
    }
  },
  modules: {
    // Dedicate modules for drone-related
    drone
  }
})
