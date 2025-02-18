<template>
  <div
    style="
      background-color: #f9f9f9;
      padding: 10px;
      padding-top: 12px;
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
        <n-button type="primary" @click="drawerShow(true)" ghost>
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
                唯一标识：{{ item.UniqueID }} <br />
                创建时间：{{ item.CreatedAt.slice(0, 10) }} <br />
              </div>
              <div>
                <n-button
                  style="float: left; margin-left: 4%"
                  ong
                  secondary
                  type="info"
                  @click="showProjectDetail(item.ID)"
                >
                  详情信息
                </n-button>
                <n-button
                  style="float: left; margin-left: 10%"
                  ong
                  secondary
                  type="primary"
                  @click="drawerShow(false, item.ID)"
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
    <n-modal v-model:show="projectDetailStatus">
      <n-card
        style="width: 600px"
        :title="projectDetail.Name"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
        :segmented="{ content: 'soft' }"
      >
        备注信息：{{ projectDetail.Notes }} <br />
        唯一标识：{{ projectDetail.UniqueID }} <br />
        创建时间：{{ projectDetail.CreatedAt.slice(0, 10) }} <br /><br />
        <n-grid :cols="4">
          <n-gi>
            <n-statistic label="卡密总数" :value="projectDetail.CardCount" />
          </n-gi>
          <n-gi>
            <n-statistic label="已激活" :value="projectDetail.UsingCount" />
          </n-gi>
          <n-gi>
            <n-statistic label="未使用" :value="projectDetail.UnusedCount" />
          </n-gi>
          <n-gi>
            <n-statistic label="已过期" :value="projectDetail.ExpiredCount" />
          </n-gi>
        </n-grid>
      </n-card>
    </n-modal>
  </div>
  <n-drawer v-model:show="show" :width="502">
    <n-drawer-content v-if="drawerCreteStyle" title="创建项目" closable>
      项目名称：<n-input v-model:value="Name" placeholder="项目名称,不能为空" />
      <div style="height: 15px"></div>
      备注信息：<n-input v-model:value="Notes" placeholder="备注信息" />
      <div style="margin-top: 50px">
        <n-button @click="show = false">取消</n-button>
        <n-button style="margin-left: 20px" @click="createProject"
          >创建</n-button
        >
      </div>
    </n-drawer-content>
    <n-drawer-content v-else title="修改项目" closable>
      项目唯一标识：{{ olduniqueID }}
      <div style="height: 15px"></div>
      标题修改：<n-input v-model:value="oldName" placeholder="标题修改" />
      <div style="height: 15px"></div>
      备注修改：<n-input v-model:value="oldNotes" placeholder="备注修改" />
      <div style="margin-top: 50px">
        <n-button @click="show = false">取消</n-button>
        <n-button style="margin-left: 20px" @click="updateProject"
          >修改</n-button
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

// 抽屉相关参数
const show = ref(false);
const drawerCreteStyle = ref(true);
const oldID = ref("");
const olduniqueID = ref("");
const oldName = ref("");
const oldNotes = ref("");
// 打开抽屉
const drawerShow = (createStatus, id) => {
  if (!createStatus) {
    getProjectInfo(id);
  }
  drawerCreteStyle.value = createStatus;
  show.value = true;
};

const list = ref([]);
const itemCount = ref(0);
const page = ref(1);
const pageSize = ref(16);
const Name = ref("");
const Notes = ref("");

// 项目详情
const projectDetailStatus = ref(false);

const projectDetail = ref({
  CardCount: 0,
  CreatedAt: "",
  ExpiredCount: 0,
  ID: 0,
  Name: "",
  Notes: "",
  UniqueID: "",
  UnusedCount: 0,
  UsedCount: 0,
});

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
// 修改项目
const updateProject = () => {
  // 校验：确保 name 和 notes 不能为空且不能只包含空格
  if (!oldName.value || !oldName.value.trim()) {
    notify("error", "修改项目失败", "项目名称不能为空且不能只包含空格");
    return; // 如果校验失败，阻止后续的请求
  }

  if (!oldNotes.value || !oldNotes.value.trim()) {
    notify("error", "修改项目失败", "项目注释不能为空且不能只包含空格");
    return; // 如果校验失败，阻止后续的请求
  }

  // 校验通过，发起请求
  axios
    .post("/api/project/update", {
      id: oldID.value,
      name: oldName.value,
      notes: oldNotes.value,
    })
    .then((res) => {
      getProjectList();
      notify("success", "修改项目成功", "");
      show.value = false;
    })
    .catch((err) => {
      console.log(err);
      notify(
        "error",
        "修改项目失败",
        err.response?.data?.msg || "未知错误",
        " 请确保项目名称和注释有值"
      );
    });
};

// 获取项目信息
const getProjectInfo = (id) => {
  axios
    .get("/api/project/getDetail?id=" + id)
    .then((res) => {
      projectDetail.value = res.data;
      oldID.value = res.data.ID;
      oldNotes.value = res.data.Notes;
      oldName.value = res.data.Name;
      olduniqueID.value = res.data.UniqueID;
    })
    .catch((err) => {
      console.log(err);
    });
};
// 打开项目详情
const showProjectDetail = (id) => {
  projectDetailStatus.value = true;
  getProjectInfo(id);
};
</script>

<style></style>
