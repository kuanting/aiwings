<template>
  <li class="dashboard">
    <ul v-for="(drone, key) in props.liveDrone.drone" :key="drone.index">
      <RocketFilled />
      {{
        key
      }}
      <ColumnHeightOutlined />
      {{
        `${drone.alt} m`
      }}
      <DashboardFilled />
      {{
        `${drone.speed} m/s`
      }}
      <AlertFilled />
      {{
        `${drone.voltage} v`
      }}
    </ul>
  </li>
</template>

<script>
import {
  RocketFilled,
  ColumnHeightOutlined,
  DashboardFilled,
  AlertFilled
} from '@ant-design/icons-vue'
export default {
  name: 'InfoDashBoard',
  components: {
    RocketFilled,
    ColumnHeightOutlined,
    DashboardFilled,
    AlertFilled
  },
  props: {
    liveDrone: {
      type: Object,
      default: () => ({})
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
.dashboard {
  position: relative;
  z-index: 150;
  top: 1rem;
  left: 1rem;
  max-width: 400px;
  list-style-type: none;

  ul {
    color: #ffffff;
    padding: 5px 10px;
    margin-bottom: 5px;
    background: rgba(0, 0, 0, 0.7);
    box-shadow: 0 1px 4px 2px rgba(0, 0, 0, 0.2);
    border-radius: 5px;
  }
}
</style>
