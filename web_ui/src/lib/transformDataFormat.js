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
      status: {
        altitude: 3,
        //isTakeoff 預設要改成false
        isTakeoff: false
      },
      destination: {
        lng: 0,
        lat: 0
      }
    }
  }
  return transformData;
}

