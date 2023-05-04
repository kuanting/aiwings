<template>
  <a-form
    :model="formState"
    :rules="rules"
    :hide-required-mark="true"
    layout="vertical"
    class="form"
    @finish="submitFromHandler"
  >
    <h1 class="form__title">Login</h1>
    <a-form-item label="Email" name="email">
      <a-input
        ref="emailEl"
        v-model:value="formState.email"
        type="email"
        placeholder="email"
      />
    </a-form-item>
    <a-form-item label="Password" name="password">
      <a-input-password
        v-model:value="formState.password"
        type="password"
        placeholder="password"
      />
    </a-form-item>

    <Button
      class="form__button"
      html-type="submit"
      button-name="Login"
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
import { notification } from 'ant-design-vue'
import auth from '../../services/auth'
import { useRouter } from 'vue-router'
export default {
  name: 'LoginForm',
  components: {
    Button
  },
  setup() {
    const emailEl = ref(null)
    const isSubmmited = ref(false)
    const formState = reactive({
      email: '',
      password: ''
    })
    const router = useRouter()

    const isDisable = computed(() => {
      return (
        formState.email === '' ||
        !formState.email.includes('@') ||
        formState.password === ''
      )
    })

    const rules = {
      email: [
        {
          pattern: '@',
          message: 'Incorrect email format',
          trigger: ['change', 'blur']
        },
        {
          required: true,
          message: 'Please input email',
          trigger: ['change', 'blur']
        }
      ],
      password: [
        {
          required: true,
          message: 'Please input password',
          trigger: ['change', 'blur']
        }
      ]
    }

    const submitFromHandler = async (formData) => {
      isSubmmited.value = true
      try {
        const { data } = await auth.login(formData)
        console.log('login: ', data)
        notification.success({
          message: data.msg
        })
        isSubmmited.value = false
        //FIXME:
        // 如果已經註冊droneID, 那就直接進入操作介面， 如果沒有那就跳出提示，然後進入註冊畫面
        // if (data.isEnrolled === true) {
        router.push({ path: '/drone' })
        
      } catch ({ response }) {
        notification.error({
          message: response.data.msg
        })
        formState.password = ''

        isSubmmited.value = false
      }
    }

    onMounted(() => {
      emailEl.value.focus()
    })

    return {
      emailEl,
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
