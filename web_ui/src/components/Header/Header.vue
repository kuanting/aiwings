<template>
  <header>
    <nav>
      <router-link to="/" class="logo">
        <img src="../../assets/logo.svg" alt="logo-icon" class="logo__icon" />
        <span class="logo__title">AIwings</span>
      </router-link>

      <a-menu class="link" :selected-keys="current" mode="horizontal">
        <a-menu-item v-if="!isAuth" key="login">
          <router-link to="/login">Log in</router-link>
        </a-menu-item>
        <a-menu-item v-if="!isAuth" key="signup">
          <router-link to="/signup">Sign up</router-link>
        </a-menu-item>
        <a-menu-item v-if="isAuth" key="drone">
          <router-link to="/drone">
            <ControlOutlined />
          </router-link>
        </a-menu-item>
        <a-menu-item v-if="isAuth && isAdmin" key="management">
          <router-link to="/management">
            <ClusterOutlined />
            Drone Management
          </router-link>
        </a-menu-item>
        <a-sub-menu v-if="isAuth">
          <template #title>
            <span>
              <UserOutlined />
              {{ username }}
            </span>
          </template>
          <a-menu-item-group>
            <a-menu-item key="account">
              <router-link to="account">Account</router-link>
            </a-menu-item>
            <a-menu-item key="drone">
              <router-link to="enroll">Add drones</router-link>
            </a-menu-item>
            <a-menu-item key="records">
              <router-link to="records">Records</router-link>
            </a-menu-item>
            <a-menu-item key="logout">
              <router-link to="logout">Logout</router-link>
            </a-menu-item>
          </a-menu-item-group>
        </a-sub-menu>
      </a-menu>
    </nav>
  </header>
</template>

<script>
import { ref } from '@vue/reactivity'
import { useRoute } from 'vue-router'
import {
  ControlOutlined,
  UserOutlined,
  ClusterOutlined
} from '@ant-design/icons-vue'
import { computed, watch } from '@vue/runtime-core'
import { useStore } from 'vuex'
export default {
  name: 'Header',
  components: {
    ControlOutlined,
    UserOutlined,
    ClusterOutlined
  },
  setup() {
    const route = useRoute()
    const store = useStore()
    const current = ref([])
    const isAuth = computed(() => store.getters.getIsAuth)
    const isAdmin = computed(() => store.getters.getIsAdmin)
    const username = computed(() => store.getters.getUsername)

    // header nav link active match
    watch(
      () => route.name,
      (value) => {
        const currentRoute = value.toLowerCase()
        current.value = [currentRoute]
      }
    )
    console.log(isAuth, isAdmin, username)
    return {
      current,
      isAuth,
      isAdmin,
      username
    }
  }
}
</script>

<style lang="scss" scope>
header {
  position: fixed;
  width: 100%;
  height: 60px;
  padding: 0 10px;
  background-color: #fff;
  box-shadow: 0 1px 4px 2px rgba(0, 0, 0, 0.1);
  z-index: 500;

  @media (min-width: 768px) {
    padding: 0 50px;
  }

  nav {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;

    .logo {
      display: flex;
      .logo__icon {
        width: 25px;
        height: 25px;
        margin-right: 10px;
        @media (min-width: 480px) {
          width: 30px;
          height: 30px;
        }
      }
      .logo__title {
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
}
</style>
