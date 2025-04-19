<template>
  <div class="container">
    <n-card
      title="项目管理"
      class="project-card"
      :header-style="{ textAlign: 'left', fontSize: '20px' }"
      :segmented="{ content: true }"
    >
      <template #header-extra>
        <n-button
          type="primary"
          @click="drawerShow(true)"
          ghost
          size="small"
          class="create-btn"
        >
          创建项目
        </n-button>
      </template>

      <div class="grid-container">
        <n-grid
          :x-gap="12"
          :y-gap="12"
          :cols="cols"
          responsive="screen"
          :item-responsive="true"
        >
          <n-gi v-for="item in list" :key="item.ID">
            <n-card
              :header-style="{ textAlign: 'left' }"
              :title="item.Name"
              class="item-card"
              :segmented="{ content: true }"
            >
              <div class="card-content">
                <div class="info-text">
                  备注信息：{{ item.Notes }} <br />
                  唯一标识：{{ item.UniqueID }} <br />
                  创建时间：{{ item.CreatedAt.slice(0, 10) }}
                </div>
                <div class="button-group">
                  <n-button
                    size="small"
                    secondary
                    type="info"
                    @click="showProjectDetail(item.ID)"
                  >
                    详情
                  </n-button>
                  <n-button
                    size="small"
                    secondary
                    type="primary"
                    @click="drawerShow(false, item.ID)"
                  >
                    修改
                  </n-button>
                  <n-popconfirm @positive-click="deleteProject(item.ID)">
                    <template #trigger>
                      <n-button size="small" secondary type="error">
                        删除
                      </n-button>
                    </template>
                    你确定吗?删除前请手动删除项目中的卡密.
                  </n-popconfirm>
                </div>
              </div>
            </n-card>
          </n-gi>
        </n-grid>
      </div>

      <n-pagination
        class="pagination"
        v-model:page="page"
        v-model:page-size="pageSize"
        :page-count="itemCount"
        show-size-picker
        :page-sizes="[6, 12, 24, 48]"
        :on-update:page="updatePaginationPage"
        :on-update:page-size="updatePaginationPageSize"
      />
    </n-card>

    <n-modal
      v-model:show="projectDetailStatus"
      preset="card"
      :style="{ width: modalWidth }"
      :title="projectDetail.Name"
      size="huge"
    >
      <div class="modal-content">
        备注信息：{{ projectDetail.Notes }} <br />
        唯一标识：{{ projectDetail.UniqueID }} <br />
        创建时间：{{ projectDetail.CreatedAt.slice(0, 10) }} <br /><br />
        <n-grid :cols="modalCols" :x-gap="12" :y-gap="12">
          <n-gi v-for="(stat, index) in stats" :key="index">
            <n-statistic :label="stat.label" :value="stat.value" />
          </n-gi>
        </n-grid>
      </div>
    </n-modal>

    <n-drawer v-model:show="show" :width="drawerWidth" placement="right">
      <n-drawer-content
        :title="drawerCreteStyle ? '创建项目' : '修改项目'"
        closable
      >
        <div class="drawer-content">
          <template v-if="!drawerCreteStyle">
            <div class="form-item">项目唯一标识：{{ olduniqueID }}</div>
          </template>

          <div class="form-item">
            <label>{{ drawerCreteStyle ? "项目名称" : "标题修改" }}</label>
            <n-input
              v-model:value="formName"
              :placeholder="drawerCreteStyle ? '项目名称,不能为空' : '标题修改'"
            />
          </div>

          <div class="form-item">
            <label>{{ drawerCreteStyle ? "备注信息" : "备注修改" }}</label>
            <n-input
              v-model:value="formNotes"
              :placeholder="drawerCreteStyle ? '备注信息' : '备注修改'"
            />
          </div>

          <div class="drawer-actions">
            <n-button @click="show = false">取消</n-button>
            <n-button
              type="primary"
              @click="drawerCreteStyle ? createProject() : updateProject()"
            >
              {{ drawerCreteStyle ? "创建" : "修改" }}
            </n-button>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, computed, getCurrentInstance } from "vue";
import { NButton, useNotification } from "naive-ui";

const router = useRouter();
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
const formName = ref(""); // 替换原来的 Name 和 oldName
const formNotes = ref(""); // 替换原来的 Notes 和 oldNotes

// 打开抽屉时设置表单值
const drawerShow = (createStatus, id) => {
  if (createStatus) {
    formName.value = "";
    formNotes.value = "";
  } else {
    getProjectInfo(id);
  }
  drawerCreteStyle.value = createStatus;
  show.value = true;
};

