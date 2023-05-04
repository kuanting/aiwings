<template>
  <div id="map">
    <InfoDashBoard :live-drone="live" />
  </div>
</template>

<script>
import InfoDashBoard from './InfoDashBoard.vue'
import { message } from 'ant-design-vue'
import { getUserCurrentLocation } from '../../lib/geolocation'
import CustomMap from '../../lib/mapbox'
import * as turf from '@turf/turf'
import { reactive, watch } from '@vue/runtime-core'
export default {
  name: 'Map',
  components: {
    InfoDashBoard
  },
  props: {
    droneInfo: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    let longitude
    let latitude
    let mapbox
    let live = reactive({ drone: {} })
    const featureCollection = turf.featureCollection([])

    watch(
      () => props.droneInfo,
      (info) => {
        const { id, lng, lat, alt, speed, voltage } = info
        if (id in live.drone) {
          live.drone[id].alt = alt
          live.drone[id].speed = speed
          live.drone[id].voltage = voltage
          const indexOfFeatures = live.drone[id].index
          featureCollection.features[indexOfFeatures].geometry.coordinates = [
            lng,
            lat
          ]
        } else {
          //turf: It performs geospatial processing tasks with GeoJSON data and can be run on a server or in a browser.
          const feature = turf.point([lng, lat], { droneId: id })
          const index = featureCollection.features.push(feature)
          live.drone = {
            ...live.drone,
            [`${id}`]: {
              index: index - 1,
              alt,
              speed,
              voltage
            }
          }
        }
        mapbox.updateGeoJsonSource(
          'real-time-drone-position',
          featureCollection
        )
      },
      { deep: true }
    )

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
        mapbox.map.on('load', () => {
          mapbox.createGeoJsonSource(
            'real-time-drone-position',
            featureCollection
          )
          mapbox.createDroneLayer(
            'real-time-drone-position',
            'real-time-drone-position'
          )
        })
      })

    return {
      live
    }
  }
}
</script>

<style lang="scss" scoped>
#map {
  width: 100%;
  height: 100%;
  position: absolute;
}
</style>
