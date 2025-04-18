<template>
  <Transition name="slide-fade">
    <div v-if="show" class="mobile-menu-container">
      <div class="mobile-menu-header">
        <div class="header-content">
          <n-button @click="$emit('close')" quaternary class="menu-button">
            <template #icon>
              <n-icon><Menu /></n-icon>
            </template>
          </n-button>
          <div class="title-area">
            <img src="/Deft.png" class="logo" />
            <div class="title">Signet</div>
          </div>
          <n-dropdown
            trigger="click"
            :options="userActions"
            @select="handleUserAction"
            class="user-dropdown"
          >
            <n-button quaternary>
              <template #icon>
                <n-icon><User /></n-icon>
              </template>
            </n-button>
          </n-dropdown>
        </div>
      </div>
      <n-menu
        v-model:value="activeKey"
        :root-indent="16"
        :indent="12"
        :options="menuOptions"
        :mode="vertical"
        @update:value="handleMenuSelect"
      />
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getMenuOptions, parseJwt } from "./menuConfig";
import { Menu, User } from "@vicons/ionicons5";

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);
const router = useRouter();
const route = useRoute();
const activeKey = ref(route.name);
const userRole = ref(0);

const userActions = [
  {
    label: "修改密码",
    key: "changePassword",
  },
  {
    label: "退出登录",
    key: "logout",
  },
];

const getUserInfo = () => {
  const data = parseJwt(localStorage.getItem("jwtToken"));
  if (!data) return;
  userRole.value = data.role;
};

const handleMenuSelect = (key) => {
  emit("close");
};

const handleUserAction = (key) => {
  if (key === "logout") {
    localStorage.removeItem("jwtToken");
    router.push("/login");
  } else if (key === "changePassword") {
    router.push("/change-password");
  }
};

getUserInfo();
watch(
  () => route.name,
  (newName) => {
    activeKey.value = newName;
  }
);

const menuOptions = computed(() => {
  const options = getMenuOptions(userRole).value;
  return options.map((option) => {
    const { icon, ...rest } = option;
    return rest;
  });
});
</script>

<style scoped>
.mobile-menu-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  z-index: 1000;
  padding: 16px;
  overflow-y: auto;
}

.n-menu {
  --n-item-height: 48px;
  --n-item-font-size: 16px;
  --n-item-padding: 0 16px;
}

/* 动画效果 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.mobile-menu-header {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 8px;
}

.menu-button,
.user-dropdown {
  padding: 0;
  margin: 0;
}

.menu-button :deep(.n-button__icon),
.user-dropdown :deep(.n-button__icon) {
  margin-right: 0;
}

.title-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logo {
  height: 32px;
}

.title {
  font-size: 1.125rem;
  font-weight: 500;
}

.menu-button {
  margin-right: 8px;
}

.user-dropdown {
  margin-left: 8px;
}
</style>
