<template>
  <div class="content__wrapper">
    <h1>Account Setting</h1>
    <a-divider />
    <a-input
      v-model:value="userInfo.email"
      class="content__input"
      size="large"
      addon-before="E-mail"
      :disabled="true"
      type="email"
    />
    <div v-for="drone in droneId" :key="drone.id" class="droneId__wrapper">
      <!-- {{ drone.id }} -->
      <a-input
        ref="droneIdEl"
        v-model:value= "drone.id"
        
        size="large"
        addon-before="Drone ID"
        :disabled="!isEditing"
        :maxlength="20"
        type="text"
      />
      <Button
        class="droneId__button"
        type="primary"
        html-type="button"
        :is-loading="isSubmitting"
        :button-name="buttonState"
        :click-handler="handleDroneIdEdit"
      />
    </div>
  </div>
</template>

<script>
import { reactive, ref } from '@vue/reactivity'
import { useStore } from 'vuex'
import { computed, nextTick } from '@vue/runtime-core'
import socket from '../../lib/websocket'
import user from '../../services/user'
import Button from '../UI/Button.vue'
import { notification } from 'ant-design-vue'
export default {
  name: 'AccountForm',
  components: {
    Button
  },
  setup() {
    const droneIdEl = ref(null)
    const store = useStore()
    const userInfo = computed(() => store.getters.getUserInfo)
    const buttonState = computed(() => (isEditing.value ? 'Save' : 'DEL'))
    const isEditing = ref(false)
    const isSubmitting = reactive(false)
    const droneId = reactive(userInfo.value.droneId)
    // console.log('Account form: ',   droneId instanceof Array)
    const handleDroneIdEdit = async () => {
      if (!isEditing.value) {
        isEditing.value = true
        await nextTick()
        droneIdEl.value.focus()
        return
      }

      isSubmitting.value = true
      if (droneId.value !== userInfo.value.droneId) {
        store.dispatch('setUserInfo', {
          ...userInfo.value,
          droneId: droneId.value
        })
        store.dispatch('setRabbitmqIsInit', false)
        socket.emit('cancel-consume')
        const { data } = await user.editUserDroneId({
          droneId: droneId.value,
          originDroneId: userInfo.value.droneId
        })
        notification.success({ message: data.msg })
      }
      isEditing.value = false
      isSubmitting.value = false
    }

    const handleDroneIdEditCancel = () => {
      isEditing.value = false
      droneId.value = userInfo.value.droneId
    }

    return {
      buttonState,
      droneId,
      droneIdEl,
      isEditing,
      isSubmitting,
      userInfo,
      handleDroneIdEdit,
      handleDroneIdEditCancel
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
