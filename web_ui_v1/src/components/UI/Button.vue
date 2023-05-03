<template>
  <a-button
    :html-type="props.htmlType"
    :loading="props.isLoading"
    :shape="props.shape"
    :size="props.size"
    :type="props.type"
    :block="props.block"
    :disabled="isDisabled"
    @click="props.clickHandler"
  >
    <template #icon><slot></slot></template>
    {{ props.buttonName }}
  </a-button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    buttonName: {
      type: String,
      default: ''
    },
    htmlType: {
      type: String,
      default: 'button'
    },
    isLoading: {
      type: Boolean
    },
    isDisabled: {
      type: Boolean
    },
    shape: {
      type: String,
      default: 'round'
    },
    size: {
      type: String,
      default: 'default'
    },
    type: {
      type: String,
      default: 'default'
    },
    block: {
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
