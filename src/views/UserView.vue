<template>
  <div style="background-color: #f5f7f9; padding: 10px; padding-top: 12px">
    <n-card
      title="用户管理"
      :header-style="{ textAlign: 'left', fontSize: '20px' }"
      :segmented="{
        content: true,
      }"
    >
      <div style="height: 670px; overflow-y: auto">
        <n-data-table
          :key="tableKey"
          :remote="true"
          :bordered="true"
          :single-line="false"
          :columns="columns"
          :data="data"
          :row-key="rowKey"
          @update:checked-row-keys="handlePaginationCheck"
          :max-height="620"
        />
      </div>
      <n-pagination
        style="float: right"
        row-key="ID"
        v-model:page="page"
        v-model:page-size="pageSize"
        :page-count="itemCount"
        show-size-picker
        :page-sizes="[10, 20, 30, 40, 50]"
        :on-update:page="updatePaginationPage"
        :on-update:page-size="updatePaginationPageSize"
      />
      <div style="margin-top: 100px; margin-right: 10%; float: right">
        <n-button type="primary" @click="createStatus = true">
          创建用户
        </n-button>
      </div>
    </n-card>
  </div>
  <n-drawer v-model:show="createStatus" :width="502">
    <n-drawer-content>
      <template #header> <h3>创建用户</h3> </template>
      <n-input v-model:value="name" placeholder="用户名" />
      <n-input
        style="margin-top: 20px"
        type="password"
        show-password-on="mousedown"
        v-model:value="password"
        placeholder="密码"
      />
      <div style="height: 15px"></div>
      <n-radio
        :checked="createRole === '1'"
        value="1"
        name="basic-demo"
        @change="setCreateRole"
      >
        管理员
      </n-radio>
      <n-radio
        :checked="createRole === '2'"
        value="2"
        name="basic-demo"
        @change="setCreateRole"
      >
        代理
      </n-radio>

      <div style="margin-top: 50px">
        <n-button @click="createStatus = false">取消</n-button>
        <n-button style="margin-left: 20px" @click="createUser">创建</n-button>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import Menu from "@/components/Menu.vue";
import { ref, getCurrentInstance, h } from "vue";
import { NButton, useNotification, useDialog } from "naive-ui";
import { FmdBadTwotone } from "@vicons/material";

const createStatus = ref(false);

// 引入axios
const { proxy } = getCurrentInstance();
const axios = proxy.$axios;

// 列名称
const columns = ref([
  { title: "用户名", key: "Name" },
  { title: "创建时间", key: "CreatedAt" },
  { title: "角色", key: "Role" },
  {
    title: "操作",
    key: "actions",
    render(row) {
      return h(
        NButton,
        {
          size: "small",
          onClick: () => deleteUserWarn(row),
        },
        { default: () => "删除" }
      );
    },
  },
]);
const deleteUser = (row) => {
  axios
    .delete("/api/user/delete", {
      data: {
        id: row.ID,
      },
    })
    .then((res) => {
      notify("success", "信息", "删除" + row.Name + "用户成功");
      getUserList();
    })
    .catch((err) => {
      notify("error", "错误", err.request.response);
    });
};
// 表数据
const data = ref([]);
const createRole = ref("2");
const setCreateRole = (e) => {
  createRole.value = e.target.value;
};
// 获取所有用户
const getUserList = () => {
  axios
    .get("/api/user/getList")
    .then((res) => {
      res.data.forEach((item) => {
        // 使用 toISOString() 将日期转换为 ISO 8601 格式字符串，然后截取所需部分
        if (item.EndDate) {
          item.EndDate = new Date(item.EndDate).toISOString().substring(0, 19); // 截取到秒的部分
        }
        if (item.CreatedAt) {
          item.CreatedAt = new Date(item.CreatedAt)
            .toISOString()
            .substring(0, 19); // 截取到秒的部分
        }
        if (item.UpdatedAt) {
          item.UpdatedAt = new Date(item.UpdatedAt)
            .toISOString()
            .substring(0, 19); // 截取到秒的部分
        }
        if (item.Role == "0") {
          item.Role = "超级管理员";
        }
        if (item.Role == "1") {
          item.Role = "管理员";
        }
        if (item.Role == "2") {
          item.Role = "代理";
        }
      });
      data.value = res.data;
    })
    .catch((err) => {
      console.log(err);
    });
};
getUserList();

const name = ref("");
const password = ref("");

const createUser = () => {
  axios
    .post("/api/user/create", {
      name: name.value,
      pass: password.value,
      role: createRole.value,
    })
    .then((res) => {
      notify("success", "信息", "创建用户成功");
      createStatus.value = false;
      name.value = "";
      password.value = "";
      getUserList();
    })
    .catch((err) => {
      notify("error", "错误", err.request.response);
    });
};

const dialog = useDialog();

// 删除提示
const deleteUserWarn = (row) => {
  dialog.warning({
    title: "警告",
    content: "你确定？",
    positiveText: "确定",
    negativeText: "不确定",
    onPositiveClick: () => {
      deleteUser(row);
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
/* #create {
  height: 40%;
  width: 40%;
  border: 1px solid black;
  background-color: aliceblue;
  position: absolute;
  top: 20%;
  left: 30%;
} */
</style>
