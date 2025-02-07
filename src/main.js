import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// 通用字体
import "vfonts/Lato.css";
// 等宽字体
import "vfonts/FiraCode.css";

// naive-ui
import naive from "naive-ui";
const app = createApp(App);
app.use(naive);

// pinia
import { createPinia } from "pinia";
const pinia = createPinia();
app.use(pinia);

// axios
import axios from "axios";
// 动态获取配置
axios
  .get("/config.json")
  .then((response) => {
    const config = response.data;
    axios.defaults.baseURL = config.baseURL;

    // 请求拦截
    axios.interceptors.request.use((config) => {
      let token = localStorage.getItem("jwtToken");
      if (token) {
        config.headers["Authorization"] = token;
      }
      return config;
    });

    // 响应拦截
    axios.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        if (error.response.status === 401) {
          localStorage.removeItem("jwtToken");
          router.push("/Login");
        }
        return Promise.reject(error);
      }
    );

    // 将 axios 添加到全局属性中
    app.config.globalProperties.$axios = axios;

    // 初始化路由和挂载应用
    app.use(router);
    app.mount("#app");
  })
  .catch((error) => {
    console.error("无法获取配置文件:", error);
    // 处理错误，可能使用默认配置或其他逻辑
  });
