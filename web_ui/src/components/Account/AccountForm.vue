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
    <!-- <input ref="droneIdEl" type="text" name="" id="test" :value= "TEST"><p>{{TEST}}</p>
    <p>{{test}}</p> -->
    <div v-for="(drone,index) in droneId" :key="drone.id" class="droneId__wrapper">
      <!-- {{ drone.id }} -->
      <a-input
        :ref="el => {
          droneIdEl[index]=el;
        }"
        v-model:value= "drone.id"
        
        size="large"
        addon-before="Drone ID"
        :disabled="!isEditing[index].value"
        :maxlength="20"
        type="text"
      />
      <!-- v-model:value= "drone.id" 綁定drone.id，【顯示效果： drone.id值 放到輸入框中】 -->
      <Button
        class="droneId__button"
        type="primary"
        html-type="button"
        :is-loading="isSubmitting"
        :button-name="buttonState[index].value"
        :click-handler="()=>handleDroneIdEdit(index)"
      />
      <button type="button" value="刪除" @click="()=>deleteDrone(index)" >刪除</button>
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

export default {
  name: 'AccountForm',
  components: {
    Button,
    Enroll
  },
  setup() {
    // const droneIdEl = ref(null) //創建一個ref物件，綁定到input上
    const droneIdEl = [] // 改成創建一個陣列，用來放回圈的各個輸入框的ref
    const store = useStore()
    const userInfo = computed(() => {
      console.log("userInfo = computed(() = >{})觸發\n\nserInfo = ",store.getters.getUserInfo)
      return store.getters.getUserInfo
    })

    // const buttonState = computed(() => (isEditing.value ? 'Save' : 'Rename'))
    // const isEditing = ref(false)
    const buttonState = []
    const isEditing = []
     
    const isSubmitting = ref(false)
    const droneId = reactive(userInfo.value.droneId) //react采取单向绑定，網頁的修改不影響後端的userInfo.value.droneId
    // console.log('Account form: ',   droneId instanceof Array)

    // console.log("store全域容器中拾取的:\ndroneId: ",droneId)
    
    for(var i=0;i<droneId.length;i++){
      isEditing[i] = ref(false)
      buttonState[i] = ref('Rename')
    }

    const changeButtonWord = (index) => {
      isEditing[index].value = !isEditing[index].value
      buttonState[index].value = isEditing[index].value ? 'Save' : 'Rename'
    }

    const handleDroneIdEdit = async (index) => {
      console.log("---handleDroneIdEdit 函式---") 
      // console.log(">>buttonState: ",buttonState.value,"\nisEditing.value: ",isEditing.value,"\nisSubmitting.value: ",isSubmitting.value)

      /****** 按下ReName按鈕時 *******/
      if (!isEditing[index].value) {
        // isEditing[index].value = true
        changeButtonWord(index)
        await nextTick(()=>{
          console.log("nextTick執行，還不知道這個要幹嘛")
        })//nextTick()：數據更新後，DOM 非同步更新也完成後，才執行
        droneIdEl[index].focus() //.focus() 自動把游標移到此元件上，不須使用者再次操作
        return
      }

      /****** 按下Save 按鈕時 ******/
      droneIdEl[index].focus()
      console.log("使用者前端介面顯示的全部droneId: ",droneId)  //前端的droneId Array

      // Promise　【user.getUserInfo()回傳的是 Promise】
      // 用 user.getUserInfo() 直接到後端取得目前後端的使用者droneId資料
      const backendUserData = (await user.getUserInfo()).data // 取出Promise資料方法：要用await
      const AllBackendID = backendUserData.droneId //使用者目前後端的droneId資料

      if (droneId[index].id == AllBackendID[index].id){
        /* 如果id沒有修改，值接save */
        changeButtonWord(index)
        isSubmitting.value = false
      }else{
        /* 如果id有修改，修改後端資料庫 */
        // 修改後端database、store state全域變數更改
        const { data } = await user.editUserDroneId({ //別忘了await
          droneId: droneId[index].id,
          originDroneId: AllBackendID[index].id
        })
        // console.log("DATA = ",data)
        notification.success({ message: data.msg }) //msg可能是"Drone ID updated" 或 "This Drone ID already exists!"
        if(data.msg == "Drone ID updated"){ //如果成功更新
          changeButtonWord(index)
          isSubmitting.value = false
        }
      }
    


      // isSubmitting.value = true
      // if (droneId.value !== userInfo.value.droneId) {
      //   store.dispatch('setUserInfo', {
      //     ...userInfo.value,
      //     droneId: droneId.value
      //   })
      //   store.dispatch('setRabbitmqIsInit', false)
      //   socket.emit('cancel-consume')
      //   const { data } = await user.editUserDroneId({
      //     droneId: droneId.value,
      //     originDroneId: userInfo.value.droneId
      //   })
      //   notification.success({ message: data.msg })
      // }

      // isEditing[index].value = false
    }

    const handleDroneIdEditCancel = (index) => {
      // isEditing[index].value = false
      // droneId.value = userInfo.value.droneId
    }

    const deleteDrone = async(index)=>{
      console.log("刪除ID: %s",droneId[index].id)
      const { data } = await user.deleteDroneId({
        droneId: droneId[index].id
      })
      // 【更新store】
      store.commit('deleteDroneID', droneId[index])

      notification.success({ message: data.msg })
    }

    //watch監聽對象：droneId
    watch(droneId, (newValue)=>{    //監聽reactive定義的響應式數據時，oldvalue無法正確獲取。強制開啟了深度監聽（deep配置失效）。所以這裡只監聽newValue，舊值長度用isEditing原本的長度來替代
      console.log("newValue.length = ",newValue.length)
      for(var i=isEditing.length; i<newValue.length; i++){
        isEditing[i] = ref(false)
        buttonState[i] = ref('Rename')
      }
    })
      
    return {
      buttonState,
      droneId,
      droneIdEl,
      isEditing,
      isSubmitting,
      userInfo,
      handleDroneIdEdit,
      handleDroneIdEditCancel,

      changeButtonWord,
      deleteDrone,

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
