<template>
  <div class="login-wrapper">
    <div class="login-container">
      <n-card class="login-card" :bordered="false">
        <template #header>
          <h1 class="title">Signet-卡密校验</h1>
        </template>

        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          class="login-form"
          @submit.prevent="login"
        >
          <n-form-item path="name">
            <n-input
              v-model:value="formData.name"
              type="text"
              placeholder="账号"
              clearable
              class="input-field"
            />
          </n-form-item>

          <n-form-item path="pass">
            <n-input
              v-model:value="formData.pass"
              type="password"
              show-password-on="click"
              placeholder="密码"
              clearable
              class="input-field"
            />
          </n-form-item>

          <n-button
            type="info"
            size="large"
            block
            :loading="loading"
            :disabled="loading"
            @click="login"
            class="login-btn"
          >
            登录
          </n-button>
        </n-form>
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted } from "vue";
import { useNotification, NForm, NFormItem } from "naive-ui";
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

const formData = ref({
  name: "",
  pass: "",
});
const loading = ref(false);
const formRef = ref(null);

const rules = {
  name: [{ required: true, message: "请输入账号", trigger: "blur" }],
  pass: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

// 检查是否已登录
onMounted(() => {
  if (localStorage.getItem("jwtToken")) {
    notify("success", "跳转", "您已经登录过了");
    router.push("/");
  }
});

// 登录请求
const login = async () => {
  if (loading.value) return;

  try {
    await formRef.value?.validate();
    loading.value = true;

    const raw = JSON.stringify({
      name: formData.value.name,
      pass: formData.value.pass,
    });

    const res = await axios.post("/api/user/login", raw);
    notify("success", "信息", "登录成功");
    localStorage.setItem("jwtToken", res.data);
    router.push("/");
  } catch (err) {
    if (err instanceof Error) {
      notify("error", "错误", "登陆失败，请检查账号或密码");

      return;
    }
    const errorMsg =
      err.response?.data?.message || "登录失败，请检查账号或密码";
    notify("error", "错误", errorMsg);
    formData.value.name = "";
    formData.value.pass = "";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 24px;
  transition: transform 0.3s ease;
}

.login-card:hover {
  transform: translateY(-2px);
}

.title {
  text-align: center;
  margin: 0 0 24px;
  font-size: 24px;
  color: #2c3e50;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-field {
  height: 48px;
  border-radius: 8px;
  /* 字体剧中并且放大 */
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 16px;
  border: 1px solid #dcdcdc;
  transition: all 0.3s ease;
}

.input-field:hover {
  font-size: 16px;
  transition: all 0.3s ease;
}

.input-field:focus {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.login-btn {
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  margin-top: 8px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .login-container {
    max-width: 90%;
  }

  .login-card {
    padding: 20px;
  }

  .title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .input-field {
    height: 44px;
    font-size: 14px;
  }

  .login-btn {
    height: 44px;
    font-size: 14px;
  }
}
</style>
