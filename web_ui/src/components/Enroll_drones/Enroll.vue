<template>
  <!-- <p>test>>>{{ TEST_dronesInfo }}</p> -->
  <a-form
    ref="formRef"
    name="dynamic_form_item"
    layout="vertical"
    :model="dynamicValidateForm"
  >
    <a-form-item
      v-for="(drone, index) in dynamicValidateForm.drones"
      :key="drone.key"
      :label="index === 0 ? 'DroneID' : ''"
      :name="['drones', index, 'value']"
      :rules="{
        required: true,
        message: 'drone can not be null',
        trigger: 'change'
      }"
      style="width: calc(100% + 40px)"
    >
      <a-input
        v-model:value="drone.value"
        placeholder="Input your droneID"
        style="width: calc(100% - 40px); margin-right: 10px"
      />
      <MinusCircleOutlined
        v-if="dynamicValidateForm.drones.length > 1"
        class="dynamic-delete-button"
        :disabled="dynamicValidateForm.drones.length === 1"
        @click="removeDrone(drone)"
      />
    </a-form-item>
    <a-form-item>
      <a-button type="dashed" style="width: 100%" @click="addDrone">
        <PlusOutlined />
        Add Drone
      </a-button>
    </a-form-item>
    <a-form-item style="text-align: center">
      <a-button type="primary" html-type="submit" @click="submitForm"
        >Submit</a-button
      >
      <a-button style="margin-left: 30px" @click="resetForm">Reset</a-button>
    </a-form-item>
  </a-form>
</template>
<script>
import { useStore } from 'vuex'

import { notification } from 'ant-design-vue'
import user from '../../services/user'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { defineComponent, reactive, ref, computed } from 'vue'
import store from '../../store'
export default defineComponent({
  components: {
    MinusCircleOutlined,
    PlusOutlined
  },

  setup() {
    const formRef = ref()
    const dynamicValidateForm = reactive({
      drones: []
    })

    // console.log("在Enroll, 新增前store.state.user = ", store.state.user);

    const submitForm = async function () {
      formRef.value
        .validate()
        .then(async function () {
          let droneId = []
          dynamicValidateForm.drones.forEach((element) => {
            droneId.push(element.value)
          })
          // console.log('enroll.vue: ', droneId)
          // 將表單中的所有 droneID 新增置後端
          const { data } = await user.enrollDroneId(droneId)
          notification.success({
            message: data.msg
          })

          // 更新store
          updateUserInfo()
          // 新增ID後，清空表單
          dynamicValidateForm.drones = []
        })
        .catch((error) => {
          console.log('error', error)
        })
    }

    const userInfo = computed(() => store.getters.getUserInfo)
    const droneArr = computed(() => userInfo.value.droneId)
    /** 更新store 【更新全域變數與後端同步】 */
    const updateUserInfo = async () => {
      const { data } = await user.getUserInfo()
      store.dispatch('setUserInfo', data)
      //origin
      // store.commit(droneId)
      // store.commit('setUserDroneID', droneId)
    }

    const resetForm = () => {
      formRef.value.resetFields()
    }

    const removeDrone = (item) => {
      let index = dynamicValidateForm.drones.indexOf(item)

      if (index !== -1) {
        dynamicValidateForm.drones.splice(index, 1)
      }
    }

    const addDrone = () => {
      dynamicValidateForm.drones.push({
        value: ''
      })
    }

    const store = useStore()
    // 取得當前select_droneID的無人機資訊，如果 undefined 則顯示 droneInfoInit
    // const TEST_dronesInfo = computed(() => store.getters["drone/getDroneInfo"]);

    return {
      // TEST_dronesInfo,

      formRef,
      // formItemLayout,
      // formItemLayoutWithOutLabel,
      droneArr,

      dynamicValidateForm,
      submitForm,
      resetForm,
      removeDrone,
      addDrone
    }
  }
})
</script>
<style>
.dynamic-delete-button {
  cursor: pointer;
  position: relative;
  top: 4px;
  font-size: 24px;
  color: #999;
  transition: all 0.3s;
}
.dynamic-delete-button:hover {
  color: #777;
}
.dynamic-delete-button[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}
.ant-form {
  width: 100%;
}
</style>
