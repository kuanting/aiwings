<template>
  <div class="container">
    <div class="map">
      <Map :flight-id="flight.id" :flight-record="flight.record" />
    </div>
    <div class="item-list">
      <ItemList @RecordSelect="handleRecordSelect" />
    </div>
  </div>
</template>

<script>
import { reactive } from '@vue/reactivity'
import ItemList from '../components/Records/ItemList.vue'
import Map from '../components/Records/Map.vue'
import droneService from '../services/drone'

export default {
  name: 'Records',
  components: { ItemList, Map },
  setup() {
    const flight = reactive({
      id: 0,
      record: []
    })

    const handleRecordSelect = async (id) => {
      const {
        data: { record }
      } = await droneService.getFlightRecord(id)
      flight.id = record.id
      flight.record = record.record
    }

    return {
      handleRecordSelect,
      flight
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: calc(100vh - 60px);
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 50% 50%;
  @media (min-width: 800px) {
    grid-template-columns: 400px auto;
    grid-template-rows: 100%;
  }
  @media (min-width: 1024px) {
    grid-template-columns: 500px auto;
  }

  .map {
    width: 100%;
    height: 100%;
    grid-row: 1 / 2;
    @media (min-width: 800px) {
      grid-column: 2 / 3;
      grid-row: 1;
    }
  }

  .item-list {
    width: 100%;
    height: 100%;
    grid-row: 2 / 3;
    @media (min-width: 800px) {
      grid-column: 1 / 2;
      grid-row: 1;
    }
  }
}
</style>
