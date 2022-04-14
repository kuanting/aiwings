import axios from '../lib/axios'

export default {
  async signup(payload) {
    return await axios.post('/auth/signup', payload)
  },
  async login(payload) {
    return await axios.post('/auth/login', payload)
  },
  async refreshToken() {
    await axios.get('/auth/token')
  },
  async logout() {
    await axios.post('/auth/logout')
  }
}
