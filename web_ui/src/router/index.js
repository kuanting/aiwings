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
const cleanState = async () => {
  await auth.logout()
  clearInterval(intervalTimer)
  socket.emit('cancel-consume')
  store.dispatch('setRabbitmqIsInit', false)
  store.dispatch('setIsAuth', false)
  store.dispatch('setUserInfo', { email: '', droneId: '', isAdmin: false })
  store.dispatch('drone/updateFlightStatus', { altitude: 3, isTakeoff: false })
  store.dispatch('drone/updateDestination', { lng: 0, lat: 0 })
  store.dispatch('drone/setDroneInfo', {
    timeStamp: '',
    roll: '',
    yaw: '',
    pitch: '',
    voltage: '',
    percentage: '',
    hpop: '',
    gpsCount: '',
    mode: '',
    isArmed: '',
    heading: '',
    latitude: '',
    longitude: '',
    altitude: '',
    speed: ''
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
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

/**
 * Router guard
 */
const whiteListRoute = ['/signup']
const isAuth = computed(() => store.getters.getIsAuth)

router.beforeEach(async (to) => {
  if (whiteListRoute.includes(to.path)) {
    return true
  }

  if (to.name === 'NotFound') {
    setTimeout(() => router.push({ path: '/' }), 5000)
  }

  if (to.path === '/login') {
    if (isAuth.value) return '/drone'
    if (!isAuth.value) {
      try {
        await user.getUserInfo()
        return '/drone'
      } catch (error) {
        return true
      }
    }
  }

  if (!isAuth.value) {
    if (to.path === '/') return true
    try {
      const { data } = await user.getUserInfo()
      store.dispatch('setIsAuth', true)
      store.dispatch('setUserInfo', data)
      intervalTimer = refreshToken()
      return true
    } catch (error) {
      notification.error({
        message: error.response.data.msg
      })
      return '/login'
    }
  }

  return true
})

export default router
