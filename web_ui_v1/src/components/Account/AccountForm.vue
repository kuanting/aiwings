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
    <div class="droneId__wrapper">
      <a-input
        ref="droneIdEl"
        v-model:value="droneId"
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
      <Button
        v-show="isEditing"
        class="droneId__button"
        html-type="button"
        button-name="Cancel"
        :click-handler="handleDroneIdEditCancel"
      />
    </div>
  </div>
</template>

<script>
import { ref } from '@vue/reactivity'
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
    const buttonState = computed(() => (isEditing.value ? 'Save' : 'Edit'))
    const isEditing = ref(false)
    const isSubmitting = ref(false)
    const droneId = ref(userInfo.value.droneId)

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
        const { data } = await user.editUserDroneId({ droneId: droneId.value })
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

    .droneId__button {
      margin-left: 5px;
    }
  }
}
</style>
