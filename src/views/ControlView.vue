<template>
  <n-split
    direction="vertical"
    :max="0.06"
    :min="0.06"
    :default-size="0.06"
    :disabled="true"
    style="height: 100%"
  >
    <template #1>
      <div
        style="
          box-sizing: border-box;
          border-bottom: 1px solid rgb(239, 239, 245);
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 15px;
        "
      >
        <div style="display: flex; align-items: center">
          <img
            src="../../public/Deft.png"
            style="height: 40px; width: 40px; margin-right: 10px"
          />
          <h2 style="font-size: 30px; margin: 0">Signet 卡密校验</h2>
          <Breadcrumb style="margin-left: 10px"></Breadcrumb>
        </div>
        <div style="left: right; margin-right: 10px; font-size: 15px">
          <span style="margin-right: 20px; font-size: 20px; font-weight: 600">{{
            user
          }}</span>
          <span style="margin-right: 20px">{{ role }}</span>
          <n-button
            @click="updatePassStatus = true"
            style="margin-right: 20px"
            quaternary
          >
            修改密码
          </n-button>
          <n-button @click="logOut" style="margin-right: 20px" quaternary>
            退出登录
          </n-button>
          <span> Signet-{{ version }}</span>
        </div>
      </div>
    </template>

    <template #2>
      <n-split
        direction="horizontal"
        style="height: 100%"
        :max="0.13"
        :disabled="true"
        :default-size="isMobile ? 0 : 0.13"
      >
        <template #1>
          <div
            v-if="!isMobile"
            style="
              box-sizing: border-box;
              border-right: 1px solid rgb(239, 239, 245);
              height: 100%;
            "
          >
            <Menu />
          </div>
        </template>
        <template #2>
          <div style="background-color: #f5f7f9; height: 100%; width: 100%">
            <router-view style="height: 100%" />
          </div>
        </template>
      </n-split>
    </template>
  </n-split>

  <!-- 修改密码 -->
  <n-drawer v-model:show="updatePassStatus" :width="502">
    <n-drawer-content>
      <template #header> <h3>修改当前用户密码</h3> </template>
      <n-input
        style="margin-top: 20px"
        type="password"
        show-password-on="mousedown"
        v-model:value="oldPassword"
        placeholder="旧密码"
      />
      <n-input
        style="margin-top: 20px"
        type="password"
        show-password-on="mousedown"
        v-model:value="newPassword"
        placeholder="新密码"
      />
      <div style="margin-top: 50px">
        <n-button @click="updatePassStatus = false">取消</n-button>
        <n-button style="margin-left: 20px" @click="updatePass"
          >修改密码</n-button
        >
      </div>
    </n-drawer-content>
  </n-drawer>
</template>
<script setup>
import { useWindowSize } from "@vueuse/core";

import { watch, ref, getCurrentInstance, computed } from "vue";
import Menu from "@/components/ControlMenu.vue";
import Breadcrumb from "@/components/ControlBreadcrumb.vue";
import { useNotification } from "naive-ui";
import { useRouter } from "vue-router";
const { width } = useWindowSize();

const isMobile = computed(() => width.value < 768);

const router = useRouter();

const notification = useNotification();
const notify = (type, title, text) => {
  notification[type]({
    content: title,
    meta: text,
    duration: 2500,
    keepAliveOnHover: true,
  });
};

const logOut = () => {
  localStorage.removeItem("jwtToken");
  window.location.href = "/login";
};

// 引入axios
const { proxy } = getCurrentInstance();
const axios = proxy.$axios;

// 修改密码
const updatePassStatus = ref(false);
const oldPassword = ref("");
const newPassword = ref("");

const updatePass = () => {
  axios
    .post("/api/user/changePassById", {
      oldpass: oldPassword.value,
      newpass: newPassword.value,
    })
    .then((res) => {
      notify("success", "信息", "修改用户密码成功,请重新登录");
      updatePassStatus.value = false;
      oldPassword.value = "";
      newPassword.value = "";
      localStorage.removeItem("jwtToken");
      router.push("/login");
    })
    .catch((err) => {
      notify("error", "错误", err.request.response);
    });
};

// 获取版本信息
const version = ref("");
const getVersion = () => {
  axios
    .get("/api/public/version")
    .then((res) => {
      version.value = res.data;
    })
    .catch((err) => {
      notify("error", "错误", err.request.response);
    });
};
getVersion();
const user = ref("admin");
const role = ref("超级管理员");
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to parse JWT:", error);
    return null;
  }
};
const getUserInfo = () => {
  var data = parseJwt(localStorage.getItem("jwtToken"));
  if (!data) {
    return;
  }
  user.value = data.name;
  if (data.role == "0") {
    role.value = "超级管理员";
  }
  if (data.role == "1") {
    role.value = "管理员";
  }
  if (data.role == "2") {
    role.value = "代理";
  }
};
getUserInfo();
</script>
<style>
html,
body,
#app {
  height: 100%;
}
</style>
