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
          padding: 8px 12px;
        "
      >
        <!-- Mobile menu button (now on left) -->
        <div v-if="isMobile" style="flex-shrink: 0; margin-right: 10px">
          <n-button @click="showMobileMenu = true" quaternary size="tiny">
            <template #icon>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 12H21"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M3 6H21"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M3 18H21"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </template>
          </n-button>
        </div>
        <!-- Logo and title -->
        <div style="flex-grow: 1; display: flex; align-items: center">
          <div v-if="!isMobile" style="display: flex; align-items: center">
            <img
              src="../../public/Deft.png"
              style="height: 40px; width: 40px; margin-right: 10px"
            />
            <h2 style="font-size: 30px; margin: 0">Signet 卡密校验</h2>
          </div>

          <div
            v-if="isMobile"
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
            "
          >
            <img
              src="../../public/Deft.png"
              style="height: 30px; width: 30px; margin-right: 8px"
            />
            <h2 style="font-size: 18px; margin: 0; white-space: nowrap">
              Signet 卡密校验
            </h2>
          </div>
        </div>

        <!-- Menu items -->
        <div
          v-if="!isMobile"
          style="display: flex; align-items: center; gap: 20px"
        >
          <span style="font-size: 20px; font-weight: 600">{{ user }}</span>
          <span>{{ role }}</span>
          <n-button @click="updatePassStatus = true" quaternary>
            修改密码
          </n-button>
          <n-button @click="logOut" quaternary> 退出登录 </n-button>
          <span style="font-size: 12px">Signet-{{ version }}</span>
        </div>

        <!-- Mobile dropdown menu -->
        <div v-if="isMobile" style="flex-shrink: 0">
          <n-dropdown
            trigger="click"
            :options="mobileOptions"
            @select="handleMobileSelect"
          >
            <n-button quaternary size="tiny">
              <template #icon>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </template>
            </n-button>
          </n-dropdown>
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

  <!-- 移动端菜单 -->
  <ControlMobileMenu
    v-model:show="showMobileMenu"
    @close="showMobileMenu = false"
  />

  <!-- 修改密码 -->
  <n-drawer
    v-model:show="updatePassStatus"
    :width="isMobile ? '100%' : 502"
    placement="bottom"
  >
    <n-drawer-content>
      <template #header> <h3>修改当前用户密码</h3> </template>
      <div :style="isMobile ? 'padding: 16px' : ''">
        <n-input
          style="margin-top: 16px"
          type="password"
          show-password-on="mousedown"
          v-model:value="oldPassword"
          placeholder="旧密码"
          :size="isMobile ? 'large' : 'medium'"
        />
        <n-input
          style="margin-top: 16px"
          type="password"
          show-password-on="mousedown"
          v-model:value="newPassword"
          placeholder="新密码"
          :size="isMobile ? 'large' : 'medium'"
        />
        <div
          style="
            margin-top: 24px;
            display: flex;
            justify-content: space-between;
          "
        >
          <n-button
            @click="updatePassStatus = false"
            :size="isMobile ? 'large' : 'medium'"
            style="flex: 1; margin-right: 8px"
          >
            取消
          </n-button>
          <n-button
            @click="updatePass"
            type="primary"
            :size="isMobile ? 'large' : 'medium'"
            style="flex: 1; margin-left: 8px"
          >
            修改密码
          </n-button>
        </div>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { useWindowSize } from "@vueuse/core";
import { ref, getCurrentInstance, computed } from "vue";
import { NDropdown } from "naive-ui";
import Menu from "../components/ControlMenu.vue";
import ControlMobileMenu from "../components/ControlMobileMenu.vue";
import { useNotification } from "naive-ui";
import { useRouter } from "vue-router";
import { Menu as MenuIcon } from "@vicons/ionicons5";

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);
const showMobileMenu = ref(false);

const mobileOptions = [
  {
    label: "修改密码",
    key: "updatePass",
  },
  {
    label: "退出登录",
    key: "logout",
  },
];

const handleMobileSelect = (key) => {
  if (key === "updatePass") {
    updatePassStatus.value = true;
  } else if (key === "logout") {
    logOut();
  }
};

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

@media (max-width: 768px) {
  .n-split-pane-1 {
    padding: 0 !important;
  }

  .n-split-pane-2 {
    padding: 0 !important;
  }
}
</style>
