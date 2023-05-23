<template>
  <a-form
    ref="formEl"
    :model="formState"
    :rules="rules"
    layout="vertical"
    class="form"
    @finish="submitFromHandler"
  >
    <h1 class="form__title">Sign Up</h1>
    <a-form-item required has-feedback label="Email" name="email">
      <a-input
        ref="emailEl"
        v-model:value="formState.email"
        type="email"
        placeholder="email"
      />
    </a-form-item>
    <!-- <a-form-item label="Drone ID" name="droneId">
      <a-input
        v-model:value="formState.droneId"
        type="text"
        placeholder="Drone ID"
      />
    </a-form-item> -->
    <a-form-item required has-feedback label="Password" name="password">
      <a-input-password
        v-model:value="formState.password"
        type="password"
        placeholder="password"
      />
    </a-form-item>
    <a-form-item
      required
      has-feedback
      label="Check Password"
      name="checkPassword"
    >
      <a-input-password
        v-model:value="formState.checkPassword"
        type="password"
        placeholder="Check Password"
      />
    </a-form-item>

    <Button
      class="form__button"
      html-type="submit"
      button-name="Signup"
      :block="true"
      type="primary"
      :is-disabled="isDisable"
      :is-loading="isSubmmited"
    />
  </a-form>
</template>

<script>
import { reactive, ref } from '@vue/reactivity'
import Button from '../UI/Button.vue'
import { computed, onMounted } from '@vue/runtime-core'
import auth from '../../services/auth'
import { notification } from 'ant-design-vue'
import { useRouter } from 'vue-router'
export default {
  name: 'SignupForm',
  components: {
    Button
  },
  setup() {
    const emailEl = ref(null)
    const formEl = ref(null)
    const isSubmmited = ref(false)
    const formState = reactive({
      email: '',
      password: '',
      checkPassword: ''
    })
    const router = useRouter()

    const isDisable = computed(() => {
      return (
        formState.email === '' ||
        !formState.email.includes('@') ||
        formState.password === '' ||
        formState.password.length < 8 ||
        formState.checkPassword === '' ||
        formState.password !== formState.checkPassword
      )
    })

    const validateEmail = async (rule, value) => {
      if (value === '') {
        return Promise.reject('Please input email')
      }
      if (!value.includes('@')) {
        return Promise.reject('Please input correct email format')
      }
      return Promise.resolve()
    }

    const validatePassword = async (rule, value) => {
      if (value === '') {
        return Promise.reject('Please input password')
      }
      if (value.length < 8) {
        return Promise.reject('Password character must longer or equal than 8')
      }
      if (formState.checkPassword !== '') {
        formEl.value.validateFields('checkPassword')
        return
      }
      return Promise.resolve()
    }

    const validateCheckPasssword = async (rule, value) => {
      if (value === '') {
        return Promise.reject('Please input check password')
      }
      if (value !== formState.password) {
        return Promise.reject("Password & Check Password don't match")
      }
      return Promise.resolve()
    }

    const rules = {
      email: [{ validator: validateEmail, trigger: ['change', 'blur'] }],
      password: [
        {
          validator: validatePassword,
          trigger: ['change', 'blur']
        }
      ],
      checkPassword: [
        {
          validator: validateCheckPasssword,
          trigger: ['change', 'blur']
        }
      ]
    }

    const submitFromHandler = async function (formData) {
      isSubmmited.value = true
      console.log("用戶輸入的signup資料: ",formData)
      try {
        const { data } = await auth.signup(formData)
        //FIX
        console.log('成功singup後取得的資料: ', data)
        notification.success({
          message: data.msg
        })
        isSubmmited.value = false
        console.log("註冊成功，前往登入頁面")
        router.push({ path: '/login' })
      } catch ({ response }) {
        console.log("註冊失敗\n失敗原因: ",response.data.msg)
        notification.error({
          message: response.data.msg
        })
        formState.password = ''
        formState.checkPassword = ''
        isSubmmited.value = false
      }
    }

    onMounted(() => {
      emailEl.value.focus()
    })

    return {
      emailEl,
      formEl,
      isSubmmited,
      formState,
      rules,
      isDisable,
      submitFromHandler
    }
  }
}
</script>

<style lang="scss" scoped>
.form {
  border-radius: 10px;
  box-shadow: 0 6px 12px 0 rgba(89, 98, 115, 15%);
  padding: 2rem;
  width: 350px;

  .form__title {
    text-align: center;
    font-weight: 600;
    color: #1890ff;
  }

  .form__button {
    margin-top: 20px;
  }
}
</style>
