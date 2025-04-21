import { h, computed } from "vue";
import { NIcon } from "naive-ui";
import { RouterLink } from "vue-router";

import { IosApps } from "@vicons/ionicons4";
import { IosContacts } from "@vicons/ionicons4";
import { IosCard } from "@vicons/ionicons4";
import { IosCube } from "@vicons/ionicons4";
import { IosCheckboxOutline } from "@vicons/ionicons4";
import { MdKey } from "@vicons/ionicons4";
import { MdInformationCircleOutline } from "@vicons/ionicons4";

export function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

export function getMenuOptions(userRole) {
  return computed(() =>
    [
      {
        label: () =>
          h(RouterLink, { to: { name: "home" } }, { default: () => "控制台" }),
        key: "home",
        icon: renderIcon(IosApps),
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "user" } },
            { default: () => "用户管理" }
          ),
        key: "user",
        icon: renderIcon(IosContacts),
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "project" } },
            { default: () => "项目管理" }
          ),
        key: "project",
        icon: renderIcon(IosCube),
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "card" } },
            { default: () => "卡密管理" }
          ),
        key: "card",
        icon: renderIcon(IosCard),
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "apikey" } },
            { default: () => "API密钥" }
          ),
        key: "apikey",
        icon: renderIcon(MdKey),
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "record" } },
            { default: () => "使用记录" }
          ),
        key: "record",
        icon: renderIcon(IosCheckboxOutline),
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "info" } },
            { default: () => "服务信息" }
          ),
        key: "info",
        icon: renderIcon(MdInformationCircleOutline),
      },
    ].filter(
      (option) =>
        userRole.value <= 1 || // 小于或等于1展示所有
        option.key === "home" || // 大于1时，保留控制台
        option.key === "card" || // 保留卡密管理
        option.key === "project" || // 保留卡密管理
        option.key === "apikey" || // 保留卡密管理
        option.key === "record" // 保留卡密管理
    )
  );
}

export function parseJwt(token) {
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
}
