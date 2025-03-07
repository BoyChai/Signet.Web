<template>
  <div class="management-container">
    <n-card
      title="卡密管理"
      :header-style="{ textAlign: 'left', fontSize: '20px' }"
      :segmented="{ content: true }"
      class="main-card"
    >
      <!-- 筛选条件区域 -->
      <div class="filter-section">
        <n-grid :cols="filterColsConfig" x-gap="12" y-gap="16">
          <n-gi>
            <div class="filter-item">
              <span class="filter-label">卡密查询：</span>
              <n-input
                v-model:value="searchKey"
                placeholder="卡密搜索，这里的内容会当作key的前缀搜索"
                class="filter-input"
              />
            </div>
          </n-gi>
          <n-gi>
            <div class="filter-item">
              <span class="filter-label">筛选创建用户：</span>
              <n-select
                default-value="any"
                :options="userSelect"
                :on-update:value="ChangeUserSelect"
                class="filter-select"
              />
            </div>
          </n-gi>
          <n-gi>
            <div class="filter-item">
              <span class="filter-label">卡密种类：</span>
              <n-space>
                <n-radio
                  :checked="getCardType === 99999"
                  value="99999"
                  name="getCardType"
                  @change="changeGetCardType"
                >
                  所有
                </n-radio>
                <n-radio
                  :checked="getCardType === 0"
                  value="0"
                  name="getCardType"
                  @change="changeGetCardType"
                >
                  时卡
                </n-radio>
                <n-radio
                  :checked="getCardType === 1"
                  value="1"
                  name="getCardType"
                  @change="changeGetCardType"
                >
                  次卡
                </n-radio>
              </n-space>
            </div>
          </n-gi>
          <n-gi>
            <div class="filter-item">
              <span class="filter-label">卡密是否已激活：</span>
              <n-space>
                <n-radio
                  :checked="checkedActivation === '0'"
                  value="0"
                  name="activation"
                  @change="ChangeCheckedActivation"
                >
                  所有
                </n-radio>
                <n-radio
                  :checked="checkedActivation === '2'"
                  value="2"
                  name="activation"
                  @change="ChangeCheckedActivation"
                >
                  未激活
                </n-radio>
                <n-radio
                  :checked="checkedActivation === '1'"
                  value="1"
                  name="activation"
                  @change="ChangeCheckedActivation"
                >
                  已激活
                </n-radio>
              </n-space>
            </div>
          </n-gi>
          <n-gi>
            <div class="filter-item">
              <span class="filter-label">是否过滤失效卡密：</span>
              <n-space>
                <n-radio
                  :checked="checkedEffective === '0'"
                  value="0"
                  name="effective"
                  @change="changeEffective"
                >
                  所有
                </n-radio>
                <n-radio
                  :checked="checkedEffective === '1'"
                  value="1"
                  name="effective"
                  @change="changeEffective"
                >
                  未失效
                </n-radio>
                <n-radio
                  :checked="checkedEffective === '2'"
                  value="2"
                  name="effective"
                  @change="changeEffective"
                >
                  已失效
                </n-radio>
              </n-space>
            </div>
          </n-gi>
          <n-gi>
            <div class="filter-item">
              <span class="filter-label">有效期剩余时间筛选：</span>
              <n-select
                default-value="any"
                :options="timeSelect"
                :on-update:value="ChangeTimeSelect"
                class="filter-select"
              />
              <span class="filter-label" style="margin-left: 16px"
                >项目筛选：</span
              >
              <n-auto-complete
                v-model:value="searchProjectSelectValue"
                :input-props="{ autocomplete: 'disabled' }"
                :options="searchProjectSelectOptions"
                placeholder="项目选择"
                clearable
                class="filter-autocomplete"
              />
            </div>
          </n-gi>
          <n-gi>
            <div class="filter-item">
              <span class="filter-label">操作：</span>
              <n-button type="error" ghost @click="batchDeleteCardWarn">
                批量删除
              </n-button>
              <n-button
                type="info"
                ghost
                @click="SearchCard"
                style="margin-left: 12px"
              >
                当前过滤查询
              </n-button>
            </div>
          </n-gi>
          <n-gi>
            <n-button
              type="primary"
              ghost
              @click="openCreateCard"
              class="create-btn"
            >
              创建卡密
            </n-button>
          </n-gi>
        </n-grid>
      </div>

      <!-- 表格区域 -->
      <div class="table-section">
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
          :loading="tableLoading"
          class="data-table"
        />
        <n-pagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :page-count="itemCount"
          show-size-picker
          :page-sizes="[10, 20, 30, 40, 50]"
          :on-update:page="updatePaginationPage"
          :on-update:page-size="updatePaginationPageSize"
          class="pagination"
        />
      </div>
    </n-card>

    <!-- 创建卡密抽屉 -->
    <n-drawer v-model:show="createStatus" :width="drawerWidth">
      <n-drawer-content>
        <template #header><h3>创建卡密</h3></template>
        <n-form
          :label-width="80"
          label-placement="left"
          :disabled="createLoading"
        >
          <n-form-item label="卡密前缀">
            <n-input
              v-model:value="prefix"
              placeholder="Prefix,卡密前缀,例如`tk_`(天卡)"
            />
          </n-form-item>
          <n-form-item label="卡密内容">
            <n-input v-model:value="key" placeholder="Key,留空则自动生成" />
          </n-form-item>
          <n-form-item label="项目选择">
            <n-auto-complete
              v-model:value="projectSelectValue"
              :input-props="{ autocomplete: 'disabled' }"
              :options="projectSelectOptions"
              placeholder="项目选择,默认会创建在Default项目中"
              clearable
            />
          </n-form-item>
          <n-form-item label="卡密类型">
            <n-radio-group v-model:value="cardType" name="cardType">
              <n-radio value="0" @change="setCardType">时卡</n-radio>
              <n-radio value="1" @change="setCardType">次卡</n-radio>
            </n-radio-group>
          </n-form-item>
          <n-form-item v-if="cardType == 0" label="时长选择">
            <n-radio-group v-model:value="date" name="date">
              <n-radio value="一天" @change="setCardOften">一天</n-radio>
              <n-radio value="一周" @change="setCardOften">一周</n-radio>
              <n-radio value="一个月" @change="setCardOften">一个月</n-radio>
              <n-radio value="补卡" @change="setCardOften">补卡</n-radio>
              <n-radio value="其他时间" @change="setCardOften"
                >其他时间</n-radio
              >
            </n-radio-group>
            <n-time-picker
              v-if="date === '补卡'"
              default-formatted-value="00:00:00"
              :on-update:value="setInjuryDate"
              style="margin-top: 12px"
            />
            <n-input
              v-if="date === '其他时间'"
              v-model:value="otherDate"
              placeholder="格式为天-时-分-秒,例如:`1-2-3`为1天2小时3分0秒"
              style="margin-top: 12px"
            />
          </n-form-item>
          <n-form-item v-if="cardType == 0" label="计时方式">
            <n-radio-group v-model:value="immediately" name="immediately">
              <n-radio :value="false" @change="setImmediately"
                >激活后计时</n-radio
              >
              <n-radio :value="true" @change="setImmediately">即时计时</n-radio>
            </n-radio-group>
          </n-form-item>
          <n-form-item label="创建数量">
            <n-input
              v-model:value="quantity"
              :allow-input="onlyAllowNumber"
              placeholder="一次性创建的数量，留空则默认创建1个"
            />
          </n-form-item>
          <n-form-item>
            <n-button @click="createStatus = false" :disabled="createLoading">
              取消
            </n-button>
            <n-button
              type="primary"
              @click="createCard"
              :loading="createLoading"
              style="margin-left: 20px"
            >
              创建
            </n-button>
          </n-form-item>
          <n-form-item label="已创建卡密">
            <n-input
              v-model:value="createCardListResp"
              type="textarea"
              :style="{ height: '300px' }"
              placeholder="创建的卡密可以在这里复制哦,创建卡密时这里会被清空，请注意即时复制"
            />
          </n-form-item>
        </n-form>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, h, computed, watch } from "vue";
