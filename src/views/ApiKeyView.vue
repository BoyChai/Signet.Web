<template>
  <div style="background-color: #f5f7f9; padding: 10px; padding-top: 12px">
    <n-card
      title="API密钥"
      :header-style="{ textAlign: 'left', fontSize: '20px' }"
      :segmented="{
        content: true,
      }"
      style="height: 98%"
    >
      <template #header-extra>
        <span :class="['slider', sliderStatus]" @click="toggleSlider">
          <i class="slider-bar"></i>
        </span>
        <span class="sliderText">管理全部密钥</span>
      </template>

      <div style="text-align: right">
        <n-button type="primary" @click="showCard">新增密钥</n-button>
      </div>

      <div style="height: 90%; overflow-y: auto; margin-top: 20px">
        <n-data-table
          :columns="columns"
          :data="data"
          :pagination="pagination"
          :bordered="false"
        />
      </div>
      <n-pagination
        style="float: right"
        row-key="ID"
        v-model:page="page"
        v-model:page-size="pageSize"
        :page-count="itemCount"
        show-size-picker
        :page-sizes="[16]"
        :on-update:page="updatePaginationPage"
        :on-update:page-size="updatePaginationPageSize"
      />
    </n-card>

    <!-- 创建抽屉 -->
    <n-drawer v-model:show="createStatu" :width="502" placement="right">
      <n-drawer-content title="创建密钥">
        <n-input v-model:value="notes" placeholder="请输入备注信息" />
        <div style="margin-top: 20px"></div>
        <n-button type="primary" @click="createApiKey">创建</n-button>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>
<script setup>
import { ref, getCurrentInstance, h } from "vue";
import { useNotification, NButton, useDialog } from "naive-ui";

// notify函数
const notification = useNotification();
const notify = (type, title, text) => {
  notification[type]({
    content: title,
    meta: text,
    duration: 2500,
    keepAliveOnHover: true,
  });
};

// axios引入
const { proxy } = getCurrentInstance();
const axios = proxy.$axios;

// 数据展示结构
const columns = ref([
  {
    type: "selection",
  },
  { title: "密钥", key: "Key", width: 400 },
  {
    title: "创建时间",
    key: "CreatedAt",
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
    width: 260,
  },
  { title: "所属用户", key: "UserName", width: 200 },
  { title: "备注信息", key: "Notes" },
  {
    title: "操作",
    key: "actions",
    render(row) {
      return h(
        NButton,
        {
          size: "small",
          onClick: () => deleteKeyWarn(row),
        },
        { default: () => "删除" }
      );
    },
  },
]);
// 数据
const data = ref([]);

// 分页相关变量
const page = ref(1);
const pageSize = ref(16);
const itemCount = ref(0);
const tableKey = ref(0);
const paginationCheckKeys = ref([]);

// 滑动按钮
const sliderStatus = ref("sliderNot");
const adminStatus = ref(false);

// 获取数据
const getApiKeyList = () => {
  axios
    .get(
      "/api/apikey/getList?page=" +
        page.value +
        "&pageSize=" +
        pageSize.value +
        "&all=" +
        adminStatus.value
    )
    .then((res) => {
      // 遍历数组，处理 EndDate 字段
      data.value = Array.isArray(res.data.list) ? res.data.list : [];
      itemCount.value = res.data.total;
    })
    .catch((err) => {
      console.log(err);
    });
};

// 滑动按钮控制
const toggleSlider = () => {
  if (sliderStatus.value === "sliderOn") {
    sliderStatus.value = "sliderNot";
    adminStatus.value = false;
    getApiKeyList();
  } else {
    sliderStatus.value = "sliderOn";
    adminStatus.value = true;
    getApiKeyList();
  }
};

getApiKeyList();

const updatePaginationPage = (newPage) => {
  paginationCheckKeys.value = [];
  tableKey.value++;

  page.value = newPage;
  getApiKeyList();
};
const updatePaginationPageSize = (newPageSize) => {
  paginationCheckKeys.value = [];
  tableKey.value++;

  pageSize.value = newPageSize;
  page.value = 1;
  getApiKeyList();
};

// 创建相关
const createStatu = ref(false);
const notes = ref("");
const showCard = () => {
  createStatu.value = true;
};

// 创建密钥
const createApiKey = () => {
  axios
    .post("/api/apikey/create", {
      notes: notes.value,
    })
    .then((res) => {
      notify("success", "信息", res.msg);
      getApiKeyList();
      notes.value = "";
      createStatu.value = false;
    })
    .catch((err) => {
      notify("error", "错误", res.msg);
    });
};
const dialog = useDialog();

// 删除密钥
const deleteKey = (id) => {
  axios
    .delete("/api/apikey/delete", {
      data: { id: id },
    })
    .then((res) => {
      console.log(res);

      //   notify("success", "信息", res.msg);
      getApiKeyList();
    })
    .catch((err) => {
      notify("error", "错误", res.msg);
      console.log(err);
    });
};

// 删除警告
const deleteKeyWarn = (row) => {
  dialog.warning({
    title: "警告",
    content: "你确定？",
    positiveText: "确定",
    negativeText: "不确定",
    onPositiveClick: () => {
      deleteKey(row.ID);
    },
  });
};
</script>

<style>
/* 按钮样式 */
.slider {
  vertical-align: middle;
  cursor: pointer;
  position: relative;
  display: inline-block;
  width: 55px;
  height: 30px;
  border-top: 2px solid #dbe0e3;
  border-radius: 6px;
  background: #e4e8ea;
}

.sliderOn {
  border-top: 2px solid #1ea554;
  border-radius: 6px;
  background: #2eca74;
}

.slider i {
  position: absolute;
  top: 4px;
  left: 6px;
  display: inline-block;
  height: 20px;
  width: 20px;
  border-bottom: 2px solid #d2d8dc;
  border-radius: 4px;
  background: #fff;
}

.sliderOn i {
  left: 30px;
  border-bottom: 2px solid #189748;
  border-radius: 4px;
  background: #fff;
}

.sliderText {
  margin-left: 5px;
}
</style>
