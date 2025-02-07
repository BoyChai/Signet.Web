<template>
  <div style="height: 140px"></div>
  <n-result
    status="418"
    title="开发中"
    description="此页面正在开发中，请注意版本动向"
    size="huge"
  >
    <template #footer>
      <n-button @click="router.push('/')">我要回首页</n-button>
    </template>
  </n-result>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<style></style>
