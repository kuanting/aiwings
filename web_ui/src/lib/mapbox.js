import mapboxgl from 'mapbox-gl'

const MAPBOX = {
  STYLE: 'mapbox://styles/mapbox/outdoors-v11',
  TOKEN: import.meta.env.VITE_APP_MAPBOX_TOKEN
}
export default class CustomMap {
  constructor({ longitude, latitude }) {
    this.longitude = longitude
    this.latitude = latitude
    this.map = null
  }

  initMapbox(mapStyle) {
    this.map = new mapboxgl.Map({
      style: mapStyle || MAPBOX.STYLE,
      center: [this.longitude, this.latitude],
      zoom: 16,
      pitch: 0,
      bearing: 0,
      antialias: false,
      container: 'map',
      accessToken: MAPBOX.TOKEN
    })

    this.map.on('load', () => {
      this._loadBuildingLayer() // 載入建築物圖層
      this._addMapControls() // 添加地圖控制元件
    })
  }

  _loadBuildingLayer() {
    // Get label layer ID

    const layers = this.map.getStyle().layers // 獲取當前地圖樣式的所有圖層
    let labelLayerId
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
        labelLayerId = layers[i].id // labelLayerId：儲存所有圖層id
        break
      }
    }

    // Add 3D building layer
    this.map.addLayer(
      {
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      },
      labelLayerId
    )
  }

  _addMapControls() {
    // 添加導航控件到地圖右上角
    this.map.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true
      }),
      'top-right'
    )

    // 添加比例尺控件到地圖的左下角
    this.map.addControl(
      new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }),
      'bottom-left'
    )
  }

  /** 先透過addSource將數據資料將數據資料加到地圖 */

  /**
   * Create a Geojson source and apply into custom map
   * @param {string} id source ID
   * @param {object} geoJsonData
   */
  createGeoJsonSource(id, geoJsonData) {
    this.map.addSource(id, {
      type: 'geojson',
      data: geoJsonData
    })
  }

  /**
   * Create a custom line layer
   * @param {string} id layer ID
   * @param {string} source source data ID
   */
  createLineLayer(id, source) {
    //將地圖中的數據資料轉為圖層
    this.map.addLayer({
      id,
      type: 'line',
      source,
      layout: {
        'line-join': 'round'
      },
      paint: {
        'line-blur': 0.1,
        'line-color': '#1A73E8',
        'line-opacity': 0.8,
        'line-width': 3
      }
    })
  }

  /**
   * Create a custom point layer(drone icon)
   * @param {string} id layer ID
   * @param {string} source source data ID
   */
  createDroneLayer(id, source) {
    this.map.addLayer({
      id,
      type: 'symbol',
      source,
      layout: {
        'icon-image': 'drone-25-red',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'text-field': ['get', 'droneId'],
        'text-offset': [0, 1.3],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#ff0000'
      }
    })
  }

  /**
   * Update specific map source and re-render map
   * @param {string} sourceId
   * @param {object} geoJsonData
   */
  updateGeoJsonSource(sourceId, geoJsonData) {
    this.map.getSource(sourceId)?.setData(geoJsonData)
  }

  createMarker({
    color = 'blue',
    scale = '1',
    longitude,
    latitude,
    draggable = false,
    map,
    popup,
    element
  }) {
    return new mapboxgl.Marker({
      // 創建標記點
      element,
      color,
      scale,
      draggable
    })
      .setLngLat([longitude, latitude])
      .setPopup(popup)
      .addTo(map)
  }

  /**
   * @param {number[]} lngLat
   * @param {number} zoomLevel
   */
  flyTo(lngLat, zoomLevel = 19) {
    this.map.flyTo({ center: lngLat, zoom: zoomLevel })
  }

  /**
   * @param {number[]} along
   * @param {number} cameraAltitude
   */
  applyFreeCamera(along, cameraAltitude) {
    const camera = this.map.getFreeCameraOptions()
    camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
      {
        lng: along[0],
        lat: along[1]
      },
      cameraAltitude
    )
    camera.lookAtPoint({ lng: along[0], lat: along[1] })
    this.map.setFreeCameraOptions(camera)
  }
}