import { NButton, useNotification, useDialog } from "naive-ui";

// 抽屉状态
const createStatus = ref(false);

// 引入axios
const { proxy } = getCurrentInstance();
const axios = proxy.$axios;

// 表格列定义
const columns = ref([
  { type: "selection" },
  { title: "项目名称", key: "ProjectName", width: 120 },
  { title: "卡密", key: "Key", width: 360 },
  { title: "创建时间", key: "CreatedAt" },
  { title: "过期时间", key: "EndDate" },
  {
    title: "卡密时长",
    key: "Duration",
    render(row) {
      if (row.Type == 1) return "次卡";
      const days = Math.floor(row.Duration / (24 * 3600));
      const hours = Math.floor((row.Duration % (24 * 3600)) / 3600);
      const minutes = Math.floor((row.Duration % 3600) / 60);
      const seconds = row.Duration % 60;
      if (row.Duration <= 3600)
        return `补卡-${minutes}分${seconds > 0 ? `${seconds}秒` : "整"}`;
      if (row.Duration < 86400)
        return `补卡-${hours}小时${minutes > 0 ? `${minutes}分钟` : "整"}`;
      if (row.Duration < 604800)
        return `天卡-${days}天${hours > 0 ? `${hours}小时` : "整"}`;
      if (row.Duration < 2419200)
        return `周卡-${Math.floor(days / 7)}周${
          Math.floor(days % 7) > 0 ? `${Math.floor(days % 7)}天` : "整"
        }`;
      return `月卡-${Math.floor(days / 30)}个月${
        Math.floor(days % 30) > 0 ? `${Math.floor(days % 30)}天` : "整"
      }`;
    },
  },
  { title: "归属用户", key: "UserName" },
  {
    title: "操作",
    key: "actions",
    render(row) {
      return h(
        NButton,
        { size: "small", onClick: () => deleteCardWarn(row) },
        { default: () => "删除" }
      );
    },
  },
]);

