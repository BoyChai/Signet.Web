<template>
  <div style="background-color: #f5f7f9; padding: 10px; padding-top: 12px">
    <n-card
      title="使用记录"
      :header-style="{ textAlign: 'left', fontSize: '20px' }"
      :segmented="{
        content: true,
      }"
      style="height: 98%"
    >
      <n-grid x-gap="12" :cols="1">
        <n-gi>
          <div class="search-container">
            <div class="search-item">
              <span class="search-label">卡密查询：</span>
              <n-input
                class="search-input"
                placeholder="卡密搜索，这里的内容会当作key的前缀搜索"
                v-model:value="searchKey"
              ></n-input>
            </div>

            <div class="search-item">
              <span class="search-label">项目筛选：</span>
              <n-auto-complete
                class="search-input"
                v-model:value="searchProjectSelectValue"
                :input-props="{
                  autocomplete: 'disabled',
                }"
                :options="searchProjectSelectOptions"
                placeholder="项目选择"
                clearable
              />
            </div>

            <div class="search-item">
              <span class="search-label">设备码查询：</span>
              <n-input
                class="search-input"
                placeholder="卡密搜索，这里的内容会当作key的前缀搜索"
                v-model:value="deviceCode"
              ></n-input>
            </div>

            <n-button class="search-btn" type="primary" @click="getRecordList"
              >Search Logs</n-button
            >
          </div>
        </n-gi>
      </n-grid>
      <div class="table-container">
        <n-data-table
          :columns="columns"
          :data="data"
          :pagination="pagination"
          :bordered="false"
        />
      </div>
      <n-pagination
        class="pagination-wrapper"
        row-key="ID"
        v-model:page="page"
        v-model:page-size="pageSize"
        :page-count="itemCount"
        show-size-picker
        :page-sizes="[20, 30, 40, 50]"
        :on-update:page="updatePaginationPage"
        :on-update:page-size="updatePaginationPageSize"
      />
    </n-card>
  </div>
</template>
<script setup>
import { ref, getCurrentInstance, watch, computed } from "vue";

import { NButton, useMessage } from "naive-ui";
import { defineComponent, h } from "vue";

// axios引入
const { proxy } = getCurrentInstance();
const axios = proxy.$axios;

