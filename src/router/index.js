import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    meta: { breadcrumb: ["控制台"] },
    component: () => import("../views/ConsoleView.vue"),
  },
  {
    path: "/user",
    name: "user",
    meta: { breadcrumb: ["用户管理"] },
    component: () => import("../views/UserView.vue"),
  },
  {
    path: "/project",
    name: "project",
    meta: { breadcrumb: ["项目管理"] },
    component: () => import("../views/ProjectView.vue"),
  },
  {
    path: "/card",
    name: "card",
    meta: { breadcrumb: ["卡密管理"] },
    component: () => import("../views/CardView.vue"),
  },
  {
    path: "/record",
    name: "record",
    meta: { breadcrumb: ["使用记录"] },
    component: () => import("../views/RecordView.vue"),
  },
  {
    path: "/apikey",
    name: "apikey",
    meta: { breadcrumb: ["API密钥"] },
    component: () => import("../views/ApiKeyView.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
    meta: { Auth: true },
  },
  {
    path: "/info",
    name: "info",
    meta: { breadcrumb: ["服务信息"] },
    component: () => import("../views/InfoView.vue"),
  },
  {
    path: "/develop",
    name: "develop",
    component: () => import("../views/DevelopView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
