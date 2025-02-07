<template>
  <div style="background-color: #f5f7f9; padding: 10px; padding-top: 12px">
    <n-card
      title="控制台"
      :header-style="{ textAlign: 'left', fontSize: '20px' }"
      :segmented="{
        content: true,
      }"
    >
      <n-grid x-gap="12" :cols="4">
        <n-gi>
          <n-card
            title="本站托管卡密总数"
            :header-style="{ textAlign: 'left', fontSize: '20px' }"
            :segmented="{
              content: true,
            }"
            ><n-statistic label="此数据只是当前用户所管理的卡密" tabular-nums>
              <n-number-animation
                ref="numberAnimationInstRef"
                :from="0"
                :to="totalKeys"
              />
              <template #suffix> 个卡密 </template>
            </n-statistic>
            <n-space vertical>
              每一个数字，都是你努力的见证。
              <!-- <n-button @click="handleClick"> 播放 </n-button> -->
            </n-space></n-card
          >
        </n-gi>
        <n-gi>
          <n-card
            title="当天创建卡密总数"
            :header-style="{ textAlign: 'left', fontSize: '20px' }"
            :segmented="{
              content: true,
            }"
            ><n-statistic label="此数据只是当前用户所管理的卡密" tabular-nums>
              <n-number-animation
                ref="numberAnimationInstRef"
                :from="0"
                :to="createdToday"
              />
              <template #suffix> 个卡密 </template>
            </n-statistic>
            <n-space vertical>
              一分耕耘，一分收获，今日的努力成就未来。
              <!-- <n-button @click="handleClick"> 播放 </n-button> -->
            </n-space></n-card
          >
        </n-gi>
        <n-gi>
          <n-card
            title="当天激活卡密总数"
            :header-style="{ textAlign: 'left', fontSize: '20px' }"
            :segmented="{
              content: true,
            }"
            ><n-statistic label="此数据只是当前用户所管理的卡密" tabular-nums>
              <n-number-animation
                ref="numberAnimationInstRef"
                :from="0"
                :to="activatedToday"
              />
              <template #suffix> 个卡密 </template>
            </n-statistic>
            <n-space vertical>
              努力终会被看见，付出总会有回报。
              <!-- <n-button @click="handleClick"> 播放 </n-button> -->
            </n-space></n-card
          >
        </n-gi>
        <n-gi>
          <n-card
            title="当天已过期卡密总数"
            :header-style="{ textAlign: 'left', fontSize: '20px' }"
            :segmented="{
              content: true,
            }"
            ><n-statistic label="此数据只是当前用户所管理的卡密" tabular-nums>
              <n-number-animation
                ref="numberAnimationInstRef"
                :from="0"
                :to="expiredToday"
              />
              <template #suffix> 个卡密 </template>
            </n-statistic>
            <n-space vertical>
              过期的并不代表失去，而是新的开始。
              <!-- <n-button @click="handleClick"> 播放 </n-button> -->
            </n-space></n-card
          >
        </n-gi>
      </n-grid>
      <n-grid style="margin-top: 12px" x-gap="12" :cols="3">
        <n-gi>
          <n-card
            title="当天将要过期卡密"
            :header-style="{ textAlign: 'left', fontSize: '20px' }"
            :segmented="{
              content: true,
            }"
            ><n-statistic label="此数据只是当前用户所管理的卡密" tabular-nums>
              <n-number-animation
                ref="numberAnimationInstRef"
                :from="0"
                :to="expiredWithinDay"
              />
              <template #suffix> 个卡密 </template>
            </n-statistic>
            <n-space vertical>
              该提醒客户续费喽。
              <!-- <n-button @click="handleClick"> 播放 </n-button> -->
            </n-space></n-card
          >
        </n-gi>
        <n-gi>
          <n-card
            title="未激活卡密总数"
            :header-style="{ textAlign: 'left', fontSize: '20px' }"
            :segmented="{
              content: true,
            }"
            ><n-statistic label="此数据只是当前用户所管理的卡密" tabular-nums>
              <n-number-animation
                ref="numberAnimationInstRef"
                :from="0"
                :to="unactivatedKeys"
              />
              <template #suffix> 个卡密 </template>
            </n-statistic>
            <n-space vertical>
              每个未激活的可能，都是潜藏的希望。
              <!-- <n-button @click="handleClick"> 播放 </n-button> -->
            </n-space></n-card
          >
        </n-gi>
        <n-gi>
          <n-card
            title="总使用次数"
            :header-style="{ textAlign: 'left', fontSize: '20px' }"
            :segmented="{
              content: true,
            }"
            ><n-statistic label="此数据只是当前用户所管理的卡密" tabular-nums>
              <n-number-animation
                ref="numberAnimationInstRef"
                :from="0"
                :to="totalUsageCount"
              />
              <template #suffix> 次使用 </template>
            </n-statistic>
            <n-space vertical>
              每一次使用，都是对你辛劳的最好肯定。
              <!-- <n-button @click="handleClick"> 播放 </n-button> -->
            </n-space></n-card
          >
        </n-gi>
      </n-grid>
    </n-card>
    <!-- 第二排 -->
    <n-grid x-gap="12" style="height: 500px; margin-top: 10px" :cols="3">
      <n-gi>
        <n-card
          title="当天激活卡密(10条)"
          :segmented="{
            content: true,
          }"
        >
          <n-table :bordered="true" :single-line="false">
            <thead>
              <tr>
                <th>卡密ID</th>
                <th>激活时间</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(v, k) in ActiveCard"
                :key="k"
                :class="{ 'empty-row': !v.CardID }"
              >
                <td>{{ v.CardID }}</td>
                <td>{{ formatDate(v.CreatedAt) }}</td>
              </tr>
              <tr>
                <td>···············</td>
                <td>······</td>
              </tr>
            </tbody>
          </n-table></n-card
        > </n-gi
      ><n-gi>
        <n-card
          title="当天过期卡密列表(10条)"
          :segmented="{
            content: true,
          }"
        >
          <n-table :bordered="true" :single-line="false">
            <thead>
              <tr>
                <th>卡密ID</th>
                <th>激活类型</th>
                <th>过期时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(v, k) in ExpiredCard" :key="k">
                <td>{{ v.Key }}</td>
                <td>{{ getActiveType(v.Duration) }}</td>
                <td>{{ formatDate(v.EndDate) }}</td>
              </tr>
              <tr>
                <td>···············</td>
                <td>······</td>
                <td>······</td>
              </tr>
            </tbody>
          </n-table></n-card
        > </n-gi
      ><n-gi>
        <n-card
          title="当天激活记录(10条)"
          :segmented="{
            content: true,
          }"
        >
          <n-table :bordered="true" :single-line="false">
            <thead>
              <tr>
                <th>卡密ID</th>
                <th>操作类型</th>
                <th>执行时间</th>
                <th>详情</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(v, k) in TodaysActiveRecords" :key="k">
                <td>{{ v.CardID }}</td>
                <td>{{ mapRecordType(v.Type) }}</td>
                <td>{{ formatDate(v.CreatedAt) }}</td>
                <td>{{ v.Details }}</td>
              </tr>
              <tr>
                <td>···············</td>
                <td>······</td>
                <td>······</td>
                <td>······</td>
              </tr>
            </tbody>
          </n-table></n-card
        >
      </n-gi>
    </n-grid>
  </div>