// 数据展示结构
const columns = ref([
  {
    type: "selection",
  },
  { title: "卡密", key: "CardKey", width: 200 },
  { title: "所属项目", key: "ProjectName", width: 120 },
  { title: "所属用户", key: "UserName", width: 100 },
  {
    title: "类型",
    key: "CardType",
    width: 100,
    render(row) {
      return row.CardType === 0 ? "时卡" : "次卡";
    },
  },
  {
    title: "绑定设备",
    key: "DeviceCode",
    width: 220,
    render(row) {
      // 返回前20位的设备码
      if (row.DeviceCode.length <= 20) {
        return row.DeviceCode;
      }
      return row.DeviceCode.slice(0, 17) + "...";
    },
  },
  {
    title: "记录时间",
    key: "Time",
    render(row) {
      // 假设 row.Time 是类似 "2025-02-15T13:41:59.7311322+08:00" 的时间字符串
      const date = new Date(row.Time);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    width: 160,
  },
  {
    title: "记录类型",
    key: "Type",
    width: 120,
    render(row) {
      // 定义一个映射表，将 RecordType 的值映射为中文描述
      const recordTypeMap = {
        0: "卡密激活",
        1: "设备绑定",
        2: "设备解绑成功",
        3: "设备解绑失败",
        4: "卡密校验成功",
        5: "卡密校验失败",
      };

      // 使用 row.Type 获取对应的记录类型描述
      return recordTypeMap[row.Type] || "未知类型";
    },
  },
  { title: "详细信息", key: "Details" },
]);
// 数据
const data = ref([]);

// 项目相关
const projectData = ref([
  {
    label: "",
    value: "",
  },
]);

const searchProjectData = ref([
  {
    label: "",
    value: "",
  },
]);

// 搜索相关
const searchKey = ref("");
const searchProjectSelectValue = ref("");
const searchProjectSelectOptions = computed(() => {
  return searchProjectData.value.map((project) => {
    return {
      label: project.Name, // 项目名称作为label
      value: project.ID, // 项目ID作为value
    };
  });
});
const deviceCode = ref("");

// 分页相关变量
const page = ref(1);
const pageSize = ref(20);
const itemCount = ref(0);
const tableKey = ref(0);
const paginationCheckKeys = ref([]);

// 搜索项目
const searchProject = (key, t) => {
  axios
    .post("/api/project/search", {
      name: key,
    })
    .then((res) => {
      if (t === "search") {
        searchProjectData.value = res.data;
      } else {
        projectData.value = res.data; // 假设返回的项目数据在 res.data 中
      }
    })
    .catch((err) => {
      projectData.value = [];
    });
};
// 卡密检索相关
watch(searchProjectSelectValue, (newValue) => {
  if (newValue) {
    searchProject(newValue, "search");
  } else {
    searchProjectData.value = []; // 如果选择为空，清空项目数据
  }
});

// 获取数据
const getRecordList = () => {
  var projectID = 0;

  if (!searchProjectData.value || searchProjectData.value.length === 0) {
    // 如果 projectData 为空或没有元素，projectID 设置为 0
    console.log("projectData is empty, projectID set to 0");
  } else {
    // 如果 projectData 不为空，检查 ID 是否有效
    if (
      searchProjectData.value[0].ID !== undefined &&
      searchProjectData.value[0].ID !== null
    ) {
      projectID = searchProjectData.value[0].ID;
    }
  }
  axios
    .get(
      "/api/record/getList?page=" +
        page.value +
        "&pageSize=" +
        pageSize.value +
        "&project_id=" +
        projectID +
        "&key=" +
        searchKey.value +
        "&device_code=" +
        deviceCode.value
    )
    .then((res) => {
      // 遍历数组，处理 EndDate 字段
      data.value = Array.isArray(res.data.records) ? res.data.records : [];
      itemCount.value = res.data.total;
    })
    .catch((err) => {
      console.log(err);
    });
};

getRecordList();

const updatePaginationPage = (newPage) => {
  paginationCheckKeys.value = [];
  tableKey.value++;

  page.value = newPage;
  getRecordList();
};
const updatePaginationPageSize = (newPageSize) => {
  paginationCheckKeys.value = [];
  tableKey.value++;

  pageSize.value = newPageSize;
  page.value = 1;
  getRecordList();
};
</script>

<style scoped>
/* 通用样式 */
.n-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-container {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-label {
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
}

.search-input {
  min-width: 180px;
}

/* PC端样式 */
@media (min-width: 768px) {
  .search-btn {
    margin-left: auto;
  }
}

/* 移动端样式 */
@media (max-width: 767px) {
  .search-container {
    flex-direction: column;
    gap: 12px;
  }

  .search-item {
    width: 100%;
  }

  .search-input {
    width: 100% !important;
  }

  .search-btn {
    width: 100%;
    margin-left: 0 !important;
  }

  .n-data-table {
    overflow-x: auto;
    display: block;
    white-space: nowrap;
  }

  .n-pagination {
    float: none;
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
}

/* 分页样式优化 */
.pagination-wrapper {
  margin-top: 16px;
  padding: 8px 0;
  background: white;
}

/* 表格容器样式 */
.table-container {
  height: auto;
  min-height: 200px;
  overflow-y: auto;
  margin-bottom: 60px; /* 为分页留出空间 */
}

/* PC端分页样式 */
@media (min-width: 768px) {
  .pagination-wrapper {
    float: right;
    margin-top: 16px;
    padding: 8px 0;
  }
}

/* 移动端分页样式 */
@media (max-width: 767px) {
  .pagination-wrapper :deep(.n-pagination) {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>
