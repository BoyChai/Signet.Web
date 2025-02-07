<template>
  <n-breadcrumb>
    <n-breadcrumb-item> 后台面板 </n-breadcrumb-item>
    <n-breadcrumb-item v-for="(v, i) in route.meta.breadcrumb" :key="i + 1">
      {{ v }}
    </n-breadcrumb-item>
  </n-breadcrumb>
</template>

<script setup>
import { useRoute } from "vue-router";
const route = useRoute();
</script>
