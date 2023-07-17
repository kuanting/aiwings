<template>
  <a-menu class="link" :selected-keys="current" mode="horizontal">
    <a-menu-item v-if="isAuth" key="video">
      <router-link to="/monitor">
        <VideoCameraOutlined style="color: rgba(240, 255, 255, 1)" />
      </router-link>
    </a-menu-item>
    <a-menu-item v-if="isAuth" key="drone">
      <router-link to="/drone">
        <ControlOutlined style="color: rgba(240, 255, 255, 1)" />
      </router-link>
    </a-menu-item>
    <a-menu-item v-if="isAuth" key="add">
      <router-link to="/enroll">
        <PlusCircleOutlined style="color: rgba(240, 255, 255, 1)" />
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
          <UserOutlined style="color: rgba(240, 255, 255, 1)" />
        </span>
      </template>
      <a-menu-item-group>
        <a-menu-item key="account">
          <router-link to="account">Account</router-link>
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
</template>

<script>
import { ref } from '@vue/reactivity'
import { useRoute } from 'vue-router'
import {
  ControlOutlined,
  UserOutlined,
  ClusterOutlined,
  VideoCameraOutlined,
  PlusCircleOutlined
} from '@ant-design/icons-vue'
import { computed, watch } from '@vue/runtime-core'
import { useStore } from 'vuex'
export default {
  name: 'Header',
  components: {
    ControlOutlined,
    UserOutlined,
    ClusterOutlined,
    VideoCameraOutlined,
    PlusCircleOutlined
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
.ant-menu {
  background: rgb(0 0 0 / 0%);
}

.link {
  line-height: 50px;
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>