<template>
  <n-split
    direction="horizontal"
    style="height: 100%; width: 100%"
    default-size="22%"
  >
    <template #1>
      <div style="margin-top: 10px; margin-bottom: 10px">
        <h1>Signet-卡密管理系统</h1>
      </div>
      <div>
        <Menu page="expire" style="height: 100%" />
      </div>
    </template>
    <template #2>
      <n-split direction="vertical" style="height: 100%" default-size="8%">
        <template #1> <div id="header"></div> </template>
        <template #2>
          <div id="main">
            <div style="height: 620px; width: 90%; overflow-y: auto">
              <n-data-table
                :remote="true"
                :bordered="false"
                :single-line="false"
                :columns="columns"
                :data="data"
                :pagination="pagination"
              />
            </div>
          </div>
        </template>
      </n-split>
    </template>
  </n-split>
  <n-drawer v-model:show="createStatus" :width="502">
    <n-drawer-content>
      <template #header> <h3>已过期卡密</h3> </template>
      <n-input
        v-model:value="prefix"
        placeholder="Prefix,卡密前缀,例如`tk_`(天卡)"
      />
      <div style="height: 15px"></div>
      <n-input v-model:value="key" placeholder="Key,留空则自动生成" />

      <!-- <n-date-picker
          style="margin-top: 20px"
          v-model:value="datetime"
          type="datetime"
        /> -->
      <div style="height: 15px"></div>
      <n-radio
        :checked="date === '一天'"
        value="一天"
        name="basic-demo"
        @change="setCardOften"
      >
        一天
      </n-radio>
      <n-radio
        :checked="date === '一周'"
        value="一周"
        name="basic-demo"
        @change="setCardOften"
      >
        一周
      </n-radio>
      <n-radio
        :checked="date === '一个月'"
        value="一个月"
        name="basic-demo"
        @change="setCardOften"
      >
        一个月
      </n-radio>

      <div style="margin-top: 50px">
        <n-button @click="createStatus = false">取消</n-button>
        <n-button style="margin-left: 20px" @click="createCard">创建</n-button>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import Menu from "@/components/Menu.vue";
import { ref, getCurrentInstance, h, computed } from "vue";
import { NButton, useNotification, useDialog } from "naive-ui";

const createStatus = ref(false);

// 引入axios
const { proxy } = getCurrentInstance();
const axios = proxy.$axios;

// 列名称
const columns = ref([
  { title: "卡密", key: "Key" },
  { title: "创建时间", key: "CreatedAt" },
  { title: "过期时间", key: "EndDate" },
  //   { title: "更新时间", key: "UpdatedAt" },
  {
    title: "卡密时常",
    key: "Days",
    render(row) {
      return `${row.Days} 天`; // 假设你想加上 "天" 作为后缀
    },
  },
  {
    title: "操作",
    key: "actions",
    render(row) {
      return h(
        NButton,
        {
          size: "small",
          onClick: () => deleteCardWarn(row),
        },
        { default: () => "删除" }
      );
    },
  },
]);

// 分页展示
const page = ref(1);
const pageSize = ref(10);
const itemCount = ref(0);

const pagination = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  itemCount: itemCount.value,
  onChange: (newPage) => {
    page.value = newPage;
    getCardExpireList();
  },
  //   onUpdatePageSize: (newPageSize) => {
  //     pageSize.value = newPageSize;
  //     page.value = 1;
  //   },
}));

// 表数据
const data = ref([]);

// 获取所有用户
const getCardExpireList = () => {
  axios
    .get(
      "/api/card/getExpireList?page=" +
        pagination.value.page +
        "&pageSize=" +
        pagination.value.pageSize
    )
    .then((res) => {
      // 遍历数组，处理 EndDate 字段
      res.data.list.forEach((item) => {
        // 使用 toISOString() 将日期转换为 ISO 8601 格式字符串，然后截取所需部分
        if (item.EndDate) {
          item.EndDate = new Date(item.EndDate)
            .toLocaleString()
            .substring(0, 19); // 截取到秒的部分
        }
        if (item.CreatedAt) {
          item.CreatedAt = new Date(item.CreatedAt)
            .toLocaleString()
            .substring(0, 19); // 截取到秒的部分
        }
        if (item.UpdatedAt) {
          item.UpdatedAt = new Date(item.UpdatedAt)
            .toLocaleString()
            .substring(0, 19); // 截取到秒的部分
        }
      });
      data.value = res.data.list;
      itemCount.value = res.data.total * pageSize.value;
    })
    .catch((err) => {
      console.log(err);
    });
};
getCardExpireList();
const dialog = useDialog();

const key = ref("");
const prefix = ref("");
// const datetime = ref(undefined);
const date = ref("一天");

// 时间计算
const getTimeInSeconds = (date) => {
  switch (date) {
    case "一天":
      return 24 * 60 * 60; // 一天的秒数
    case "一周":
      return 7 * 24 * 60 * 60; // 一周的秒数
    case "一个月":
      return 30 * 24 * 60 * 60; // 一个月的秒数（假设30天）
    default:
      return 0;
  }
};

const createCard = () => {
  // 时间计算
  const currentTimeInSeconds = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
  const additionalTimeInSeconds = getTimeInSeconds(date.value); // 根据选择的时间计算的秒数
  const targetTimestamp = currentTimeInSeconds + additionalTimeInSeconds; // 目标时间戳
  axios
    .post("/api/card/create", {
      prefix: prefix.value,
      key: key.value,
      //   time: datetime.value / 1000,
      time: targetTimestamp,
    })
    .then((res) => {
      notify("success", "信息", "创建卡密成功");
      createStatus.value = false;
      prefix.value = "";
      key.value = "";
      //   datetime.value = 0;
      date.value = "一天";
      getCardExpireList();
    })
    .catch((err) => {
      console.log(err);

      notify("error", "错误", err.request.response);
    });
};
// 删除提示
const deleteCardWarn = (row) => {
  dialog.warning({
    title: "警告",
    content: "你确定？",
    positiveText: "确定",
    negativeText: "不确定",
    onPositiveClick: () => {
      deleteCard(row);
    },
  });
};

const notification = useNotification();
const notify = (type, title, text) => {
  notification[type]({
    content: title,
    meta: text,
    duration: 2500,
    keepAliveOnHover: true,
  });
};
</script>

<style>
#header {
  /* background-color: aqua; */
  height: 100%;
  width: 100%;
}
#main {
  /* background-color: antiquewhite; */
  height: 100%;
  width: 100%;
}
#create {
  height: 40%;
  width: 40%;
  border: 1px solid black;
  background-color: aliceblue;
  position: absolute;
  top: 20%;
  left: 30%;
}
</style>
