<template>
  <div class="container">
    <div v-for="(droneID, index) in droneArr" :key="index" class="box">
      <a-popover
        v-model:popOverState="popOverState"
        title="Drone Information"
        trigger="click"
        overlayClassName="popover"
      >
        <template #content>
          <h3>
            <span>{{ index }}</span>
          </h3>
          <li><span>TIME:</span> {{ droneArr[index].timeStamp }}</li>
          <li>
            <span>GPS:</span> {{ droneArr[index].longitude }}
            {{ droneArr[index].latitude }}
          </li>
          <li><span>HEADING:</span> {{ droneArr[index].heading }}</li>
          <li><span>ALTITUDE(m):</span> {{ droneArr[index].altitude }}</li>
          <li><span>SPEED(m/s): </span> {{ droneArr[index].speed }}</li>
          <li><span>STATUS:</span> {{ droneArr[index].isArmed }}</li>
          <li><span>MODE:</span> {{ droneArr[index].mode }}</li>
          <li><span>VOLTAGE:</span> {{ droneArr[index].voltage }}</li>
          <li><span>BATTERY:</span> {{ droneArr[index].percentage }}</li>
          <li><span>ROLL:</span> {{ droneArr[index].roll }}</li>
          <li><span>PITCH:</span> {{ droneArr[index].pitch }}</li>
          <li><span>GPS COUNTS:</span> {{ droneArr[index].gpsCount }}</li>
          <li><span>GPS HPOP:</span> {{ droneArr[index].hpop }}</li>
        </template>
          <img
            src="../../assets/drone1.gif"
            alt="drone_gif"
            @click="showSelected(index)"
            @mouseover="mouseOverEvent(index)"
            @mouseout="mouseOutEvent(index)"
            class="cover-fit"
          />
        {{ droneID.id }}
      </a-popover>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, reactive } from '@vue/runtime-core'
// import useMapbox from '../../hooks/useMapbox'
import { watch } from 'vue'

export default {
  name: 'droneInfoDashBoard',

  setup() {
    const store = useStore()
    const drone = computed(() => store.getters['drone/getDroneInfo'])
    let popOverState = reactive({})
    //Drone array store the each drone information
    let droneArr = reactive(drone.value)
    // console.log('droneARR: ', droneArr)
    // console.log('drone.value: ', drone.value)
    watch(drone, (newValue, oldValue) => {
      // console.log('new: ', newValue)
      // console.log('old: ', oldValue)
      //reactive 要用object.assign()
      Object.assign(droneArr, newValue)
      // console.log('after: ', droneArr)
    })

    // watch(droneArr, (newValue, oldValue) => {
    //   console.log('watch droneArr(old): ', oldValue)
    //   console.log('watch droneArr(new): ', newValue)
    // })
    for (let i in droneArr) {
      // console.log('droneARR:! ', droneArr)
      let droneInfo = droneArr[i]
      // console.log('droneInfo', droneInfo)
      popOverState[i] = droneInfo
      // console.log('popoverState', popOverState)
      // console.log('popoverState[i]:', popOverState[i])
    }

    const showSelected = (id) => {
      const droneInfo = store.getters['drone/getSpecificDroneInfo'](id)
      if (droneInfo === undefined) {
        console.log('Need to open your drone to get info')
      } else {
        console.log('d')
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
      droneArr,
      showSelected,
      popOverState,
      mouseOverEvent,
      mouseOutEvent,
      drone
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