const list = ref([]);
const itemCount = ref(0);
const page = ref(1);
const pageSize = ref(6);
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
  formName.value = formName.value.trim();
  if (formName.value === "") {
    notify("error", "创建失败", "项目名称不能为空");
    return;
  }
  axios
    .post("/api/project/create", {
      Name: formName.value,
      Notes: formNotes.value,
    })
    .then((res) => {
      notify("success", "创建成功", "");
      show.value = false;
      getProjectList();
      formName.value = "";
      formNotes.value = "";
    })
    .catch((err) => {
      notify("error", "创建失败", err.response.data.msg);
    });
};

const getProjectList = () => {
  axios
    .get(
      "/api/project/getList?page=" + page.value + "&pageSize=" + pageSize.value
    )
    .then((res) => {
      list.value = res.data.list;
      itemCount.value = res.data.total;
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

const deleteProject = (id) => {
  axios
    .delete("/api/project/delete", {
      data: { id: id },
    })
    .then((res) => {
      getProjectList();
      notify("success", "删除成功", "");
    })
    .catch((err) => {
      notify("error", "删除失败", err.response.data.msg);
    });
};

const updateProject = () => {
  if (!formName.value || !formName.value.trim()) {
    notify("error", "修改项目失败", "项目名称不能为空且不能只包含空格");
    return;
  }
  if (!formNotes.value || !formNotes.value.trim()) {
    notify("error", "修改项目失败", "项目注释不能为空且不能只包含空格");
    return;
  }
  axios
    .post("/api/project/update", {
      id: oldID.value,
      name: formName.value,
      notes: formNotes.value,
    })
    .then((res) => {
      getProjectList();
      notify("success", "修改项目成功", "");
      show.value = false;
    })
    .catch((err) => {
      notify("error", "修改项目失败", err.response?.data?.msg || "未知错误");
    });
};

const getProjectInfo = (id) => {
  axios
    .get("/api/project/getDetail?id=" + id)
    .then((res) => {
      projectDetail.value = res.data;
      oldID.value = res.data.ID;
      formNotes.value = res.data.Notes; // 修改时赋值给 formNotes
      formName.value = res.data.Name; // 修改时赋值给 formName
      olduniqueID.value = res.data.UniqueID;
    })
    .catch((err) => {
      console.log(err);
    });
};

const showProjectDetail = (id) => {
  projectDetailStatus.value = true;
  getProjectInfo(id);
};

// 响应式计算属性
const cols = computed(() => ({
  xs: 1,
  s: 2,
  m: 3,
  l: 4,
}));

const modalCols = computed(() => ({
  xs: 1,
  s: 2,
  m: 4,
}));

const modalWidth = computed(() => ({
  xs: "90vw",
  s: "80vw",
  m: "600px",
}));

const drawerWidth = computed(() => ({
  xs: "90vw",
  s: "80vw",
  m: "502px",
}));

const stats = computed(() => [
  { label: "卡密总数", value: projectDetail.value.CardCount },
  { label: "已激活", value: projectDetail.value.UsingCount },
  { label: "未使用", value: projectDetail.value.UnusedCount },
  { label: "已过期", value: projectDetail.value.ExpiredCount },
]);
</script>

<style scoped>
/* 样式保持不变 */
.container {
  padding: 10px;
  padding-bottom: 80px;
  background-color: #f9f9f9;
  min-height: 100vh;
}

.project-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.grid-container {
  padding: 12px 0;
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

.item-card {
  height: 240px;
  border-radius: 6px;
  transition: all 0.3s;
}

.item-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.info-text {
  flex: 1;
  text-align: left;
  font-size: 14px;
  line-height: 1.6;
  padding: 8px 0;
}

.button-group {
  display: flex;
  gap: 8px;
  padding: 8px 0;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}

.modal-content {
  padding: 16px;
}

.drawer-content {
  padding: 16px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}

.drawer-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .container {
    padding-bottom: 80px;
  }

  .item-card {
    height: auto;
    min-height: 200px;
  }

  .button-group {
    flex-wrap: wrap;
  }

  .create-btn {
    width: 100%;
    margin-top: 8px;
  }

  .grid-container {
    max-height: calc(100vh - 240px);
  }

  .pagination {
    position: fixed;
    bottom: 10px;
    right: 20px;
    left: 20px;
    background: white;
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }
}
</style>
