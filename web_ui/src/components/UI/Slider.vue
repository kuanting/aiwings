<template>
  <a-slider
    v-model:value="sliderValue"
    :max="props.max"
    :min="props.min"
    :marks="props.marks"
    @afterChange="changeHandler"
  />
</template>

<script>
import { ref } from '@vue/reactivity'
export default {
  name: 'Slider',
  props: {
    max: {
      type: Number,
      default: 100
    },
    min: {
      type: Number,
      default: 0
    },
    initialValue: {
      type: Number,
      default: 0
    },
    marks: {
      type: Object,
      default: () => ({})
    },
    changeHandler: {
      type: Function,
      default: () => {}
    }
  },
  setup(props) {
    const sliderValue = ref(props.initialValue)
    return {
      props,
      sliderValue
    }
  }
}
</script>
