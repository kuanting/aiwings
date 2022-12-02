<template>
  <section class="banner">
    <div
      class="banner__title"
      data-aos="fade-down"
      data-aos-duration="1000"
      data-aos-once="true"
    >
      Drone Cloud Platform
    </div>
    <router-link to="/drone" class="banner__button">
      Enter Control Panel
    </router-link>
  </section>
  <section class="abstract">
    <iframe
      class="abstract__video"
      data-aos="fade-left"
      data-aos-duration="1000"
      data-aos-once="true"
      src="https://www.youtube.com/embed/fAjQ7rRfd60"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
    <div
      class="abstract__content"
      data-aos="fade-right"
      data-aos-duration="1000"
      data-aos-once="true"
    >
      <h1>Drone Cloud Platform</h1>
      <p>
        Drone Cloud Platform is a drone control Saas service provider. Pilots
        can control their drone through our platform, users just need to connect
        the drone through our android app, after that, you can monitor your
        drone information on platform.
      </p>
    </div>
  </section>
  <section class="step">
    <div class="step__items">
      <div
        class="step__items--content"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-offset="300"
        data-aos-once="true"
      >
        <div class="step__items--title">1.Install Our App</div>
        <img class="step__items--image" src="../assets/qrcode_github.com.png" />
      </div>
      <div
        class="step__items--content"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-offset="300"
        data-aos-once="true"
      >
        <div class="step__items--title">2.Signup our service</div>
        <img class="step__items--image" src="../assets/sign-up.png" />
      </div>
      <div
        class="step__items--content"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-offset="300"
        data-aos-once="true"
      >
        <div class="step__items--title">3.Take a Flight!</div>
        <img class="step__items--image" src="../assets/fly-drone.png" />
      </div>
    </div>
  </section>
  <footer>
    <small>
      &copy; 2021 NTUT AiotLab 208 - Drone Cloud Platform. All Rights Reserved
    </small>
    <small>
      Designed by NTUT AiotLab Group
      <a
        class="link__github"
        target="_blank"
        rel="noopener"
        href="https://github.com/waiting33118"
        ><GithubFilled
      /></a>
    </small>
  </footer>
</template>

<script>
import Header from '../components/Header/Header.vue'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { GithubFilled } from '@ant-design/icons-vue'
import { onMounted } from '@vue/runtime-core'
export default {
  name: 'Introduction',
  components: {
    GithubFilled,
    Header
  },
  setup() {
    onMounted(() => {
      AOS.init()
    })
  }
}
</script>

<style lang="scss" scoped>
.banner {
  height: 100vh;
  background-image: url('../assets/intro.jpg');
  background-size: cover;
  background-position: 50% 30%;
  background-repeat: no-repeat;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .banner__title {
    color: #1890ff;
    text-align: center;
    font-weight: 700;
    font-size: 3rem;
    text-shadow: 3px 3px 5px rgb(255, 255, 255);
    margin-bottom: 15rem;
    @media (min-width: 800px) {
      font-size: 4rem;
    }
  }

  .banner__button {
    z-index: 100;
    border-radius: 500px;
    text-align: center;
    line-height: 50px;
    width: 180px;
    height: 50px;
    background-color: #1890ff;
    color: #fff;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.7);
    transition: all 0.3s ease-in-out;

    &:hover {
      box-shadow: 0 4px 17px rgba(0, 0, 0, 0.7);
      transform: scale(1.1, 1.1);
    }
  }
}

.abstract {
  width: 100%;
  padding: 100px 1rem;
  display: flex;
  flex-flow: column wrap;
  align-items: center;

  @media (min-width: 676px) {
    flex-flow: row wrap;
    justify-content: space-evenly;
    align-items: center;
  }

  .abstract__video {
    width: 100%;
    max-width: 500px;
    aspect-ratio: 16 / 9;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.5);
    border-radius: 15px;
    margin-bottom: 3rem;
  }

  .abstract__content {
    width: 100%;
    @media (min-width: 535px) {
      width: 500px;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
    }
    p {
      font-size: 1rem;
    }
  }
}

.step {
  padding: 100px 1rem;
  width: 100%;
  background-image: url('../assets/intro2.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  .step__items {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-evenly;
    align-items: center;
    .step__items--content {
      width: 290px;
      height: 300px;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 2rem;
      box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 15);
      background-color: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(1.5px);
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: space-evenly;

      &:hover {
        transform: translate(0, -5%);
      }

      .step__items--title {
        font-size: 1.3rem;
        font-weight: 600;
      }
      .step__items--image {
        width: 200px;
        height: 200px;
      }
    }
  }
}

footer {
  width: 100%;
  height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fab187;

  .link__github {
    text-decoration: none;
    color: #000000;
  }
}
</style>
