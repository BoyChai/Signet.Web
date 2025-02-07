<template>
  <n-notification-provider>
    <n-dialog-provider>
      <LoginView v-if="route.meta.Auth" />
      <ControlView v-else />
    </n-dialog-provider>
  </n-notification-provider>
</template>

<script setup>
import ControlView from "@/views/ControlView.vue";
import LoginView from "@/views/LoginView.vue";

import { useRoute } from "vue-router";
const route = useRoute();
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh; /* 使用vh单位确保占据视口高度 */
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
