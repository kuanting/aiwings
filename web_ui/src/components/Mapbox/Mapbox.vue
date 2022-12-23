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
    <!-- <DroneDashBoard /> -->
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
    let drones_marker = {}
    let flydrone = ''
    let cacheTarget
    let droneMarker
    let longitude = 0
    let latitude = 0
    let mapbox
    const store = useStore()

    const drone = computed(() => store.getters['drone/getDroneInfo'])
    const user = computed(() => store.getters.getUserInfo)
    
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
        "droneID": flydrone,
        "lng": lng,
        "lat": lat
      })
      const altitude = computed(() => store.getters['drone/getAltitude'](flydrone))

      socket.emit('send-drone', {
        droneID: flydrone,
        cmd: 'GOTO',
        altitude: altitude.value,
        lng,
        lat
      })
      mapbox.flyTo([lng, lat])
      message.success('Start GOTO Mission')
    }

    const missionCancelHandler = () => {
      const destination = computed(() => store.getters['drone/getDestination'](flydrone))
      const { lng, lat } = destination.value
      if (lng !== 0 && lat !== 0) {
        mapbox.flyTo([lng, lat])
        drones_marker[flydrone].setLngLat([lng, lat])
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

    //FIXEDME: 這邊要改
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
        //CustomMap 是 lib/mapbox.js
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

        //動態增加drone marker
        //這邊位置不對這邊的經緯度是user所在的經緯度，要改成抓drone原本位置的經緯度
        //現在這個寫法，如果還沒有drone.value的時候會一直loading map
        for (let i in user.value.droneId) {
          // console.log(i)
          // console.log('drone.value: ', drone.value)
          let droneID = user.value.droneId[i]
          drones_marker[droneID] = mapbox.createMarker({
            color: 'red',
            scale: '0.7',
            longitude,
            latitude,
            map: mapbox.map,
            draggable: true
          }) 
          drones_marker[droneID].on('dragend', () => {
            // const isTakeoff = computed(() => store.getters['drone/getTakeoffStatus']('1ee52ca0171e4978'))
            // console.log('drone.value: ', drone.value[user.value.droneId[i]])
            let selectedDroneID = user.value.droneId[i]
            flydrone = selectedDroneID
            let isTakeoff = drone.value[selectedDroneID].status.isTakeoff
            
            if (isTakeoff) {
              const lngLat = drones_marker[droneID].getLngLat()

              cacheTarget = lngLat
              mapbox.flyTo([lngLat.lng, lngLat.lat])
              popEl.value.click()
              return
            }
            message.error('Please TAKEOFF the drone first')
          })
        }
        /////////////////////////////////////////////
        ////////////

        const isEqualPreviousCoords = (newCoords) => {
          const coordinateRecords = geoJsonFormatData.geometry.coordinates
          if (coordinateRecords.length === 0) return false
          return (
            newCoords[0] ===
              coordinateRecords[coordinateRecords.length - 1][0] &&
            newCoords[1] === coordinateRecords[coordinateRecords.length - 1][1]
          )
        }

        //Fixme
        watch(
          () => store.getters['drone/getDroneCoords'],
          (coords) => {
            if (!!coords[0] && !!coords[1]) {
              droneMarker.setLngLat(coords)

              if (!isEqualPreviousCoords(coords)) {
                geoJsonFormatData.geometry.coordinates.push(coords)
                mapbox.updateGeoJsosnSource(
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
  .mapboxgl-marker{
    background-image: url('../../assets/drone1.gif');
    background-color: aqua;
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
