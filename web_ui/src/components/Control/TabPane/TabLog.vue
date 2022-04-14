<template>
  <div class="container">
    <ul>
      <li v-for="log in logs" :key="log.payload">
        {{ log.timeStamp }} > {{ log.payload }}
      </li>
    </ul>
  </div>
</template>

<script>
import { computed } from '@vue/runtime-core'
import { useStore } from 'vuex'
export default {
  name: 'TabLog',
  setup() {
    const store = useStore()
    const logs = computed(() => store.getters['getLogs'])

    return {
      logs
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  padding: 0 3px;

  ul {
    padding: 0;
    list-style: none;
    li {
      font-size: 1rem;
      word-wrap: break-word;
    }
  }
}
</style>
