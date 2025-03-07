<template>
  <div class="dashboard-container">
    <n-card
      title="控制台"
      :header-style="{ textAlign: 'left', fontSize: '20px' }"
      :segmented="{ content: true }"
      class="main-card"
    >
      <n-grid x-gap="12" :cols="colsConfig" class="stats-grid">
        <n-gi v-for="(stat, index) in computedStats" :key="index">
          <n-card
            :title="stat.title"
            :header-style="{ textAlign: 'left', fontSize: '18px' }"
            :segmented="{ content: true }"
            class="stat-card"
          >
            <n-statistic :label="stat.label" tabular-nums>
              <n-number-animation :from="0" :to="Number(stat.value)" />
              <template #suffix>{{ stat.suffix }}</template>
            </n-statistic>
            <n-space vertical class="stat-desc">
              {{ stat.description }}
            </n-space>
          </n-card>
        </n-gi>
      </n-grid>

      <n-grid x-gap="12" :cols="tableColsConfig" class="table-grid">
        <n-gi v-for="(table, index) in computedTables" :key="index">
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
import { ref, computed, onMounted, getCurrentInstance } from "vue"; // 显式导入 getCurrentInstance

const totalKeys = ref(0);
const createdToday = ref(0);
const activatedToday = ref(0);
const expiredToday = ref(0);
const expiredWithinDay = ref(0);
const unactivatedKeys = ref(0);
const totalUsageCount = ref(0);
const ActiveCard = ref([]);
const ExpiredCard = ref([]);
const TodaysActiveRecords = ref([]);

// 获取组件实例
const instance = getCurrentInstance();
const axios = instance?.proxy.$axios; // 使用 optional chaining 防止 instance 未定义

const formatDate = (date) => {
  if (!date) return "暂无数据";
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const seconds = d.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const RecordTypeString = {
  0: "卡密激活",
  1: "设备绑定",
  2: "解绑成功",
  3: "解绑失败",
  4: "校验成功",
  5: "校验失败",
};

const mapRecordType = (type) => RecordTypeString[type] || "未知类型";
const getActiveType = (t) => (t > 0 ? "激活" : "即时");

const computedStats = computed(() => [
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
]);

const computedTables = computed(() => [
  {
    title: "当天激活卡密(10条)",
    headers: ["卡密ID", "激活时间"],
    data: ActiveCard.value.map((v) => [
      v.CardID || "暂无",
      formatDate(v.CreatedAt),
    ]),
  },
  {
    title: "当天过期卡密列表(10条)",
    headers: ["卡密ID", "激活类型", "过期时间"],
    data: ExpiredCard.value.map((v) => [
      v.Key || "暂无",
      getActiveType(v.Duration),
      formatDate(v.EndDate),
    ]),
  },
  {
    title: "当天激活记录(10条)",
    headers: ["卡密ID", "操作类型", "执行时间", "详情"],
    data: TodaysActiveRecords.value.map((v) => [
      v.CardID || "暂无",
      mapRecordType(v.Type),
      formatDate(v.CreatedAt),
      v.Details || "无",
    ]),
  },
]);

const colsConfig = "1 600:2 900:3 1200:4";
const tableColsConfig = "1 900:2 1200:3";

const fetchData = async (url, refVar) => {
  if (!axios) {
    console.error("Axios is not available");
    return;
  }
  try {
    const res = await axios.get(url);
    refVar.value = res.data || (Array.isArray(refVar.value) ? [] : 0);
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.response?.data || err.message);
  }
};

const getCardkeyStats = async () => {
  if (!axios) {
    console.error("Axios is not available");
    return;
  }
  try {
    const res = await axios.get("/api/stats/cardkey");
    totalKeys.value = res.data.total_keys || 0;
    createdToday.value = res.data.created_today || 0;
    activatedToday.value = res.data.activated_today || 0;
    expiredToday.value = res.data.expired_today || 0;
    expiredWithinDay.value = res.data.expired_within_a_day || 0;
    unactivatedKeys.value = res.data.unactivated_keys || 0;
    totalUsageCount.value = res.data.total_usage_count || 0;
  } catch (err) {
    console.error(
      "Error fetching cardkey stats:",
      err.response?.data || err.message
    );
  }
};

onMounted(async () => {
  if (!axios) {
    console.error("Cannot fetch data: Axios is not initialized");
    return;
  }
  await Promise.all([
    getCardkeyStats(),
    fetchData("/api/stats/expired_cards", ExpiredCard),
    fetchData("/api/stats/active_cards", ActiveCard),
    fetchData("/api/stats/todays_active_records", TodaysActiveRecords),
  ]);
});
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
  margin-top: 5px;
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

.n-table {
  font-size: 14px;
}

.n-table th {
  background-color: #fafafa;
  font-weight: 600;
}

.n-table td {
  padding: 8px;
}

.empty-row td {
  color: #999;
  text-align: center;
}

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

  .n-table {
    font-size: 12px;
  }

  .n-table td {
    padding: 6px;
  }
}
</style>
