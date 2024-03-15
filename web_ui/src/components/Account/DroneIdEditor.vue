<template>
  <!-- <div v-for="(drone,index) in userAllDroneIdName" :key="drone" class="droneId__wrapper"> -->
  <div class="droneId__wrapper">    
    <a-input
      ref="inputRef"
      v-model:value= "editingValue"

      size="large"
      addon-before="Drone ID"
      :disabled="!isEditing"
      :maxlength="20"
      type="text"
    />

    <!-- 編輯droneID按鈕 -->
    <a-button
      class="droneId__button"
      type="primary"
      html-type="button"
      :loading="isSubmitting"

      shape="round"
      size="default"
      @click="()=>handleDroneIdEdit()"
    >
      <EditOutlined v-if="!isEditing"/>
      <CheckOutlined v-if="isEditing"/>
    </a-button>

    <!-- 刪除droneID按鈕 -->
    <a-button
      class="droneId__button"
      shape="circle"
      size="default"
      @click="()=>deleteDrone()"
    >
      <DeleteOutlined />
    </a-button>
    <!-- <button type="button" value="刪除" @click="()=>deleteDrone()" >刪除</button> -->
    
    <!-- </div> -->
  </div>
</template>

<script>
import { reactive, ref } from '@vue/reactivity'
import { useStore } from 'vuex'
import { nextTick } from '@vue/runtime-core'
import user from '../../services/user'
import Button from '../UI/Button.vue'
import { notification } from 'ant-design-vue'
import { DeleteOutlined, EditOutlined, CheckOutlined} from '@ant-design/icons-vue'

// import Enroll from '../Enroll_drones/Enroll.vue'

export default {
  name: 'DroneIdEditor',
  components: {
    Button,
    // Enroll,
    DeleteOutlined,
    EditOutlined,
    CheckOutlined
  },
  props:{
    /* 將顯示在輸入框的Id */
    droneId: String || ''
  },
  setup(props) {
    const store = useStore()
    const inputRef = ref(null) // 創建一個綁定 input 框的 ref 物件
    
    const editingValue = ref(props.droneId); // 臨時變量用來儲存用戶的編輯內容，預設值為當前的ID
    const isEditing = ref(false)
    const isSubmitting = ref(false)


    /* 按下編輯按鈕觸發的函式 */
    const handleDroneIdEdit = async () => {
      console.log("---handleDroneIdEdit 函式---") 

      /****** 當按鈕顯示為ReName，按下按鈕時 *******/
      if (!isEditing.value) {
        isEditing.value = !isEditing.value
        await nextTick(()=>{
          console.log("nextTick執行, 還不知道這個要幹嘛")
        })//nextTick()：數據更新後，DOM 非同步更新也完成後，才執行
        inputRef.value.focus()
        return
      }

      /****** 當按鈕顯示為Save，按下按鈕時 ******/
      isSubmitting.value = true
      /* 如果id有修改 */
      if (editingValue.value != props.droneId){
        if (editingValue.value == '') {
          // 如果編輯後的id為空白，則恢復為原本 droneId 不改
          editingValue.value = props.droneId;
        }else{
          // 如果不為空白，判斷是否為已存在id
          
          const userAllDroneIdName = store.getters.getUserDroneIdNames
          for(var i=0; i < userAllDroneIdName.length; i++ ){
            if(editingValue.value == userAllDroneIdName[i]){
              /*** 是已存在id -> 給用戶提示並結束 ***/
              notification.warn({ message: `droneId "${editingValue.value}" is already exists.` })
              isSubmitting.value = false
              return
            }
          }

          /*** 不是已存在id -> 修改後端database，並更新全域變數 ***/
          const { data } = await user.editUserDroneId({
            droneId: editingValue.value,
            originDroneId: props.droneId
          }) // data.msg可能是"Drone ID updated" 或 "This Drone ID already exists!"
          if(data.msg == "Drone ID updated")  notification.success({ message: data.msg }) 
          // 更新 store state 全域變數
          updateUserInfo()
        }
      }

      isSubmitting.value = false
      isEditing.value = !isEditing.value
    }

    // const handleDroneIdEditCancel = (index) => {
    //   // isEditing[index].value = false
    //   // droneId.value = userInfo.value.droneId
    // }

    const deleteDrone = async()=>{
      const { data } = await user.deleteDroneId({
        droneId: props.droneId
      })
      notification.success({ message: data.msg })

      // 更新store
      updateUserInfo()
    }

    /** 更新store 【更新全域變數與後端同步】 */
    const updateUserInfo =async()=>{
      const { data } = await user.getUserInfo()
      store.dispatch('setUserInfo', data) 
      //origin
      // store.commit(droneId)
      // store.commit('setUserDroneID', droneId)
    }

      
    return {
      inputRef,
      editingValue,
      isEditing,
      isSubmitting,

      handleDroneIdEdit,
      // handleDroneIdEditCancel,
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
