<template>
  <div class="user-management-container">
    <n-card
      title="用户管理"
      :header-style="{ textAlign: 'left', fontSize: '20px' }"
      :segmented="{ content: true }"
      class="user-card"
    >
      <div class="table-wrapper">
        <n-data-table
          :key="tableKey"
          :remote="true"
          :bordered="true"
          :single-line="false"
          :columns="columns"
          :data="data"
          :row-key="rowKey"
          @update:checked-row-keys="handlePaginationCheck"
          :max-height="tableHeight"
          :scroll-x="scrollX"
        />
        <p v-if="!data.length" class="no-data">暂无用户数据</p>
      </div>
      <div class="pagination-actions">
        <n-pagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :page-count="pageCount"
          show-size-picker
          :page-sizes="[10, 20, 30, 40, 50]"
          @update:page="updatePaginationPage"
          @update:page-size="updatePaginationPageSize"
        />
        <n-button
          type="primary"
          style="width: 10vh"
          @click="createStatus = true"
          block
        >
          创建用户
        </n-button>
      </div>
    </n-card>

    <n-drawer
      v-model:show="createStatus"
      :width="drawerWidth"
      :placement="drawerPlacement"
      class="create-drawer"
    >
      <n-drawer-content>
        <template #header>
          <h3 class="drawer-title">创建用户</h3>
        </template>
        <n-form :model="formData" :rules="rules" ref="formRef">
          <n-form-item label="用户名" path="name">
            <n-input v-model:value="formData.name" placeholder="请输入用户名" />
          </n-form-item>
          <n-form-item label="密码" path="password">
            <n-input
              type="password"
              show-password-on="mousedown"
              v-model:value="formData.password"
              placeholder="请输入密码"
            />
          </n-form-item>
          <n-form-item label="角色" path="role">
            <n-radio-group v-model:value="formData.role" name="role">
              <n-radio value="1">管理员</n-radio>
              <n-radio value="2">代理</n-radio>
            </n-radio-group>
          </n-form-item>
        </n-form>
        <div class="drawer-actions">
          <n-button @click="createStatus = false">取消</n-button>
          <n-button type="primary" @click="createUser" :loading="creating"
            >创建</n-button
          >
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance, h } from "vue";
import { NButton, useNotification, useDialog } from "naive-ui";

const createStatus = ref(false);
const creating = ref(false);
const tableKey = ref(0);

const { proxy } = getCurrentInstance();
const axios = proxy.$axios;

const columns = [
  { title: "用户名", key: "Name", width: 150 },
  { title: "创建时间", key: "CreatedAt", width: 180 },
  { title: "角色", key: "Role", width: 120 },
  {
    title: "操作",
    key: "actions",
    width: 100,
    fixed: "right",
    render(row) {
      return h(
        NButton,
        {
          size: "small",
          type: "error",
          ghost: true,
          onClick: () => deleteUserWarn(row),
        },
        { default: () => "删除" }
      );
    },
  },
];

const data = ref([]);
const page = ref(1);
const pageSize = ref(10);
const itemCount = ref(0);

const rowKey = (row) => row.ID;

const formData = ref({
  name: "",
  password: "",
  role: "2",
});

const rules = {
  name: { required: true, message: "请输入用户名", trigger: "blur" },
  password: { required: true, message: "请输入密码", trigger: "blur" },
  role: { required: true, message: "请选择角色", trigger: "change" },
};

const formRef = ref(null);
const notification = useNotification();
const dialog = useDialog();

const notify = (type, title, text) => {
  notification[type]({
    content: title,
    meta: text,
    duration: 2500,
    keepAliveOnHover: true,
  });
};

const getUserList = async () => {
  try {
    const res = await axios.get("/api/user/getList", {
      params: { page: page.value, pageSize: pageSize.value },
    });
    const userList = Array.isArray(res.data) ? res.data : res.data?.list || [];
    data.value = userList.map((item) => ({
      ...item,
      CreatedAt: item.CreatedAt
        ? new Date(item.CreatedAt).toLocaleString()
        : "暂无",
      Role:
        item.Role === "0"
          ? "超级管理员"
          : item.Role === "1"
          ? "管理员"
          : "代理",
    }));
    itemCount.value = res.data.total || userList.length;
    tableKey.value++;
  } catch (err) {
    notify("error", "错误", err.message || "获取用户列表失败");
    data.value = [];
    itemCount.value = 0;
  }
};

const deleteUser = async (row) => {
  try {
    await axios.delete("/api/user/delete", { data: { id: row.ID } });
    notify("success", "信息", `删除用户 ${row.Name} 成功`);
    getUserList();
  } catch (err) {
    notify("error", "错误", err.message);
  }
};

const deleteUserWarn = (row) => {
  dialog.warning({
    title: "警告",
    content: `确定删除用户 ${row.Name} 吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: () => deleteUser(row),
  });
};

const createUser = async () => {
  try {
    await formRef.value?.validate();
    creating.value = true;
    await axios.post("/api/user/create", {
      name: formData.value.name,
      pass: formData.value.password,
      role: formData.value.role,
    });
    notify("success", "信息", "创建用户成功");
    createStatus.value = false;
    formData.value = { name: "", password: "", role: "2" };
    getUserList();
  } catch (err) {
    notify("error", "错误", err.message);
  } finally {
    creating.value = false;
  }
};

const pageCount = computed(() => Math.ceil(itemCount.value / pageSize.value));

const tableHeight = computed(() => (window.innerWidth < 768 ? 400 : 620));
const scrollX = computed(() => (window.innerWidth < 768 ? 600 : undefined));
const drawerPlacement = computed(() =>
  window.innerWidth < 768 ? "bottom" : "right"
);
const drawerWidth = computed(() => (window.innerWidth < 768 ? "100%" : 502));

onMounted(() => {
  getUserList();
});
</script>

<style scoped>
.user-management-container {
  background-color: #f5f7f9;
  padding: 16px;
  min-height: 100vh;
  box-sizing: border-box;
}

.user-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.table-wrapper {
  overflow-x: auto;
  margin-bottom: 16px;
}

.pagination-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 0;
}

.create-drawer {
  background-color: #fff;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

.drawer-title {
  margin: 0;
  font-size: 18px;
  color: #333;
  padding: 16px 16px 0;
}

.n-form {
  padding: 16px;
}

.n-form-item {
  margin-bottom: 16px;
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #eee;
  background-color: #fff;
}

@media (max-width: 768px) {
  .user-management-container {
    padding: 8px;
  }

  .user-card {
    box-shadow: none;
    border-radius: 8px;
  }

  .table-wrapper {
    margin-bottom: 8px;
  }

  .pagination-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .n-pagination {
    margin-bottom: 8px;
  }

  .create-drawer {
    max-height: 80vh;
    border-radius: 12px 12px 0 0;
    overflow-y: auto;
  }

  .n-form {
    padding: 12px;
  }

  .drawer-actions {
    padding: 12px;
    position: sticky;
    bottom: 0;
  }
}

@media (max-width: 480px) {
  .n-data-table {
    font-size: 12px;
  }

  .n-button {
    width: 100%;
  }

  .drawer-actions {
    flex-direction: column;
    gap: 8px;
  }

  .drawer-title {
    font-size: 16px;
    padding: 12px 12px 0;
  }
}
</style>
