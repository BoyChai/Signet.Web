<template>
  <div
    style="
      background-color: #f9f9f9;
      padding: 20px;
      padding-top: 24px;
      overflow: auto;
    "
  >
    <n-card
      title="项目管理"
      :header-style="{ textAlign: 'left', fontSize: '20px' }"
      :segmented="{
        content: true,
      }"
    >
      <template #header-extra>
        <n-button type="primary" @click="show = true" ghost>
          创建项目
        </n-button>
      </template>
      <div style="height: 80vh">
        <n-grid x-gap="12" :cols="4">
          <n-gi v-for="item in list" :key="item.ID">
            <n-card
              :header-style="{ textAlign: 'left' }"
              :title="item.Name"
              style="padding: 16px; height: 240px; margin-bottom: 20px"
              :segmented="{
                content: true,
              }"
            >
              <template #header-extra> </template>
              <div style="text-align: left; height: 90%">
                备注信息：{{ item.Notes }} <br />
                创建时间：{{ item.CreatedAt.slice(0, 10) }} <br />
                <!-- 卡密总数：{{ item.Notes }} <br /> -->
                <!-- 有效卡密总数：{{ item.Notes }} <br /> -->
              </div>
              <div>
                <n-button
                  style="float: left; margin-left: 4%"
                  ong
                  secondary
                  type="info"
                >
                  详情信息
                </n-button>
                <n-button
                  style="float: left; margin-left: 10%"
                  ong
                  secondary
                  type="primary"
                >
                  修改项目
                </n-button>
                <n-popconfirm @positive-click="deleteProject(item.ID)">
                  <template #trigger>
                    <n-button ong secondary type="error">删除项目</n-button>
                  </template>
                  你确定吗?删除前请手动删除项目中的卡密.
                </n-popconfirm>
              </div>
            </n-card>
          </n-gi>
        </n-grid>
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
  </div>
  <n-drawer v-model:show="show" :width="502">
    <n-drawer-content title="创建项目" closable>
      <n-input v-model:value="Name" placeholder="项目名称,不能为空" />
      <div style="height: 15px"></div>
      <n-input v-model:value="Notes" placeholder="备注信息" />
      <div style="margin-top: 50px">
        <n-button @click="show = false">取消</n-button>
        <n-button style="margin-left: 20px" @click="createProject"
          >创建</n-button
        >
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, getCurrentInstance } from "vue";
import { FmdBadTwotone } from "@vicons/material";
import { NButton, useNotification } from "naive-ui";

const router = useRouter();

// 引入axios
const { proxy } = getCurrentInstance();
const axios = proxy.$axios;

const notification = useNotification();
const notify = (type, title, text) => {
  notification[type]({
    content: title,
    meta: text,
    duration: 2500,
    keepAliveOnHover: true,
  });
};

// 创建抽屉
const show = ref(false);

const list = ref([]);
const itemCount = ref(0);
const page = ref(1);
const pageSize = ref(16);
const Name = ref("");
const Notes = ref("");

const createProject = () => {
  // 出去空格,判断是否为空
  Name.value = Name.value.trim();
  if (Name.value === "") {
    notify("error", "创建失败", "项目名称不能为空");
    return;
  }
  axios
    .post("/api/project/create", {
      Name: Name.value,
      Notes: Notes.value,
    })
    .then((res) => {
      notify("success", "创建成功", "");
      show.value = false;
      getProjectList();
    })
    .catch((err) => {
      notify("error", "创建失败", err.response.data.msg);
    });
  Name.value = "";
  Notes.value = "";
};

const getProjectList = () => {
  axios
    .get(
      "/api/project/getList?page=" + page.value + "&pageSize=" + pageSize.value
    )
    .then((res) => {
      // 遍历数组，处理 EndDate 字段
      list.value = res.data.list;
      itemCount.value = res.data.total;
      console.log(list.value);
    })
    .catch((err) => {
      console.log(err);
    });
};

getProjectList();

const updatePaginationPage = (newPage) => {
  page.value = newPage;
  getProjectList();
};
const updatePaginationPageSize = (newPageSize) => {
  pageSize.value = newPageSize;
  page.value = 1;
  getProjectList();
};
// 删除项目
const deleteProject = (id) => {
  axios
    .delete("/api/project/delete", {
      data: {
        id: id,
      },
    })
    .then((res) => {
      getProjectList();
      notify("success", "删除成功", "");
    })
    .catch((err) => {
      notify("error", "删除失败", err.response.data.msg);
    });
};
</script>

<style></style>
