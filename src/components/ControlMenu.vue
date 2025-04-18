<template>
  <n-menu
    v-model:value="activeKey"
    :root-indent="36"
    :indent="12"
    :options="menuOptions"
    :mode="horizontal"
  />
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { getMenuOptions, parseJwt } from "./menuConfig";

const route = useRoute();
const activeKey = ref(route.name);
const userRole = ref(0);

const getUserInfo = () => {
  const data = parseJwt(localStorage.getItem("jwtToken"));
  if (!data) return;
  userRole.value = data.role;
};

getUserInfo();
watch(
  () => route.name,
  (newName) => {
    activeKey.value = newName;
  }
);

const menuOptions = getMenuOptions(userRole);
</script>
