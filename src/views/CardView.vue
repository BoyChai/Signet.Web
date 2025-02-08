<template>
  <div style="background-color: #f5f7f9; padding: 10px; padding-top: 12px">
    <n-card
      title="卡密管理"
      :header-style="{ textAlign: 'left', fontSize: '20px' }"
      :segmented="{
        content: true,
      }"
    >
      <n-grid x-gap="12" :cols="3">
        <n-gi>
          <div style="display: flex; align-items: center">
            <span style="font-size: 15px; font-weight: 500">卡密查询：</span>
            <!-- 左侧对齐 -->
            <n-input
              style="width: 55%; text-align: left"
              placeholder="卡密搜索，这里的内容会当作key的前缀搜索"
              v-model:value="searchKey"
            ></n-input>
          </div>
        </n-gi>
      </n-grid>
      <n-grid style="margin-top: 15px" x-gap="12" :cols="2">
        <n-gi>
          <div style="display: flex; align-items: center">
            <span style="font-size: 15px; font-weight: 500"
              >筛选创建用户：</span
            >
            <n-select
              default-value="any"
              :options="userSelect"
              style="width: 20%; margin-left: 10px"
              :on-update:value="ChangeUserSelect"
            />
          </div>
        </n-gi>
      </n-grid>
      <n-grid style="margin-top: 15px" x-gap="12" :cols="2">
        <n-gi>
          <div style="display: flex; align-items: center">
            <span style="font-size: 15px; font-weight: 500"
              >卡密是否已激活：</span
            >
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
                未激活 </n-radio
              ><n-radio
                :checked="checkedActivation === '1'"
                value="1"
                name="activation"
                @change="ChangeCheckedActivation"
              >
                已激活
              </n-radio>
            </n-space>
          </div>
        </n-gi> </n-grid
      ><n-grid style="margin-top: 15px" x-gap="12" :cols="2">
        <n-gi>
          <div style="display: flex; align-items: center">
            <span style="font-size: 15px; font-weight: 500"
              >是否过滤失效卡密：</span
            >
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
                未失效 </n-radio
              ><n-radio
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
      </n-grid>
      <n-grid style="margin-top: 15px" x-gap="12" :cols="2">
        <n-gi>
          <div style="display: flex; align-items: center">
            <span style="font-size: 15px; font-weight: 500"
              >有效期剩余时间筛选：</span
            >
            <n-select
              default-value="any"
              :options="timeSelect"
              style="width: 20%; margin-left: 8px"
              :on-update:value="ChangeTimeSelect"
            />
            <span style="font-size: 15px; font-weight: 500; margin-left: 15px"
              >项目筛选：</span
            >
            <n-auto-complete
              style="width: 25%; margin-left: 8px"
              v-model:value="searchProjectSelectValue"
              :input-props="{
                autocomplete: 'disabled',
              }"
              :options="searchProjectSelectOptions"
              placeholder="项目选择"
              clearable
            />
          </div>
        </n-gi>
      </n-grid>
      <n-grid style="margin-top: 15px" x-gap="12" :cols="2">
        <n-gi>
          <div style="display: flex; align-items: center">
            <span style="font-size: 15px; font-weight: 500">操作：</span>
            <n-button @click="batchDeleteCardWarn" type="error" ghost>
              批量删除
            </n-button>

            <n-button
              style="margin-left: 10px"
              type="info"
              @click="SearchCard"
              ghost
            >
              当前过滤查询
            </n-button>
          </div>
        </n-gi>
        <n-gi>
          <n-button
            style="float: right"
            type="primary"
            @click="openCreateCard"
            ghost
          >
            创建卡密
          </n-button></n-gi
        >
      </n-grid>

      <div style="height: 30px"></div>
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
    </n-card>
  </div>

  <n-drawer v-model:show="createStatus" :width="502">
    <n-drawer-content>
      <template #header> <h3>创建卡密</h3> </template>
      <n-input
        v-model:value="prefix"
        placeholder="Prefix,卡密前缀,例如`tk_`(天卡)"
      />
      <div style="height: 15px"></div>
      <n-input v-model:value="key" placeholder="Key,留空则自动生成" />
      <div style="height: 15px"></div>
      <n-auto-complete
        v-model:value="projectSelectValue"
        :input-props="{
          autocomplete: 'disabled',
        }"
        :options="projectSelectOptions"
        placeholder="项目选择,默认会创建在Default项目中"
        clearable
      />
      <div style="height: 15px"></div>
      <n-radio
        :checked="date === '一天'"
        value="一天"
        name="date"
        @change="setCardOften"
      >
        一天
      </n-radio>
      <n-radio
        :checked="date === '一周'"
        value="一周"
        name="date"
        @change="setCardOften"
      >
        一周
      </n-radio>
      <n-radio
        :checked="date === '一个月'"
        value="一个月"
        name="date"
        @change="setCardOften"
      >
        一个月
      </n-radio>
      <n-radio
        :checked="date === '补卡'"
        value="补卡"
        name="date"
        @change="setCardOften"
      >
        补卡
      </n-radio>
      <n-radio
        :checked="date === '其他时间'"
        value="其他时间"
        name="date"
        @change="setCardOften"
      >
        其他时间
      </n-radio>
      <!-- 如果选择了"补卡"，则显示输入框 -->
      <n-time-picker
        v-if="date === '补卡'"
        style="margin-top: 10px"
        default-formatted-value="00:00:00"
        :on-update:value="setInjuryDate"
      />
      <n-input
        v-if="date === '其他时间'"
        style="margin-top: 10px"
        placeholder="格式为天-时-分-秒,例如:`1-2-3`为1天2小时3分0秒"
        v-model:value="otherDate"
      />

      <div style="height: 15px"></div>
      <n-radio
        :checked="immediately === false"
        value="false"
        name="immediately"
        @change="setImmediately"
      >
        激活后计时
      </n-radio>
      <n-radio
        :checked="immediately === true"
        value="true"
        name="immediately"
        @change="setImmediately"
      >
        即时计时
      </n-radio>

      <div style="margin-top: 20px">
        <n-input
          v-model:value="quantity"
          :allow-input="onlyAllowNumber"
          placeholder="一次性创建的数量，留空则默认创建1个"
        />
        <div style="height: 10px"></div>
        <n-button @click="createStatus = false">取消</n-button>
        <n-button style="margin-left: 20px" @click="createCard">创建</n-button>
      </div>
      <div style="margin-top: 100px">
        <h3>已被创建卡密</h3>
        <n-input
          style="height: 400px"
          v-model:value="createCardListResp"
          type="textarea"
          placeholder="创建的卡密可以在这里复制哦,创建卡密的时候这里会被清空，请注意即时复制"
        />
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { ref, getCurrentInstance, h, computed, watch } from "vue";
import { NButton, useNotification, useDialog } from "naive-ui";

