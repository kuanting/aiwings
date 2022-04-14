<template>
  <div class="wrapper">
    <span>{{ props.itemName }}</span>
    <a-input-number
      type="number"
      :value="props.value"
      :disabled="props.isDisabled"
      :max="props.max"
      :min="props.min"
      @change="props.changeHandler"
      @pressEnter="props.enterHandler"
    />
  </div>
</template>

<script>
export default {
  name: 'InputNumber',
  props: {
    itemName: {
      type: String,
      default: ''
    },
    value: {
      type: Number || String,
      default: 0
    },
    isDisabled: {
      type: Boolean
    },
    max: {
      type: Number,
      default: Infinity
    },
    min: {
      type: Number,
      default: Infinity
    },
    changeHandler: {
      type: Function,
      default: () => {}
    },
    enterHandler: {
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