// JWT解析函数
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to parse JWT:", error);
    return null;
  }
};

// 获取用户信息
const getUserInfo = () => {
  const data = parseJwt(localStorage.getItem("jwtToken"));
  if (!data) return;
};

// 初始化用户信息
getUserInfo();

// 变量定义
const tableKey = ref(0);
const page = ref(1);
const rowKey = (data) => data.ID;
const paginationCheckKeys = ref([]);
const pageSize = ref(10);
const itemCount = ref(0);
const createCardListResp = ref("");
const quantity = ref(1);
const userMap = ref([]);
const getCardType = ref(99999);
const checkedEffective = ref("1");
const checkedActivation = ref("0");
const searchKey = ref("");
const userSelect = ref([{ label: "全部", value: "any" }]);
const userSelectID = ref(0);
const timeSelect = ref([
  { label: "全部", value: "any" },
  { label: "一天内", value: "86400" },
  { label: "一周内", value: "604800" },
  { label: "一月内", value: "2419200" },
]);
const timeSelectUnix = ref(0);
const injuryDate = ref(0);
const otherDate = ref("");
const setInjuryDate = (e) => {
  injuryDate.value = e;
};
const projectData = ref([]);
const searchProjectData = ref([]);
const projectSelectValue = ref("");
const searchProjectSelectValue = ref("");
const tableLoading = ref(false);
const createLoading = ref(false);

// 通知函数
const notification = useNotification();
const notify = (type, title, text) => {
  notification[type]({
    content: title,
    meta: text,
    duration: 2500,
    keepAliveOnHover: true,
  });
};

// 筛选条件处理函数
const ChangeUserSelect = (e) => {
  userSelectID.value = e === "any" ? 0 : e;
};

const ChangeTimeSelect = (e) => {
  timeSelectUnix.value = e === "any" ? "" : e;
};

const ChangeCheckedActivation = (key) => {
  checkedActivation.value = key.target.value;
};

const changeEffective = (key) => {
  checkedEffective.value = key.target.value;
};

const changeGetCardType = (key) => {
  getCardType.value = parseInt(key.target.value);
};

// 打开创建卡密抽屉
const openCreateCard = () => {
  projectSelectValue.value = "";
  projectData.value = [];
  injuryDate.value = 0;
  otherDate.value = "";
  prefix.value = "";
  key.value = "";
  date.value = "一天";
  quantity.value = 1;
  immediately.value = false;
  createStatus.value = true;
};

// 删除卡密
const deleteCard = (row) => {
  axios
    .delete("/api/card/delete", { data: { id: [row.ID] } })
    .then((res) => {
      notify("success", "信息", "删除" + row.Key + "卡密成功");
      getCardList();
    })
    .catch((err) => {
      notify("error", "错误", err.request.response);
    });
};

// 批量删除卡密
const batchDeleteCard = () => {
  axios
    .delete("/api/card/delete", { data: { id: paginationCheckKeys.value } })
    .then((res) => {
      notify(
        "success",
        "信息",
        "成功删除" + paginationCheckKeys.value.length + "张卡密"
      );
      const page_number =
        page.value === itemCount.value ? page.value - 1 : undefined;
      getCardList(page_number);
    })
    .catch((err) => {
      notify("error", "错误", err.response.data.msg);
    });
};

// 表数据
const data = ref([]);

