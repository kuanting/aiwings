<template>
  <div class="container">
    <div v-for="(userDrone, index) in userDrones" :key="index" class="box">
      <a-popover
        placement="topLeft"
        title="Drone Information"
        trigger="click"
        overlayClassName="popover"
      >
        <template #content>
          <h3>
            <span>{{ userDrone.id }}</span>
            <!-- userDrone:  {id: "droneId name", isAdmin: "true or false"} -->
          </h3>
          <li><span>TIME:</span> {{ dronesInfo[userDrone.id].timeStamp }}</li>
          <li>
            <span>GPS:</span> {{ dronesInfo[userDrone.id].longitude }}
            {{ dronesInfo[userDrone.id].latitude }}
          </li>
          <li><span>HEADING:</span> {{ dronesInfo[userDrone.id].heading }}</li>
          <li><span>ALTITUDE(m):</span> {{ dronesInfo[userDrone.id].altitude }}</li>
          <li><span>SPEED(m/s): </span> {{ dronesInfo[userDrone.id].speed }}</li>
          <li><span>STATUS:</span> {{ dronesInfo[userDrone.id].isArmed }}</li>
          <li><span>MODE:</span> {{ dronesInfo[userDrone.id].mode }}</li>
          <li><span>VOLTAGE:</span> {{ dronesInfo[userDrone.id].voltage }}</li>
          <li><span>BATTERY:</span> {{ dronesInfo[userDrone.id].percentage }}</li>
          <li><span>ROLL:</span> {{ dronesInfo[userDrone.id].roll }}</li>
          <li><span>PITCH:</span> {{ dronesInfo[userDrone.id].pitch }}</li>
          <li><span>GPS COUNTS:</span> {{ dronesInfo[userDrone.id].gpsCount }}</li>
          <li><span>GPS HPOP:</span> {{ dronesInfo[userDrone.id].hpop }}</li>
        </template>
          <img
            src="../../assets/drone1.gif"
            alt="drone_gif"
            @click="showSelected(userDrone.id)"
            @mouseover="mouseOverEvent(userDrone.id)"
            @mouseout="mouseOutEvent(userDrone.id)"
            class="cover-fit"
          />
      </a-popover>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, reactive, ref } from '@vue/runtime-core'
// import useMapbox from '../../hooks/useMapbox'

export default {
  name: 'droneInfoDashBoard',

  setup() {
    const store = useStore()
    const user = computed(() => store.getters.getUserInfo)    
    const dronesInfo = computed(() => store.getters['drone/getDroneInfo'] )

    /****** 初始化 所有drone 的狀態資訊 *****/ 
    // 定義要顯示的drone資訊基本欄位
    const droneInfoInit = { 
      timeStamp: '', roll: null, yaw: null, pitch: null, voltage: null, percentage: null, hpop: null, gpsCount: null, mode: '', isArmed: '', heading: null, latitude: null, longitude: null, altitude: null, speed: null, status: { altitude: 3, isTakeoff: false }, destination: { lng: null, lat: null} 
    }
    // 初始化所有drone 的狀態資訊欄
    // const userDrones = computed(()=> { return user.value.droneId })
    const userDrones = user.value.droneId
    for (let i in userDrones) {
      const droneInfo = {
        [userDrones[i].id]: droneInfoInit
      }
      store.dispatch('drone/setDroneInfo', droneInfo)
    }
    /********************************** */

    const showSelected = (id) => {
      const droneInfo = store.getters['drone/getSpecificDroneInfo'](id)
      if (droneInfo === undefined) {
        console.log('Need to open your drone to get info')
      } else {
        console.log('Show information of the drone')
      }
    }
    const mouseOverEvent = (droneID) => {
      // console.log('mouseover')
      let droneGIF = document.getElementById(droneID)
      droneGIF.style.width = '150px'
    }

    const mouseOutEvent = (droneID) => {
      let droneGIF = document.getElementById(droneID)
      droneGIF.style.width = '100px'
    }

    return {
      dronesInfo,
      userDrones,
      
      showSelected,
      mouseOverEvent,
      mouseOutEvent,
    }
  }
}
</script>


<style lang="scss" scoped>
.container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  scrollbar-width: none;
  // white-space: nowrap;

  .box {
    // position: relative;
    width: 20%;
    height: 90%;
    padding: 1%;
    flex-shrink: 0;
  }

  .box:hover img {
    transform: scale(1.1);
  }
  .cover-fit {
    width: 100%;
    height: 100%;
    // object-fit: cover;
    // margin-left: 30px;
  }
  img {
    // display: flex;
    width: 8em;
    align-items: center;
    border-radius: 50%;
    border-style: solid;
    border-color: red;
    transition: 0.5s;
  }
}
</style>

<style lang="scss" >
.popover .ant-popover-content .ant-popover-inner .ant-popover-inner-content {
  background-color: transparent;
}
.popover .ant-popover-content .ant-popover-inner .ant-popover-title {
  background-color: transparent;
  color: blue;
}
.popover .ant-popover-content .ant-popover-inner .ant-popover-inner-content {
  background-color: transparent;
}
.popover .ant-popover-content .ant-popover-inner {
  // border-radius: 20px;
  background-color: transparent;
}
// .popover .ant-popover-content {
//   border-radius: 10px;
// }
.container {
  overflow-x: scroll;
}
.popover {
  width: 220px;
  height: 110px;
  background-color: #545353ca;
  // overflow-y: auto;
  top: 0.5rem;
  left: 0.5rem;
  position: relative;
  z-index: 150;
  padding: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  backdrop-filter: blur(5px);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  color: #ff0000;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 800px) {
    font-size: 1rem;
    width: 250px;
    height: auto;
  }

  &::before {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  span {
    color: blue;
    font-weight: 600;
    margin-right: 5px;
  }
}
</style>