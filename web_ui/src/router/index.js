import { notification } from 'ant-design-vue'
import { computed } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import socket from '../lib/websocket'
import auth from '../services/auth'
import user from '../services/user'
import store from '../store'

// refresh token timer
let intervalTimer
const refreshToken = () => {
  return setInterval(async () => await auth.refreshToken(), 4 * 60000)
}

// Clean state funtion for logout

//FIXEDME： 改成多台後，這邊的狀態清除也要更改
const cleanState = async () => {
  await auth.logout()
  clearInterval(intervalTimer)
  socket.emit('cancel-consume')
  store.dispatch('setRabbitmqIsInit', false)
  store.dispatch('setIsAuth', false)
  store.dispatch('setUserInfo', { email: '', droneId: '', isAdmin: false })
  // store.dispatch('drone/updateFlightStatus', { altitude: 3, isTakeoff: false })
  // store.dispatch('drone/updateDestination', { lng: 0, lat: 0 })
  store.dispatch('drone/setDroneInfo', {
    // timeStamp: '',
    // roll: '',
    // yaw: '',
    // pitch: '',
    // voltage: '',
    // percentage: '',
    // hpop: '',
    // gpsCount: '',
    // mode: '',
    // isArmed: '',
    // heading: '',
    // latitude: '',
    // longitude: '',
    // altitude: '',
    // speed: ''
  })
  store.dispatch('clearLogs')
}

// Page routes list
const routes = [
  {
    path: '/',
    name: 'Introduction',
    component: () => import('../views/Introduction.vue')
  },
  {
    path: '/drone',
    name: 'Drone',
    component: () => import('../views/Drone.vue')
  },
  {
    path: '/records',
    name: 'Records',
    component: () => import('../views/Records.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/Signup.vue')
  },
  {
    path: '/logout',
    name: 'Logout',
    beforeEnter: async () => {
      await cleanState()
      return '/'
    }
  },
  {
    path: '/enroll',
    name: 'Enroll',
    component: () => import('../views/Enroll.vue')
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('../views/Account.vue')
  },
  {
    path: '/management',
    name: 'Management',
    component: () => import('../views/Management.vue')
  },
  {
    path: '/monitor',
    name: 'Monitor',
    component: () => import('../views/Monitor.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

/**
 * Router guard
 */
const whiteListRoute = ['/signup']
const isAuth = computed(() => store.getters.getIsAuth)

/* 切換路由時執行 */
router.beforeEach(async (to) => {
  console.log(
    '----Router/index.js----\n即將前往 to.path = ',
    to.path,
    '\n身分驗證IsAuth.value = ',
    isAuth.value
  )

  // 如果即將進入['/signup']，則回傳true結束，正常進入導向的頁面
  if (whiteListRoute.includes(to.path)) {
    return true
  }

  // 如果進入的是名為'NotFound'的路由(第104行所定義)，進入後，停頓5秒後倒向首頁
  if (to.name === 'NotFound') {
    setTimeout(() => router.push({ path: '/' }), 5000)
  }

  // 如果即將進入'/login'，
  // if isAuth.value 不為空(true)，直接導向'/drone'
  // if isAuth.value 為空(false)，等待獲取 user.getUserInfo()後，再導向'/drone'，如果不能獲取UserInfo，表示用戶未登入，回傳true結束【正常進入'/login'畫面】
  if (to.path === '/login') {
    if (isAuth.value) return '/drone'
    if (!isAuth.value) {
      console.log('嘗試抓取身分資料 (getUserInfo)')
      try {
        await user.getUserInfo()
        console.log('抓取成功')
        return '/drone'
      } catch (error) {
        console.log('抓取失敗，前往登入頁面')
        return true
      }
    }
  }

  // 其他路由中，如果isAuth.value為false 【身分驗證未通過】
  // 如果即將進入首頁，不需任何動作直接跳轉
  // 如果不是首頁，嘗試抓取userInfo，有抓到資料則可以前往，沒抓到的畫改前往'/login'
  if (!isAuth.value) {
    if (to.path === '/') return true
    console.log('嘗試抓取身分資料 (getUserInfo)')
    try {
      const { data } = await user.getUserInfo()
      store.dispatch('setIsAuth', true)
      store.dispatch('setUserInfo', data)
      intervalTimer = refreshToken()
      console.log('抓取成功')
      return true
    } catch (error) {
      //情況：ex：為登入狀態下想直接跳轉到應用子頁面，會跳出警示並導到/login頁面
      console.log('抓取失敗，前往登入頁面')
      notification.error({
        message: error.response.data.msg
      })
      return '/login'
    }
  }

  return true
})

export default router
