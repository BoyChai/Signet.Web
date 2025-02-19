<template>
  <div class="login_wrapper">
    <div class="login_content">
      <h1>Signet-卡密校验</h1>
      <!-- 输入框和密码框的校验 -->
      <n-input
        class="fillet input"
        v-model:value="name"
        type="text"
        placeholder="账号"
        :rules="[{ required: true, message: '请输入账号' }]"
      />
      <n-input
        class="fillet input"
        v-model:value="pass"
        style="margin-top: 12px"
        type="password"
        show-password-on="mousedown"
        placeholder="密码"
        :rules="[{ required: true, message: '请输入密码' }]"
      />
      <n-button
        class="btn"
        type="info"
        style="margin-top: 20px"
        @click="login"
        :loading="loading"
      >
        登入
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted } from "vue";
import { useNotification } from "naive-ui";
import router from "@/router";

const notification = useNotification();
const notify = (type, title, text) => {
  notification[type]({
    content: title,
    meta: text,
    duration: 2500,
    keepAliveOnHover: true,
  });
};

const { proxy } = getCurrentInstance();
const axios = proxy.$axios;

const name = ref("");
const pass = ref("");
const loading = ref(false);

// 检查是否已登录
onMounted(() => {
  if (localStorage.getItem("jwtToken")) {
    notify("success", "跳转", "您已经登录过了");
    router.push("/");
  }
});

// 登录请求
const login = async () => {
  if (loading.value) return; // 防止多次点击
  loading.value = true;

  const raw = JSON.stringify({
    name: name.value,
    pass: pass.value,
  });

  try {
    const res = await axios.post("/api/user/login", raw);
    notify("success", "信息", "登录成功");
    localStorage.setItem("jwtToken", res.data);
    router.push("/");
  } catch (err) {
    const errorMsg =
      err.response?.data?.message || "登录失败，请检查账号或密码";
    notify("error", "错误", errorMsg);
    name.value = "";
    pass.value = "";
  } finally {
    loading.value = false; // 结束 loading
  }
};
</script>

<style scoped>
.login_wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin-top: -5%;
}

.login_content {
  width: 90%;
  max-width: 400px;
  height: 300px;
  text-align: center;
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.fillet {
  border-radius: 6px;
}

.input {
  text-align: left;
  height: 45px;
  font-size: 16px;
  line-height: 45px;
  margin-bottom: 12px;
}

.btn {
  height: 40px;
  width: 100%;
  font-size: 16px;
}

@media (max-width: 600px) {
  .login_content {
    width: 85%;
    height: auto;
  }
}
</style>
