<template>
  <div class="wrapper">
    <span>{{ props.itemName }}</span>
    <a-switch
      :checked="props.status"
      :checked-children="props.checkTitle"
      :un-checked-children="props.unCheckTitle"
      :loading="props.isLoading"
      :disabled="props.isDisabled"
      @click="props.clickHandler"
    />
  </div>
</template>

<script>
export default {
  name: 'Switch',
  props: {
    itemName: {
      type: String,
      default: ''
    },
    status: {
      type: Boolean,
      default: false
    },
    checkTitle: {
      type: String,
      default: ''
    },
    unCheckTitle: {
      type: String,
      default: ''
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    clickHandler: {
      type: Function,
      default: () => {}
    }
  },
  setup(props) {
    return {
      props
    }
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;

  span {
    color: rgb(33, 125, 231);
    font-weight: 600;
  }
}
</style>