// 获取用户列表
const getUserList = () => {
  axios
    .get("/api/user/getList")
    .then((res) => {
      userSelect.value = [{ label: "全部", value: "any" }];
      userMap.value = res.data;
      res.data.forEach((item) => {
        userSelect.value.push({ label: item.Name, value: item.ID });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
getUserList();

// 获取卡密列表
const getCardList = async (page_number) => {
  paginationCheckKeys.value = [];
  tableKey.value++;
  tableLoading.value = true;

  if (
    searchProjectSelectValue.value !== "" &&
    searchProjectData.value.length === 0
  ) {
    notify("error", "错误", "请先选择正确的项目");
    tableLoading.value = false;
    return;
  }

  const projectID = searchProjectData.value[0]?.ID || 0;
  page_number = page_number || page.value;

  try {
    const res = await axios.get(
      `/api/card/getList?page=${page_number}&pageSize=${pageSize.value}&key=${searchKey.value}&user=${userSelectID.value}&active=${checkedActivation.value}&effective=${checkedEffective.value}&expire=${timeSelectUnix.value}&projectID=${projectID}&cardType=${getCardType.value}`
    );
    res.data.list.forEach((item) => {
      item.EndDate =
        item.EndDate === "0001-01-01T00:00:00Z"
          ? "暂未使用或激活"
          : new Date(item.EndDate).toLocaleString().substring(0, 19);
      item.CreatedAt = new Date(item.CreatedAt)
        .toLocaleString()
        .substring(0, 19);
      if (item.UserID) {
        const user = userMap.value.find((u) => u.ID === item.UserID);
        item.UserName = user ? user.Name : item.UserID;
      }
    });
    data.value = res.data.list;
    itemCount.value = res.data.total;
    if (page_number !== page.value) page.value = page_number;
  } catch (err) {
    console.log(err);
  } finally {
    setTimeout(() => {
      tableLoading.value = false; // 延迟关闭加载状态，避免立即触发重绘
    }, 100);
  }
};
getCardList();

// 搜索卡密
const SearchCard = () => {
  page.value = 1;
  getCardList();
};

// 创建卡密相关变量
const key = ref("");
const prefix = ref("");
const date = ref("一天");
const immediately = ref(false);
const cardType = ref(0);

const setCardOften = (e) => {
  date.value = e.target.value;
};

const setCardType = (e) => {
  cardType.value = parseInt(e.target.value);
};

const setImmediately = (e) => {
  immediately.value = e.target.value === "true";
};

const onlyAllowNumber = (value) => {
  if (!value) return true;
  return /^\d+$/.test(value) && Number(value) >= 1;
};

// 时间计算
const getTimeInSeconds = (date) => {
  switch (date) {
    case "一天":
      return 24 * 60 * 60;
    case "一周":
      return 7 * 24 * 60 * 60;
    case "一个月":
      return 30 * 24 * 60 * 60;
    case "补卡":
      if (injuryDate.value === 0) {
        notify("error", "错误", "补卡创建时间为0,请填写补卡时长");
        return 0;
      }
      const d = new Date(injuryDate.value);
      return d.getHours() * 60 * 60 + d.getMinutes() * 60 + d.getSeconds();
    case "其他时间":
      if (!otherDate.value || typeof otherDate.value !== "string") {
        notify("error", "错误", "其他时间创建时间为空,请按照格式填写时长");
        return 0;
      }
      const dateList = otherDate.value.split("-");
      let sumtime = 0;
      sumtime += (parseInt(dateList[0]) || 0) * 24 * 60 * 60; // 天
      sumtime += (parseInt(dateList[1]) || 0) * 60 * 60; // 时
      sumtime += (parseInt(dateList[2]) || 0) * 60; // 分
      sumtime += parseInt(dateList[3]) || 0; // 秒
      if (sumtime === 0) {
        notify("error", "错误", "其他时间创建时间为0,请填写时长");
        return 0;
      }
      return sumtime;
    default:
      return 0;
  }
};

// 创建卡密
const createCard = async () => {
  if (projectSelectValue.value !== "" && projectData.value.length === 0) {
    notify("error", "错误", "请先选择正确的项目");
    return;
  }

  const projectID = projectData.value[0]?.ID || 0;
  const targetTimestamp = getTimeInSeconds(date.value);
  if (targetTimestamp === 0) return;

  createLoading.value = true;
  createCardListResp.value = "";

  try {
    if (quantity.value > 1) {
      const requests = Array.from({ length: quantity.value }, () =>
        axios.post("/api/card/create", {
          prefix: prefix.value,
          time: targetTimestamp,
          immediately: immediately.value,
          project_id: projectID,
          card_type: cardType.value,
        })
      );
      const responses = await Promise.all(requests);
      createCardListResp.value = responses.map((res) => res.data).join("\n");
      notify(
        "success",
        "信息",
        `创建${quantity.value}张卡密成功,请在创建卡密区域复制`
      );
    } else {
      const res = await axios.post("/api/card/create", {
        prefix: prefix.value,
        key: key.value,
        time: targetTimestamp,
        immediately: immediately.value,
        project_id: projectID,
        card_type: cardType.value,
      });
      createCardListResp.value = res.data;
      notify("success", "信息", `${res.data} ${res.msg}`);
    }
    // 延迟刷新表格，避免立即触发 ResizeObserver 错误
    setTimeout(() => {
      getCardList();
    }, 300);
  } catch (err) {
    console.error(err);
    notify("error", "错误", err.response?.data?.msg || "创建卡密失败");
  } finally {
    createLoading.value = false;
  }
};

// 删除提示
const dialog = useDialog();
const deleteCardWarn = (row) => {
  dialog.warning({
    title: "警告",
    content: "你确定？",
    positiveText: "确定",
    negativeText: "不确定",
    onPositiveClick: () => deleteCard(row),
  });
};

const batchDeleteCardWarn = () => {
  dialog.warning({
    title: "警告",
    content: "你确定删除" + paginationCheckKeys.value.length + "张卡密？",
    positiveText: "确定",
    negativeText: "不确定",
    onPositiveClick: batchDeleteCard,
  });
};

// 分页处理
const updatePaginationPage = (newPage) => {
  paginationCheckKeys.value = [];
  tableKey.value++;
  page.value = newPage;
  getCardList();
};

const updatePaginationPageSize = (newPageSize) => {
  paginationCheckKeys.value = [];
  tableKey.value++;
  pageSize.value = newPageSize;
  page.value = 1;
  getCardList();
};

const handlePaginationCheck = (keys) => {
  paginationCheckKeys.value = keys;
};

// 项目搜索
const searchProject = (key, t) => {
  axios
    .post("/api/project/search", { name: key })
    .then((res) => {
      if (t === "search") searchProjectData.value = res.data;
      else projectData.value = res.data;
    })
    .catch((err) => {
      projectData.value = [];
    });
};

watch(projectSelectValue, (newValue) => {
  if (newValue) searchProject(newValue);
  else projectData.value = [];
});

const projectSelectOptions = computed(() => {
  return projectData.value.map((project) => ({
    label: project.Name,
    value: project.ID,
  }));
});

watch(searchProjectSelectValue, (newValue) => {
  if (newValue) searchProject(newValue, "search");
  else searchProjectData.value = [];
});

const searchProjectSelectOptions = computed(() => {
  return searchProjectData.value.map((project) => ({
    label: project.Name,
    value: project.ID,
  }));
});

// 获取项目名称
const getProjectName = () => {
  const ids = [...new Set(data.value.map((item) => item.ProjectID))];
  axios
    .post("/api/project/getByIds", { ids })
    .then((res) => {
      if (Array.isArray(res.data) && Array.isArray(data.value)) {
        data.value.forEach((item) => {
          const project = res.data.find((p) => p.ID === item.ProjectID);
          if (project) item.ProjectName = project.Name;
        });
      }
    })
    .catch((err) => {
      console.log("Error occurred during API request:", err);
    });
};

// 响应式配置
const filterColsConfig = ref("1 600:2 900:3");
const drawerWidth = computed(() =>
  window.innerWidth < 600 ? "100%" : "502px"
);
</script>

<style scoped>
.management-container {
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

.filter-section {
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 24px;
}

.filter-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-label {
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
}

.filter-input,
.filter-autocomplete {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  width: 180px;
}

.table-section {
  padding: 0 16px 16px;
}

.data-table {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pagination {
  margin-top: 16px;
  float: right;
}

.create-btn {
  float: right;
}

@media (max-width: 900px) {
  .management-container {
    padding: 8px;
  }

  .filter-section {
    padding: 12px;
  }

  .filter-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-input,
  .filter-select,
  .filter-autocomplete {
    width: 100%;
  }

  .create-btn {
    float: none;
    width: 100%;
  }
}

@media (max-width: 600px) {
  .main-card {
    box-shadow: none;
  }

  .data-table {
    font-size: 12px;
  }

  .data-table td {
    padding: 6px;
  }
}
</style>
