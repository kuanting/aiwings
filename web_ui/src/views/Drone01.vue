<template>
    <div class="drone-page-root">
        <div class="map-container">
            <Mapbox />
        </div>
        <div class="covers">
            <div class="top-box">
                <div class="topleft-box">
                    <management-title/>
                </div>
                <div class="topright-box">
                    <management-header/>
                </div>
            </div>
            <div class="bottom-box">
                <div class="bottomleft-box">
                    <Stream />
                </div>
                <div class="bottomcenter-box"></div>
                <div class="bottomright-box">
                    <Control/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Mapbox from '../components/Mapbox/Mapbox.vue'
import ManagementTitle from '../components/Header/ManagementTitle.vue'
import ManagementHeader from '../components/Header/ManagementHeader.vue'
import Control from '../components/Control/Control.vue'
import Stream from '../components/Stream/Stream.vue'

export default {
    name: 'Drone',
    components: { Mapbox, ManagementTitle, ManagementHeader, Stream, Control},
    setup(){
        // const store = useStore()

    }
}

</script>

<style lang="scss" scoped>
.drone-page-root {
    width: 100vw;
    height: 100vh;

    .map-container {
        width: 100%;
        height: 100%;
        // background-color: aquamarine;
        position: relative;
        z-index: 88;
    }

    .covers {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: space-between;
        flex-direction: column;

        .top-box {
            display: flex;
            justify-content: space-between;
            padding: 40px;

            &>* {
                border-radius: 30px;
                z-index: 99;
            }

            .topleft-box {
                width: 220px;
                height: 50px;
                background: #545353ca;
            }
            .topright-box {
                width: 300px;
                height: 50px;
                background: #545353ca;
            }
        }

        .bottom-box {
            display: flex;
            align-items: flex-end ;     
            
            &>* {
                border-radius: 40px;
                z-index: 99;
            }

            &>*:not(:nth-child(1)) {
                margin-left: 20px;
            }

            .bottomleft-box {
                width: 400px;
                height: 400px;
                background-color: #545353ec;

                background-image: url('../assets/live-stream.png');
                background-size: 400px 400px ;
                @media (min-width: 300px) {
                    visibility: visible;
                }
            }

            .bottomcenter-box {
                width: 800px;
                height: 60%;
                // position: absolute;
                // bottom: 0px;
                // left: 400px;
                background-color: #545353ec;
            }

            .bottomright-box {
                width: 350px;
                height: 400px;
                // position: absolute;
                // bottom: 0px;
                // right:10px;
                background-color: #545353ec;
            }
        }
    }
}
</style>