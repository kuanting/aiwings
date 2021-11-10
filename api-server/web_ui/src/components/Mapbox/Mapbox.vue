<template>
  <div id="map">
    <a-popconfirm
      title="Press Start To Start Mission"
      ok-text="Start"
      cancel-text="Cancel"
      @confirm="missionConfirmHandler"
      @cancel="missionCancelHandler"
      ><a ref="popEl" class="confirm__dialog"
    /></a-popconfirm>
    <DroneDashBoard />
    <a-tooltip placement="left" color="blue" title="Save & Clear Path">
      <a-button
        class="save-btn"
        shape="circle"
        size="small"
        @click="saveAndClearPathHandler"
      >
        <SaveOutlined />
      </a-button>
    </a-tooltip>
  </div>
  <a-spin
    v-if="isLoading"
    class="map__spinner"
    :spinning="isLoading"
    tip="Loading map..."
  />
</template>

<script>
import CustomMap from '../../lib/mapbox'
import DroneDashBoard from './DroneDashBoard.vue'
import { computed, ref, watch } from '@vue/runtime-core'
import { getUserCurrentLocation } from '../../lib/geolocation'
import droneService from '../../services/drone'
import socket from '../../lib/websocket'
import { useStore } from 'vuex'
import { message, notification } from 'ant-design-vue'
import { SaveOutlined } from '@ant-design/icons-vue'
export default {
  name: 'Mapbox',
  components: { DroneDashBoard, SaveOutlined },
  setup() {
    const popEl = ref(null)
    const isLoading = ref(true)
    let cacheTarget
    let droneMarker
    let targetMarker
    let longitude = 0
    let latitude = 0
    let mapbox
    const store = useStore()
    const isTakeoff = computed(() => store.getters['drone/getTakeoffStatus'])
    const altitude = computed(() => store.getters['drone/getAltitude'])
    const destination = computed(() => store.getters['drone/getDestination'])
    const geoJsonFormatData = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    }

    const missionConfirmHandler = () => {
      const { lng, lat } = cacheTarget
      store.dispatch('drone/updateDestination', {
        lng,
        lat
      })
      socket.emit('send-drone', {
        cmd: 'GOTO',
        altitude: altitude.value,
        lng,
        lat
      })
      mapbox.flyTo([lng, lat])
      message.success('Start GOTO Mission')
    }

    const missionCancelHandler = () => {
      const { lng, lat } = destination.value
      if (lng !== 0 && lat !== 0) {
        mapbox.flyTo([lng, lat])
        targetMarker.setLngLat([lng, lat])
        return
      }
    }

    const saveAndClearPathHandler = async () => {
      if (geoJsonFormatData.geometry.coordinates.length < 10) {
        notification.warning({ message: 'No flight records can be save!' })
        return
      }
      notification.info({
        message: 'Saving flight records...',
        duration: 2
      })
      try {
        const { data } = await droneService.saveFlightRecords(
          geoJsonFormatData.geometry.coordinates
        )
        notification.success({
          message: data.msg
        })
        geoJsonFormatData.geometry.coordinates = []
      } catch (error) {
        notification.error({
          message: 'Oops! Cannot save records, Please try again!'
        })
      }
    }

    getUserCurrentLocation()
      .then(([lng, lat]) => {
        longitude = lng
        latitude = lat
      })
      .catch(() => {
        message.error(
          'Please allow gps permission to get more accuracy position'
        )
      })
      .finally(() => {
        mapbox = new CustomMap({ longitude, latitude })
        mapbox.initMapbox()
        mapbox.map.dragRotate.disable()
        mapbox.map.on('load', () => {
          mapbox.createGeoJsonSource('real-time-record', geoJsonFormatData)
          mapbox.createLineLayer('real-time-path', 'real-time-record')
        })

        droneMarker = mapbox.createMarker({
          longitude,
          latitude,
          map: mapbox.map
        })
        targetMarker = mapbox.createMarker({
          color: 'red',
          scale: '0.7',
          longitude,
          latitude,
          map: mapbox.map,
          draggable: true
        })

        targetMarker.on('dragend', () => {
          if (isTakeoff.value) {
            const lngLat = targetMarker.getLngLat()
            cacheTarget = lngLat
            mapbox.flyTo([lngLat.lng, lngLat.lat])
            popEl.value.click()
            return
          }
          message.error('Please TAKEOFF the drone first')
        })

        const isEqualPreviousCoords = (newCoords) => {
          const coordinateRecords = geoJsonFormatData.geometry.coordinates
          if (coordinateRecords.length === 0) return false
          return (
            newCoords[0] ===
              coordinateRecords[coordinateRecords.length - 1][0] &&
            newCoords[1] === coordinateRecords[coordinateRecords.length - 1][1]
          )
        }

        watch(
          () => store.getters['drone/getDroneCoords'],
          (coords) => {
            if (!!coords[0] && !!coords[1]) {
              droneMarker.setLngLat(coords)

              if (!isEqualPreviousCoords(coords)) {
                geoJsonFormatData.geometry.coordinates.push(coords)
                mapbox.updateGeoJsonSource(
                  'real-time-record',
                  geoJsonFormatData
                )
              }
            }
          }
        )

        isLoading.value = false
      })

    return {
      isLoading,
      popEl,
      missionConfirmHandler,
      missionCancelHandler,
      saveAndClearPathHandler
    }
  }
}
</script>
<style lang="scss" scoped>
#map {
  position: relative;
  width: 100%;
  height: 100%;

  .confirm__dialog {
    position: absolute;
    top: 49%;
    left: 50%;
  }

  .save-btn {
    position: absolute;
    right: 0.8rem;
    top: 6.5rem;
    z-index: 150;
  }
}
.map__spinner {
  position: absolute;
  z-index: 500;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