</template>
<script setup>
import { ref } from "vue";

const totalKeys = ref("0");
const createdToday = ref("0");
const activatedToday = ref("0");
const expiredToday = ref("0");
const expiredWithinDay = ref("0");
const unactivatedKeys = ref("0");
const totalUsageCount = ref("0");

const numberAnimationInstRef = ref(null);

import { getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();
const axios = proxy.$axios;

const formatDate = (date) => {
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const seconds = d.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

// const paddedData = (cardArray, targetRows) => {
//   // 如果 cardArray 不是数组，初始化为空数组
//   const padded = Array.isArray(cardArray) ? [...cardArray] : [];

//   const emptyRows = targetRows - padded.length; // 计算需要补充的空行数

//   // 如果少于目标行数，补充空数据
//   for (let i = 0; i < emptyRows; i++) {
//     padded.push({ CardID: "暂无数据", CreatedAt: "暂无数据" });
//   }

//   return padded;
// };
const RecordTypeString = {
  0: "卡密激活",
  1: "设备绑定",
  2: "解绑成功",
  3: "解绑失败",
  4: "校验成功",
  5: "校验失败",
};
// 映射函数
const mapRecordType = (type) => {
  return RecordTypeString[type] || "未知类型";
};
// 激活类型
const getActiveType = (t) => {
  if (t > 0) {
    return "激活";
  } else {
    return "即时";
  }
};
// 获取个人面板信息
const getCardkeyStats = () => {
  axios
    .get("/api/stats/cardkey")
    .then((res) => {
      totalKeys.value = res.data.total_keys;
      createdToday.value = res.data.created_today;
      activatedToday.value = res.data.activated_today;
      expiredToday.value = res.data.expired_today;
      expiredWithinDay.value = res.data.expired_within_a_day;
      unactivatedKeys.value = res.data.unactivated_keys;
      totalUsageCount.value = res.data.total_usage_count;
    })
    .catch((err) => {
      // 打印更详细的错误信息
      if (err.response) {
        // 请求已经发出，服务器返回了状态码，但不在 2xx 范围内
        console.error("Error response:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        // 请求已经发出，但没有收到服务器的回应
        console.error("Error request:", err.request);
      } else {
        // 其他错误
        console.error("Error message:", err.message);
      }
    });
};
const ExpiredCard = ref();
// 获取当天要过期的卡密
const getExpiredCard = () => {
  axios
    .get("/api/stats/expired_cards")
    .then((res) => {
      ExpiredCard.value = res.data;
    })
    .catch((err) => {
      // 打印更详细的错误信息
      if (err.response) {
        // 请求已经发出，服务器返回了状态码，但不在 2xx 范围内
        console.error("Error response:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        // 请求已经发出，但没有收到服务器的回应
        console.error("Error request:", err.request);
      } else {
        // 其他错误
        console.error("Error message:", err.message);
      }
    });
};

const ActiveCard = ref();
// 获取当天要过期的卡密
const getActiveCard = () => {
  axios
    .get("/api/stats/active_cards")
    .then((res) => {
      ActiveCard.value = res.data;
    })
    .catch((err) => {
      // 打印更详细的错误信息
      if (err.response) {
        // 请求已经发出，服务器返回了状态码，但不在 2xx 范围内
        console.error("Error response:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        // 请求已经发出，但没有收到服务器的回应
        console.error("Error request:", err.request);
      } else {
        // 其他错误
        console.error("Error message:", err.message);
      }
    });
};

const TodaysActiveRecords = ref();
// 获取当天要过期的卡密
const getTodaysActiveRecords = () => {
  axios
    .get("/api/stats/todays_active_records")
    .then((res) => {
      TodaysActiveRecords.value = res.data;
    })
    .catch((err) => {
      // 打印更详细的错误信息
      if (err.response) {
        // 请求已经发出，服务器返回了状态码，但不在 2xx 范围内
        console.error("Error response:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        // 请求已经发出，但没有收到服务器的回应
        console.error("Error request:", err.request);
      } else {
        // 其他错误
        console.error("Error message:", err.message);
      }
    });
};

getCardkeyStats();
getExpiredCard();
getActiveCard();
getTodaysActiveRecords();
</script>
<style scoped>
.light-green {
  height: 108px;
  background-color: rgba(0, 128, 0, 0.12);
}
.green {
  height: 108px;
  background-color: rgba(0, 128, 0, 0.24);
}
</style>
