<template>
  <a-form
    ref="formRef"
    name="dynamic_form_item"
    :model="dynamicValidateForm"
    v-bind="formItemLayoutWithOutLabel"
  >
    <a-form-item
      v-for="(drone, index) in dynamicValidateForm.drones"
      :key="drone.key"
      v-bind="index === 0 ? formItemLayout : {}"
      :label="index === 0 ? 'DroneID' : ''"
      :name="['drones', index, 'value']"
      :rules="{
        required: true,
        message: 'drone can not be null',
        trigger: 'change'
      }"
    >
      <a-input
        v-model:value="drone.value"
        placeholder="Input your droneID"
        style="width: 80%; margin-right: 10px"
      />
      <MinusCircleOutlined
        v-if="dynamicValidateForm.drones.length > 1"
        class="dynamic-delete-button"
        :disabled="dynamicValidateForm.drones.length === 1"
        @click="removeDrone(drone)"
      />
    </a-form-item>
    <a-form-item v-bind="formItemLayoutWithOutLabel">
      <a-button type="dashed" style="width: 80%" @click="addDrone">
        <PlusOutlined />
        Add Drone
      </a-button>
    </a-form-item>
    <a-form-item v-bind="formItemLayoutWithOutLabel">
      <a-button type="primary" html-type="submit" @click="submitForm"
        >Submit</a-button
      >
      <a-button style="margin-left: 30px" @click="resetForm">Reset</a-button>
    </a-form-item>
  </a-form>
</template>
<script>
import { notification } from 'ant-design-vue'
import user from '../../services/user'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { defineComponent, reactive, ref } from 'vue'
export default defineComponent({
  components: {
    MinusCircleOutlined,
    PlusOutlined
  },

  setup() {
    const formRef = ref()
    const formItemLayout = {
      labelCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 4
        }
      },
      wrapperCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 20
        }
      }
    }
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 20,
          offset: 4
        }
      }
    }
    const dynamicValidateForm = reactive({
      drones: []
    })

    const submitForm = async function () {
      formRef.value
        .validate()
        .then(async function () {
          let droneId = []
          dynamicValidateForm.drones.forEach((element) => {
            droneId.push(element.value)
          })
          const { data } = await user.enrollDroneId({ droneId: droneId })
          notification.success({
            message: data.msg
          })
        })
        .catch((error) => {
          console.log('error', error)
        })
    }

    //   try {
    //   const { data } = await auth.signup(formData)
    //   //FIX
    //   console.log('singupform: ', data)
    //   notification.success({
    //     message: data.msg
    //   })
    //   isSubmmited.value = false
    //   router.push({ path: '/login' })
    // } catch ({ response }) {
    //   notification.error({
    //     message: response.data.msg
    //   })
    //   formState.password = ''
    //   formState.checkPassword = ''
    //   isSubmmited.value = false
    // }

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

    return {
      formRef,
      formItemLayout,
      formItemLayoutWithOutLabel,
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
  width: 500px;
}
</style>
