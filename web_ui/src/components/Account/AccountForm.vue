<template>
  <div class="content__wrapper">
    <h1>Account Setting</h1>
    <a-divider />
    <Enroll />
    <a-input
      v-model:value="userInfo.email"
      class="content__input"
      size="large"
      addon-before="E-mail"
      :disabled="true"
      type="email"
    />
    <!-- 顯示所有droneID的編輯組件 -->
    <div v-for="(drone,index) in userDroneIdNames" :key="drone" class="droneId__wrapper">
      <DroneIdEditor :droneId="drone"/>
    </div>
  </div>

  

</template>

<script>
import { reactive, ref } from '@vue/reactivity'
import { useStore } from 'vuex'
import { computed, nextTick, watch } from '@vue/runtime-core'
import socket from '../../lib/websocket'
import user from '../../services/user'
import Button from '../UI/Button.vue'
import { notification } from 'ant-design-vue'

import Enroll from '../Enroll_drones/Enroll.vue'
import DroneIdEditor from './DroneIdEditor.vue'

export default {
  name: 'AccountForm',
  components: {
    Button,
    Enroll,
    DroneIdEditor
  },
  setup() {
    const store = useStore()
    const userInfo = computed(() => {
      // console.log("userInfo = computed(() = >{})觸發\n\nserInfo = ",store.getters.getUserInfo)
      return store.getters.getUserInfo
    })

    const userDroneIdNames = computed(()=>{ 
       return store.getters.getUserDroneIdNames
    })

    // 使用watch深度監聽，讓store中數據不論在全局中的哪裡進行變更，這裡都能跟著響應式變化
    watch(
      () => store.getters.getUserDroneIdNames,
      (newValue, oldValue) => {
        console.log("新值:", newValue);
        console.log("旧值:", oldValue);
      },
      {deep: true}
    )
    const unsubscribe = store.subscribe((mutation, state) => {
      console.log("mutation.type")
    })

         
    return {      
      userDroneIdNames,      
      userInfo,
    }
  }
}
</script>

<style lang="scss" scoped>
.content__wrapper {
  padding-top: 3rem;
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0 15px;

  .content__input {
    margin-bottom: 2rem;
  }

  .droneId__wrapper {
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    margin: 5px;

    .droneId__button {
      margin-left: 5px;
    }
  }
}
</style>
