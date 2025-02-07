<template>
  <div style="background-color: #f5f7f9; padding: 20px">
    <n-card
      title="服务信息"
      :header-style="{ textAlign: 'left', fontSize: '24px', fontWeight: '600' }"
      :segmented="{ content: true }"
      style="
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      "
    >
      <n-grid x-gap="12" :cols="3">
        <n-gi>
          <div class="card">
            <div class="card-title">数据信息</div>
            <ul class="list">
              <li class="list-item key-value">
                <div>数据库类型</div>
                <div>{{ info.sql_type }}</div>
              </li>
              <li class="list-item key-value">
                <div>数据库主机</div>
                <div>{{ info.sql_host }}</div>
              </li>
              <li class="list-item key-value">
                <div>数据库名称</div>
                <div>{{ info.db_name }}</div>
              </li>
              <li class="list-item key-value">
                <div>数据库端口</div>
                <div>{{ info.db_port }}</div>
              </li>
            </ul>
          </div>
        </n-gi>
        <n-gi>
          <div class="card">
            <div class="card-title">连接信息</div>
            <ul class="list">
              <li class="list-item key-value">
                <div>HTTP</div>
                <div>开启</div>
              </li>
              <li class="list-item key-value">
                <div>Socket</div>
                <div>{{ getStartStatus(info.socket_enabled) }}</div>
              </li>
              <li class="list-item key-value">
                <div>HTTP端口</div>
                <div>{{ info.svc_port }}</div>
              </li>
              <li class="list-item key-value">
                <div>Socket端口</div>
                <div>{{ info.socket_port }}</div>
              </li>
              <li class="list-item key-value">
                <div>Socket超时时间</div>
                <div>{{ info.socket_timeout }}</div>
              </li>
              <li class="list-item key-value">
                <div>超级管理员</div>
                <div>{{ info.super_user_name }}</div>
              </li>
            </ul>
          </div>
        </n-gi>
        <n-gi>
          <div class="card">
            <div class="card-title">服务公钥</div>
            <div
              style="
                height: 200px;
                overflow-y: auto;
                border: 1px solid #d0d0d0;
                padding: 10px;
                background-color: #f0f0f0;
                display: flex;
                justify-content: center;
                align-items: center;
              "
            >
              <pre
                style="
                  white-space: pre-wrap;
                  word-wrap: break-word;
                  text-align: left;
                "
                >{{ info.public_key }}</pre
              >
            </div>
          </div>
        </n-gi>
      </n-grid>
    </n-card>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();
const axios = proxy.$axios;
const info = ref("");
const getAppInfo = () => {
  axios
    .get("/api/stats/app_info")
    .then((res) => {
      info.value = res.data;
      console.log(info.value);
    })
    .catch((err) => {
      notify("error", "错误", err.request.response);
    });
};
getAppInfo();
const getStartStatus = (t) => (t ? "开启" : "关闭");
</script>

<style>
.card {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #d0d0d0;
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
.card-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}
.key-value {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.list {
  padding: 0;
  list-style: none;
}
.list-item {
  margin-bottom: 6px;
  color: #555;
}
</style>
