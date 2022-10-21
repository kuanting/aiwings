<template>
  <a-tabs class="tabs" size="small">
    <a-tab-pane key="1" class="tabs__pane" tab="Control">
      <TabControl />
    </a-tab-pane>
    <a-tab-pane key="2" class="tabs__pane" tab="Tweak">
      <TabTweak />
    </a-tab-pane>
    <a-tab-pane key="3" class="tabs__pane" tab="Servo"><TabServo /></a-tab-pane>
    <a-tab-pane key="4" class="tabs__pane" tab="Gimbal"
      ><TabGimbal
    /></a-tab-pane>
    <a-tab-pane key="5" class="tabs__pane" tab="Log"><TabLog /></a-tab-pane>
  </a-tabs>
</template>

<script>
import TabControl from './TabPane/TabControl.vue'
import TabLog from './TabPane/TabLog.vue'
import TabServo from './TabPane/TabServo.vue'
import TabGimbal from './TabPane/TabGimbal.vue'
import TabTweak from './TabPane/TabTweak.vue'
export default {
  name: 'Control',
  components: { TabControl, TabLog, TabServo, TabGimbal, TabTweak }
}
</script>
<style lang="scss" scoped>
.tabs {
  width: 100%;
  height: 100%;

  .tabs__pane {
    width: 100%;
    overflow-y: auto;
    height: calc((100vh - 60px) - ((100vh - 60px) * 0.6) - 37.82px - 16px);
    @media (min-width: 800px) {
      height: calc((100vh - 60px) - ((100vh - 60px) / 2) - 37.82px - 16px);
    }
  }
}
</style>
