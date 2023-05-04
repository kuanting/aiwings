/**
 * Entry point
 *
 * - Mount third-party UI component
 * - Register vue-router, vuex
 */
import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import 'ant-design-vue/dist/antd.css'
import {
  Button,
  Menu,
  Spin,
  Tabs,
  Switch,
  Row,
  Col,
  InputNumber,
  Radio,
  Slider,
  Popconfirm,
  Form,
  Input,
  Result,
  Divider,
  Tooltip,
  Select,
  Popover
} from 'ant-design-vue'

createApp(App)
  .use(Button)
  .use(Menu)
  .use(Spin)
  .use(Tabs)
  .use(Switch)
  .use(Row)
  .use(Col)
  .use(InputNumber)
  .use(Radio)
  .use(Slider)
  .use(Popconfirm)
  .use(Form)
  .use(Input)
  .use(Result)
  .use(Divider)
  .use(Tooltip)
  .use(store)
  .use(router)
  .use(Select)
  .use(Popover)
  .mount('#app')


