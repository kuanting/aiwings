<template>
  <nav>
        <router-link to="/" class="logo">
          <img src="../../assets/logo.svg" alt="logo-icon" class="logo__icon__management" />
          <span class="__title">AiWings</span>
        </router-link>
  </nav>
</template>

<style lang="scss" scope>
nav{
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  .logo {
      display: flex;
      .logo__icon__management {
        width: 25px;
        height: 25px;
        margin-right: 10px;
        margin-left: 50px;
        background-image:linear-gradient(rgb(231, 216, 216), rgb(94, 94, 99));
        @media (min-width: 480px) {
          width: 30px;
          height: 30px;
        }
      }
      .__title {
        color: rgba(240, 255, 255, 1);
        justify-content: center;
        @media (max-width: 659px) {
          display: none;
        }
        @media (min-width: 660px) {
          width: 200px;
          font-size: 1rem;
          font-weight: 900;
        }
      }
    }
    .link {
      line-height: 60px;
      display: flex;
      justify-content: flex-end;
      width: 100%;
    }
  }


</style>