<template>
  <div class="list__wrapper">
    <div class="list__header"><h4>Flight Records</h4></div>
    <ul class="list">
      <div v-if="records.length === 0" class="list__empty">
        <img
          src="../../assets/empty_record.svg"
          class="list__empty--image"
          alt="no_records"
        />
        <h1>No records</h1>
      </div>
      <li
        v-for="record in records"
        v-else
        :id="record.id"
        :key="record.id"
        class="list__item"
        @click="handleRecordClick"
      >
        {{ record.update }}
      </li>
    </ul>
  </div>
</template>

<script>
import droneService from '../../services/drone'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-tw'
import { ref } from '@vue/reactivity'
import { onMounted } from '@vue/runtime-core'
export default {
  name: 'ItemList',
  emits: ['RecordSelect'],
  setup(props, { emit }) {
    let records = ref([])

    const fetchUserFlightRecords = async () => {
      const { data } = await droneService.getFlightRecords()
      return data.records.map((record) => ({
        ...record,
        update: dayjs(record.update)
          .locale('zh-tw')
          .format('YYYY/MM/DD ddd h:mm A')
      }))
    }

    const handleRecordClick = (e) => emit('RecordSelect', e.target.id)

    onMounted(async () => {
      const formatedRecords = await fetchUserFlightRecords()
      records.value = [...formatedRecords]
    })

    return {
      records,
      handleRecordClick
    }
  }
}
</script>

<style lang="scss" scoped>
.list__wrapper {
  height: 100%;
  overflow-y: auto;

  .list__header {
    position: -webkit-sticky;
    position: sticky;
    top: 0px;
    background-color: white;
    padding: 0 5px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;

    h4 {
      margin: 0;
      @media (min-width: 800px) {
        font-size: 2rem;
      }
    }
  }

  .list {
    margin: 0;
    padding: 0 10px;
    list-style: none;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;

    .list__empty {
      .list__empty--image {
        width: 300px;
        margin-top: 50px;
      }
      h1 {
        text-align: center;
      }
    }

    .list__item {
      width: 100%;
      height: 70px;
      margin-bottom: 10px;
      box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.35);
      display: flex;
      justify-content: center;
      align-items: center;

      &:hover {
        box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.35);
        cursor: pointer;
      }
    }
  }
}
</style>
