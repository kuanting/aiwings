<template>
  <div id="map"></div>
</template>

<script>
import { message } from 'ant-design-vue'
import { getUserCurrentLocation } from '../../lib/geolocation'
import CustomMap from '../../lib/mapbox'
import * as turf from '@turf/turf'
import { watch } from '@vue/runtime-core'
export default {
  name: 'Map',
  props: {
    flightId: {
      type: Number,
      default: 0
    },
    flightRecord: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    let mapbox
    let longitude = 0
    let latitude = 0
    let animationFrameId
    const animationDuration = 67000
    const cameraAltitude = 400

    const geoJsonFormatData = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    }

    watch(props, (flight) => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId)
      geoJsonFormatData.geometry.coordinates = flight.flightRecord
      mapbox.updateGeoJsonSource('real-time-record', geoJsonFormatData)

      let start
      const distance = turf.lineDistance(turf.lineString(flight.flightRecord))

      function frame(time) {
        if (!start) start = time
        const progress = (time - start) / animationDuration
        const along = turf.along(
          turf.lineString(flight.flightRecord),
          distance * progress
        ).geometry.coordinates
        mapbox.applyFreeCamera(along, cameraAltitude)
        animationFrameId = window.requestAnimationFrame(frame)
      }
      window.requestAnimationFrame(frame)
    })

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
        mapbox.initMapbox('mapbox://styles/mapbox/satellite-streets-v11')
        mapbox.map.on('load', () => {
          mapbox.createGeoJsonSource('real-time-record', geoJsonFormatData)
          mapbox.createLineLayer('real-time-path', 'real-time-record')
        })
      })
  }
}
</script>

<style lang="scss" scoped>
#map {
  width: 100%;
  height: 100%;
}
</style>
