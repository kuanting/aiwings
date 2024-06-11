/* 更改data的數據格式
 */
export function transformDataFormat(data) {
  // 解构赋值语法，這是原本drone回傳的資料格式
  const {
    drone_info: {
      drone_id: drone_id,
      timestamp: timeStamp,
      attitude: { yaw, roll, pitch },
      battery: { voltage, percentage },
      gps_status: { hpop, gps_count: gpsCount },
      heartbeat: { flight_mode: mode, is_armed: isArmed },
      location: {
        heading,
        lat: latitude,
        lng: longitude,
        relative_alt: altitude
      },
      speed: { air_speed: speed }
    }
  } = data

  //改成這種形態
  const transformData = {
    [drone_id]: {
      ...droneInfoInit, // 根據定義的預設格式
      timeStamp,
      roll,
      yaw,
      pitch,
      voltage,
      percentage,
      hpop,
      gpsCount,
      mode,
      isArmed,
      heading,
      latitude,
      longitude,
      altitude,
      speed,
    }
  }
  return transformData;
}

// 定義 drone 的訊息預設格式
export const droneInfoInit = { 
  timeStamp: '', 
  roll: null, 
  yaw: null, 
  pitch: null, 
  voltage: null, 
  percentage: null, 
  hpop: null, 
  gpsCount: null, 
  mode: '', 
  isArmed: '', 
  heading: null, 
  latitude: null, 
  longitude: null, 
  altitude: null, 
  speed: null, 
  status: { altitude: 3, isTakeoff: false }, //isTakeoff 預設要改成false
  destination: { lng: null, lat: null} 
}