const createStatus = ref(false);

// 引入axios
const { proxy } = getCurrentInstance();
const axios = proxy.$axios;

// 列名称
const columns = ref([
  {
    type: "selection",
  },
  { title: "项目名称", key: "ProjectName", width: 120 },
  { title: "卡密", key: "Key", width: 360 },
  { title: "创建时间", key: "CreatedAt" },
  { title: "过期时间", key: "EndDate" },
  {
    title: "卡密时长",
    key: "Duration",
    render(row) {
      const days = Math.floor(row.Duration / (24 * 3600)); // 计算天数
      const hours = Math.floor((row.Duration % (24 * 3600)) / 3600); // 计算小时数
      const minutes = Math.floor((row.Duration % 3600) / 60); // 计算分钟数
      const seconds = row.Duration % 60; // 计算秒数
      if (row.Duration <= 3600) {
        return `补卡-${minutes}分${seconds > 0 ? `${seconds}秒` : "整"}`;
      }
      if (row.Duration < 86400) {
        return `补卡-${hours}小时${minutes > 0 ? `${minutes}分钟` : "整"}`;
      }
      //  天卡
      if (row.Duration < 604800) {
        return `天卡-${days}天${hours > 0 ? `${hours}小时` : "整"}`;
      }
      // 周卡
      if (row.Duration < 2419200) {
        return `周卡-${Math.floor(days / 7)}周${
          Math.floor(days % 7) > 0 ? `${Math.floor(days % 7)}天` : "整"
        }`;
      }
      // 月卡
      return `月卡-${Math.floor(days / 30)}个月${
        Math.floor(days % 30) > 0 ? `${Math.floor(days % 30)}天` : "整"
      }`;
    },
  },
  //   { title: "更新时间", key: "UpdatedAt" },
  { title: "归属用户", key: "UserName" },
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

// const userRole = ref(0);
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
const getUserInfo = () => {
  var data = parseJwt(localStorage.getItem("jwtToken"));
  if (!data) {
    return;
  }
  //   userRole.value = data.role;
};
getUserInfo();

// if (userRole.value <= 1) {
//   columns.value.splice(columns.value.length - 1, 0, {
//     title: "归属用户",
//     key: "UserID",
//   });
// }
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
// 项目搜索存储
const projectSelectValue = ref("");

// 检索卡密搜索存储
const searchProjectSelectValue = ref("");

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

const ChangeUserSelect = (e) => {
  if (e == "any") {
    userSelectID.value = 0;
    return;
  }
  userSelectID.value = e;
};
const ChangeTimeSelect = (e) => {
  if (e == "any") {
    timeSelectUnix.value = "";
    return;
  }
  timeSelectUnix.value = e;
};
// 打开创建框
const openCreateCard = () => {
  projectSelectValue.value = "";
  projectData.value = [];
  injuryDate.value = 0;
  otherDate.value = "";
  prefix.value = "";
  key.value = "";
  //   datetime.value = 0;
  date.value = "一天";
  quantity.value = 1;
  immediately.value = false;
  createStatus.value = true;
};

const deleteCard = (row) => {
  axios
    .delete("/api/card/delete", {
      data: {
        id: [row.ID],
      },
    })
    .then((res) => {
      notify("success", "信息", "删除" + row.Key + "卡密成功");
      getCardList();
    })
    .catch((err) => {
      notify("error", "错误", err.request.response);
    });
};

const batchDeleteCard = () => {
  axios
    .delete("/api/card/delete", {
      data: {
        id: paginationCheckKeys.value,
      },
    })
    .then((res) => {
      notify(
        "success",
        "信息",
        "成功删除" + paginationCheckKeys.value.length + "张卡密"
      );
      var page_number;
      if (page.value == itemCount.value) {
        page_number = page.value - 1;
      }
      getCardList(page_number);
    })
    .catch((err) => {
      console.log(err);
      notify("error", "错误", err.response.data.msg);
    });
};
// 表数据
const data = ref([]);

// 获取user列表
const getUserList = () => {
  axios
    .get("/api/user/getList")
    .then((res) => {
      userSelect.value = [{ label: "全部", value: "any" }];
      userMap.value = res.data;
      res.data.forEach((item) => {
        // 将user名字追加到userSelect中
        userSelect.value.push({ label: item.Name, value: item.ID });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
getUserList();
// 获取所有卡密
const getCardList = (page_number) => {
  paginationCheckKeys.value = [];
  tableKey.value++;
  if (
    searchProjectSelectValue.value !== "" &&
    searchProjectData.value.length === 0
  ) {
    notify("error", "错误", "请先选择正确的项目");
    return;
  }

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
  page_number = page_number || page.value;
  axios
    .get(
      "/api/card/getList?page=" +
        page_number +
        "&pageSize=" +
        pageSize.value +
        "&key=" +
        searchKey.value +
        "&user=" +
        userSelectID.value +
        "&active=" +
        checkedActivation.value +
        "&effective=" +
        checkedEffective.value +
        "&expire=" +
        timeSelectUnix.value +
        "&projectID=" +
        projectID
    )
    .then((res) => {
      // 遍历数组，处理 EndDate 字段
      res.data.list.forEach((item) => {
        // 使用 toISOString() 将日期转换为 ISO 8601 格式字符串，然后截取所需部分
        if (item.EndDate) {
          if (item.EndDate == "0001-01-01T00:00:00Z") {
            item.EndDate = "暂未使用或激活";
          } else {
            item.EndDate = new Date(item.EndDate)
              .toLocaleString()
              .substring(0, 19); // 截取到秒的部分
          }
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
        if (item.UserID) {
          userMap.value.forEach((user) => {
            if (user.ID == item.UserID) {
              item.UserID = user.Name;
            }
          });
        }
      });
      data.value = res.data.list;
      //   getProjectName();
      itemCount.value = res.data.total;
      if (page_number != page.value) {
        page.value = page_number;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
getCardList();
const dialog = useDialog();
const SearchCard = () => {
  page.value = 1;
  getCardList();
};

const key = ref("");
const prefix = ref("");
// const datetime = ref(undefined);
const date = ref("一天");
const immediately = ref(false);
const setCardOften = (e) => {
  date.value = e.target.value;
};
const setImmediately = (e) => {
  if (e.target.value == "true") {
    immediately.value = true;
  } else {
    immediately.value = false;
  }
};
// 只允许输入数字
const onlyAllowNumber = (value) => {
  // 如果值为空，返回 true
  if (!value) {
    return true;
  }

  // 使用正则表达式检查值是否只包含数字，并且值不小于 1
  const isNumeric = /^\d+$/.test(value) && Number(value) >= 1;

  // 返回检查结果
  return isNumeric;
};
// 时间计算
const getTimeInSeconds = (date) => {
  switch (date) {
    case "一天":
      return 24 * 60 * 60; // 一天的秒数
    case "一周":
      return 7 * 24 * 60 * 60; // 一周的秒数
    case "一个月":
      return 30 * 24 * 60 * 60; // 一个月的秒数（假设30天）
    case "补卡":
      if (injuryDate.value === 0) {
        notify("error", "错误", "补卡创建时间为0,请填写补卡时常");
        return 0; // 终止函数执行
      }
      const date = new Date(injuryDate.value); // 将时间戳转换为 Date 对象
      // 保留当天的小时、分钟、秒，获取这部分的时间戳
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      return hours * 60 * 60 + minutes * 60 + seconds;
    case "其他时间":
      // 切割格式1-2-3-4天时分秒,分割后数组
      var dateList = otherDate.value.split("-");
      if (!otherDate.value || typeof otherDate.value !== "string") {
        notify("error", "错误", "其他时间创建时间为空,请按照格式填写时长");
        return 0; // 终止函数执行
      }
      var sumtime = 0;
      for (let i = 0; i < dateList.length; i++) {
        // 天
        if (i == 0) {
          sumtime += dateList[i] * 24 * 60 * 60;
        }
        // 时
        if (i == 1) {
          sumtime += dateList[i] * 60 * 60;
        }
        // 分
        if (i == 2) {
          sumtime += dateList[i] * 60;
        }
        // 秒
        if (i == 3) {
          sumtime += dateList[i];
        }
      }
      if (sumtime == 0) {
        notify("error", "错误", "其他时间创建时间为0,请填写时长");
        return 0; // 终止函数执行
      }
      return sumtime;
    default:
      return 0;
  }
};

const createCard = () => {
  // 项目id确认
  //   if (projectData.value.length == 0) {
  //     notify("error", "错误", "请先选择正确的项目");
  //     return;
  //   }

  if (projectSelectValue.value !== "" && projectData.value.length === 0) {
    notify("error", "错误", "请先选择正确的项目");
    return;
  }

  var projectID = 0;

  if (!projectData.value || projectData.value.length === 0) {
    // 如果 projectData 为空或没有元素，projectID 设置为 0
    console.log("projectData is empty, projectID set to 0");
  } else {
    // 如果 projectData 不为空，检查 ID 是否有效
    if (
      projectData.value[0].ID !== undefined &&
      projectData.value[0].ID !== null
    ) {
      projectID = projectData.value[0].ID;
    }
  }

  // 时间计算
  const targetTimestamp = getTimeInSeconds(date.value); // 根据选择的时间计算的秒数
  if (targetTimestamp == 0) {
    return;
  }
  if (quantity.value > 1) {
    createCardListResp.value = "";
    for (let i = 0; i < quantity.value; i++) {
      axios
        .post("/api/card/create", {
          prefix: prefix.value,
          time: targetTimestamp,
          immediately: immediately.value,
          projectID: projectID,
        })
        .then((res) => {
          createCardListResp.value += res.data + "\n";
        })
        .catch((err) => {
          console.log(err);

          notify("error", "错误", err.request.response);
          return;
        });
    }
    // 一秒后执行
    setTimeout(() => {
      getCardList();
      notify(
        "success",
        "信息",
        "创建" + quantity.value + "张卡密成功,请在创建卡密区域复制"
      );
    }, 800);

    return;
  }
  axios
    .post("/api/card/create", {
      prefix: prefix.value,
      key: key.value,
      //   time: datetime.value / 1000,
      time: targetTimestamp,
      immediately: immediately.value,
      projectID: projectID,
    })
    .then((res) => {
      createCardListResp.value = "";
      createCardListResp.value += res.data;
      notify("success", "信息", res.data + " " + res.msg);
      //   createStatus.value = false;

      getCardList();
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
const batchDeleteCardWarn = () => {
  dialog.warning({
    title: "警告",
    content: "你确定删除" + paginationCheckKeys.value.length + "张卡密？",
    positiveText: "确定",
    negativeText: "不确定",
    onPositiveClick: () => {
      batchDeleteCard();
    },
  });
};

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

// 卡密是否已经激活

const ChangeCheckedActivation = (key) => {
  checkedActivation.value = key.target.value;
};

// 卡密是否已经过期
const changeEffective = (key) => {
  checkedEffective.value = key.target.value;
};

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
// 项目选择
// 监听项目选择值变化，触发搜索请求
watch(projectSelectValue, (newValue) => {
  if (newValue) {
    searchProject(newValue);
  } else {
    projectData.value = []; // 如果选择为空，清空项目数据
  }
});

// 计算项目选择的选项
const projectSelectOptions = computed(() => {
  return projectData.value.map((project) => {
    return {
      label: project.Name, // 项目名称作为label
      value: project.ID, // 项目ID作为value
    };
  });
});
// 卡密检索
watch(searchProjectSelectValue, (newValue) => {
  if (newValue) {
    searchProject(newValue, "search");
  } else {
    searchProjectData.value = []; // 如果选择为空，清空项目数据
  }
});

// 计算项目选择的选项
const searchProjectSelectOptions = computed(() => {
  return searchProjectData.value.map((project) => {
    return {
      label: project.Name, // 项目名称作为label
      value: project.ID, // 项目ID作为value
    };
  });
});

// 获取当前卡密列表的项目名称
const getProjectName = () => {
  const ids = [...new Set(data.value.map((item) => item.ProjectID))]; // 获取唯一的 ProjectID
  axios
    .post("/api/project/getByIds", { ids })
    .then((res) => {
      // 检查返回的数据结构
      if (Array.isArray(res.data) && Array.isArray(data.value)) {
        for (let i = 0; i < data.value.length; i++) {
          for (let j = 0; j < res.data.length; j++) {
            if (data.value[i].ProjectID == res.data[j].ID) {
              data.value[i].ProjectID = res.data[j].Name;
              break;
            }
          }
        }
      } else {
        console.error("Response data is not an array:", res.data.data);
      }
      console.log(data.value);
    })
    .catch((err) => {
      console.log("Error occurred during API request:", err);
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
