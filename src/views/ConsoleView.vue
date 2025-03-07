<template>
  <div class="dashboard-container">
    <n-card
      title="控制台"
      :header-style="{ textAlign: 'left', fontSize: '20px' }"
      :segmented="{ content: true }"
      class="main-card"
    >
      <n-grid x-gap="12" :cols="colsConfig" class="stats-grid">
        <n-gi v-for="(stat, index) in stats" :key="index">
          <n-card
            :title="stat.title"
            :header-style="{ textAlign: 'left', fontSize: '18px' }"
            :segmented="{ content: true }"
            class="stat-card"
          >
            <n-statistic :label="stat.label" tabular-nums>
              <n-number-animation
                ref="numberAnimationInstRef"
                :from="0"
                :to="stat.value"
              />
              <template #suffix>{{ stat.suffix }}</template>
            </n-statistic>
            <n-space vertical class="stat-desc">
              {{ stat.description }}
            </n-space>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- 第二排：表格区域 -->
      <n-grid x-gap="12" :cols="tableColsConfig" class="table-grid">
        <n-gi v-for="(table, index) in tables" :key="index">
          <n-card
            :title="table.title"
            :segmented="{ content: true }"
            class="table-card"
          >
            <n-table :bordered="true" :single-line="false">
              <thead>
                <tr>
                  <th v-for="header in table.headers" :key="header">
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in table.data" :key="rowIndex">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                    {{ cell }}
                  </td>
                </tr>
                <tr class="empty-row">
                  <td :colspan="table.headers.length">···············</td>
                </tr>
              </tbody>
            </n-table>
          </n-card>
        </n-gi>
      </n-grid>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const totalKeys = ref("0");
const createdToday = ref("0");
const activatedToday = ref("0");
const expiredToday = ref("0");
const expiredWithinDay = ref("0");
const unactivatedKeys = ref("0");
const totalUsageCount = ref("0");

const numberAnimationInstRef = ref(null);

import { getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();
const axios = proxy.$axios;

const formatDate = (date) => {
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const seconds = d.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

// 定义 ref 变量
const ActiveCard = ref([]);
const ExpiredCard = ref([]);
const TodaysActiveRecords = ref([]);

// AI: 统计数据
const stats = [
  {
    title: "本站托管卡密总数",
    value: totalKeys.value,
    label: "此数据只是当前用户所管理的卡密",
    suffix: " 个卡密",
    description: "每一个数字，都是你努力的见证。",
  },
  {
    title: "当天创建卡密总数",
    value: createdToday.value,
    label: "此数据只是当前用户所管理的卡密",
    suffix: " 个卡密",
    description: "一分耕耘，一分收获，今日的努力成就未来。",
  },
  {
    title: "当天激活卡密总数",
    value: activatedToday.value,
    label: "此数据只是当前用户所管理的卡密",
    suffix: " 个卡密",
    description: "努力终会被看见，付出总会有回报。",
  },
  {
    title: "当天已过期卡密总数",
    value: expiredToday.value,
    label: "此数据只是当前用户所管理的卡密",
    suffix: " 个卡密",
    description: "过期的并不代表失去，而是新的开始。",
  },
  {
    title: "当天将要过期卡密",
    value: expiredWithinDay.value,
    label: "此数据只是当前用户所管理的卡密",
    suffix: " 个卡密",
    description: "该提醒客户续费喽。",
  },
  {
    title: "未激活卡密总数",
    value: unactivatedKeys.value,
    label: "此数据只是当前用户所管理的卡密",
    suffix: " 个卡密",
    description: "每个未激活的可能，都是潜藏的希望。",
  },
  {
    title: "总使用次数",
    value: totalUsageCount.value,
    label: "此数据只是当前用户所管理的卡密",
    suffix: " 次使用",
    description: "每一次使用，都是对你辛劳的最好肯定。",
  },
];

// AI: 表格数据，使用 computed 动态计算
const tables = computed(() => [
  {
    title: "当天激活卡密(10条)",
    headers: ["卡密ID", "激活时间"],
    data:
      ActiveCard.value?.map((v) => [v.CardID, formatDate(v.CreatedAt)]) || [],
  },
  {
    title: "当天过期卡密列表(10条)",
    headers: ["卡密ID", "激活类型", "过期时间"],
    data:
      ExpiredCard.value?.map((v) => [
        v.Key,
        getActiveType(v.Duration),
        formatDate(v.EndDate),
      ]) || [],
  },
  {
    title: "当天激活记录(10条)",
    headers: ["卡密ID", "操作类型", "执行时间", "详情"],
    data:
      TodaysActiveRecords.value?.map((v) => [
        v.CardID,
        mapRecordType(v.Type),
        formatDate(v.CreatedAt),
        v.Details,
      ]) || [],
  },
]);

const colsConfig = ref("1 600:2 900:3 1200:4"); // 响应式列数
const tableColsConfig = ref("1 900:2 1200:3"); // 表格区域响应式列数

const RecordTypeString = {
  0: "卡密激活",
  1: "设备绑定",
  2: "解绑成功",
  3: "解绑失败",
  4: "校验成功",
  5: "校验失败",
};
// 映射函数
const mapRecordType = (type) => {
  return RecordTypeString[type] || "未知类型";
};
// 激活类型
const getActiveType = (t) => {
  if (t > 0) {
    return "激活";
  } else {
    return "即时";
  }
};
// 获取个人面板信息
const getCardkeyStats = () => {
  axios
    .get("/api/stats/cardkey")
    .then((res) => {
      totalKeys.value = res.data.total_keys;
      createdToday.value = res.data.created_today;
      activatedToday.value = res.data.activated_today;
      expiredToday.value = res.data.expired_today;
      expiredWithinDay.value = res.data.expired_within_a_day;
      unactivatedKeys.value = res.data.unactivated_keys;
      totalUsageCount.value = res.data.total_usage_count;
    })
    .catch((err) => {
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        console.error("Error request:", err.request);
      } else {
        console.error("Error message:", err.message);
      }
    });
};
// 获取当天要过期的卡密
const getExpiredCard = () => {
  axios
    .get("/api/stats/expired_cards")
    .then((res) => {
      ExpiredCard.value = res.data;
    })
    .catch((err) => {
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        console.error("Error request:", err.request);
      } else {
        console.error("Error message:", err.message);
      }
    });
};
// 获取当天激活的卡密
const getActiveCard = () => {
  axios
    .get("/api/stats/active_cards")
    .then((res) => {
      ActiveCard.value = res.data;
    })
    .catch((err) => {
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        console.error("Error request:", err.request);
      } else {
        console.error("Error message:", err.message);
      }
    });
};
// 获取当天激活记录
const getTodaysActiveRecords = () => {
  axios
    .get("/api/stats/todays_active_records")
    .then((res) => {
      TodaysActiveRecords.value = res.data;
    })
    .catch((err) => {
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        console.error("Error request:", err.request);
      } else {
        console.error("Error message:", err.message);
      }
    });
};

getCardkeyStats();
getExpiredCard();
getActiveCard();
getTodaysActiveRecords();
</script>

<style scoped>
.dashboard-container {
  background-color: #f5f7f9;
  padding: 16px;
  min-height: 100vh;
  box-sizing: border-box;
}

.main-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.stats-grid {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: #fff;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stat-desc {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

.table-grid {
  margin-top: 24px;
}

.table-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: #fff;
}

n-table {
  font-size: 14px;
}

n-table th {
  background-color: #fafafa;
  font-weight: 600;
}

n-table td {
  padding: 8px;
}

.empty-row td {
  color: #999;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .dashboard-container {
    padding: 8px;
  }

  .main-card {
    box-shadow: none;
  }

  .stat-card {
    margin-bottom: 12px;
  }

  .table-card {
    height: auto;
    margin-bottom: 12px;
  }

  n-table {
    font-size: 12px;
  }

  n-table td {
    padding: 6px;
  }
}
</style>
