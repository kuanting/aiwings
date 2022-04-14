<template>
  <a-radio-group
    :value="props.mode"
    :disabled="props.isDisabled"
    @change="changeHandler"
  >
    <a-radio-button value="STABILIZE">STABILIZE</a-radio-button>
    <a-radio-button value="GUIDED">GUIDED</a-radio-button>
    <a-radio-button value="RTL">RTL</a-radio-button>
  </a-radio-group>
</template>

<script>
export default {
  name: 'RadioGroup',
  props: {
    mode: {
      type: String,
      default: ''
    },
    isDisabled: {
      type: Boolean
    },
    changeHandler: {
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
