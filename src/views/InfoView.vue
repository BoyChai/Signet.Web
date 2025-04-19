<template>
  <div class="page-wrapper">
    <n-card
      title="服务信息"
      class="info-card"
      :header-style="{ textAlign: 'left', fontSize: '24px', fontWeight: '600' }"
      :bordered="false"
    >
      <n-grid :cols="gridCols" :x-gap="8" :y-gap="8" responsive="screen">
        <n-gi>
          <div class="info-section">
            <h3 class="section-title">数据信息</h3>
            <n-space vertical size="small">
              <n-space justify="space-between" align="center">
                <span class="label">数据库类型:</span>
                <span class="value">{{ info.sql_type || "未知" }}</span>
              </n-space>
              <n-space justify="space-between" align="center">
                <span class="label">数据库主机:</span>
                <span class="value">{{ info.sql_host || "未知" }}</span>
              </n-space>
              <n-space justify="space-between" align="center">
                <span class="label">数据库名称:</span>
                <span class="value">{{ info.db_name || "未知" }}</span>
              </n-space>
              <n-space justify="space-between" align="center">
                <span class="label">数据库端口:</span>
                <span class="value">{{ info.db_port || "未知" }}</span>
              </n-space>
            </n-space>
          </div>
        </n-gi>
        <n-gi>
          <div class="info-section">
            <h3 class="section-title">连接信息</h3>
            <n-space vertical size="small">
              <n-space justify="space-between" align="center">
                <span class="label">HTTP:</span>
                <span class="value">开启</span>
              </n-space>
              <n-space justify="space-between" align="center">
                <span class="label">Socket:</span>
                <span class="value">{{
                  getStartStatus(info.socket_enabled)
                }}</span>
              </n-space>
              <n-space justify="space-between" align="center">
                <span class="label">HTTP端口:</span>
                <span class="value">{{ info.svc_port || "未知" }}</span>
              </n-space>
              <n-space justify="space-between" align="center">
                <span class="label">Socket端口:</span>
                <span class="value">{{ info.socket_port || "未知" }}</span>
              </n-space>
              <n-space justify="space-between" align="center">
                <span class="label">Socket超时时间:</span>
                <span class="value">{{ info.socket_timeout || "未知" }}</span>
              </n-space>
              <n-space justify="space-between" align="center">
                <span class="label">超级管理员:</span>
                <span class="value">{{ info.super_user_name || "未知" }}</span>
              </n-space>
            </n-space>
          </div>
        </n-gi>
        <n-gi>
          <div class="info-section">
            <h3 class="section-title">服务公钥</h3>
            <div class="public-key-container">
              <pre class="public-key-text">{{
                info.public_key || "暂无公钥"
              }}</pre>
              <n-button
                size="small"
                type="primary"
                class="copy-btn"
                @click="copyPublicKey"
              >
                复制
              </n-button>
            </div>
          </div>
        </n-gi>
      </n-grid>
    </n-card>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";
import { useNotification } from "naive-ui";

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

const info = ref({});

const getAppInfo = () => {
  axios
    .get("/api/stats/app_info")
    .then((res) => {
      info.value = res.data || {};
      console.log(info.value);
    })
    .catch((err) => {
      notify("error", "错误", err.request?.response || "获取服务信息失败");
    });
};
getAppInfo();

const getStartStatus = (t) => (t ? "开启" : "关闭");

const copyPublicKey = () => {
  if (!info.value.public_key) {
    notify("warning", "提示", "暂无公钥可复制");
    return;
  }
  navigator.clipboard
    .writeText(info.value.public_key)
    .then(() => {
      notify("success", "成功", "公钥已复制到剪贴板");
    })
    .catch(() => {
      notify("error", "错误", "复制失败，请手动复制");
    });
};

// 响应式网格列数
const gridCols = {
  xs: 1, // 小于 640px，1列
  s: 2, // 小于 1024px，2列
  m: 3, // 小于 1440px，3列
  l: 3, // 大于等于 1440px，3列
};
</script>

<style scoped>
.page-wrapper {
  padding: 24px;
  min-height: 100vh;
  background: #f5f7f9;
  overflow-y: auto;
}

.info-card {
  max-width: 1400px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background: white;
  transition: transform 0.3s ease;
  padding: 24px;
}

.info-card:hover {
  transform: translateY(-2px);
}

.info-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e8ecef;
  transition: box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.info-section:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.label {
  font-size: 16px;
  color: #555;
  font-weight: 500;
  white-space: nowrap;
}

.value {
  font-size: 16px;
  color: #333;
  text-align: right;
  overflow-wrap: break-word;
  max-width: 70%;
}

.public-key-container {
  position: relative;
  flex: 1;
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e8ecef;
  border-radius: 6px;
  padding: 16px;
  background: #fafafa;
  margin-top: 12px;
}

.public-key-text {
  margin: 0;
  font-size: 14px;
  color: #555;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

@media (max-width: 768px) {
  .page-wrapper {
    padding: 10px;
  }

  .info-card {
    max-width: 100%;
    border-radius: 8px;
    padding: 16px;
  }

  .info-section {
    padding: 12px;
    min-height: auto;
  }

  .section-title {
    font-size: 16px;
    margin-bottom: 10px;
  }

  .label,
  .value {
    font-size: 12px;
  }

  .value {
    max-width: 50%;
  }

  .public-key-container {
    min-height: 150px;
    max-height: 200px;
    padding: 10px;
  }

  .public-key-text {
    font-size: 12px;
  }

  .copy-btn {
    top: 6px;
    right: 6px;
  }
}

@media (min-width: 1200px) {
  .page-wrapper {
    padding: 32px;
  }

  .info-card {
    padding: 32px;
  }

  .info-section {
    padding: 24px;
  }

  .section-title {
    font-size: 22px;
  }

  .label,
  .value {
    font-size: 17px;
  }
}
</style>
