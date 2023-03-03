<template>
  <el-container class="map-container">
    <el-header height="45px">
      <el-row :gutter="20">

        <el-col :span="16"><h2>测试进度条</h2></el-col>
        <el-col :span="4"></el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-container class="main-container">
        <el-main>
          <el-steps :active="1" align-center space="420px">
            <el-step title="上传图片" :icon="Edit" />
            <el-step title="处理中..." :icon="Upload" />
            <el-step title="处理完成" :icon="Picture" />
          </el-steps>
          <div class="demo-progress">
            <el-progress
              type="circle"
              :percentage="progressUpload"
              :status="finishedUpload"
            />
            <el-progress
              type="circle"
              :percentage="progressHandle"
              :status="finishedHandle"
            />
            <el-progress type="circle" :percentage="100" status="success" />
          </div>
          <div class="progress">
            <el-button type="primary" @click="StartProgress"
              >开始执行</el-button
            >
            <br />
            <el-tag v-if="isShow" effect="dark" type="success" class="result"
              >执行结果: {{ message }}</el-tag
            >
          </div>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>


<script  lang="ts">

import { ref, defineComponent, reactive, getCurrentInstance } from "vue";
import { ElMessage } from "element-plus";
import { Edit, Picture, Upload } from "@element-plus/icons-vue";
import * as signalR from "@aspnet/signalr";

export default defineComponent({
  name: "HomeView",
  setup() {
    let progressUpload = ref(0);
    let progressHandle = ref(0);
 
    let message = ref("");
    let isShow = ref(false);
    let hub = reactive({
      connection: {},
      HubConnId: "",
      resultInfo: {},
    });
    let finishedUpload = ref("");
    let finishedHandle = ref("");
    // #region
    // 与服务器建立连接
    const connectionServer = (hub.connection =
      new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7103/progressHub")
        .build());
    connectionServer
      .start()
      .then(() => {
        ElMessage({
          message: "服务器连接成功了",
          type: "success",
        });
      })
      .catch((error) => {
        ElMessage.error(`服务器连接失败了\r${error.message.toString()}`);
      });
    connectionServer.onclose((error) => {
      ElMessage.error(`服务器疑似断开了\r${error?.message.toString()}`);
    });
 
    connectionServer.on("SetHubConnId", (id) => {
      hub.HubConnId = id;
    });
    connectionServer.on("UpdProgress", (percent) => {
      console.log(percent);
      progressUpload.value = percent;
    });
 
    connectionServer.on("HandleProgress", (percent) => {
      progressHandle.value = percent;
    });
    // 使用axios
    const internalInstance = getCurrentInstance();
    const axios = internalInstance?.appContext.config.globalProperties.$http;
 
    async function StartProgress() {
      ElMessage({
        message: "开始上传图片",
        type: "success",
      });
      isShow.value = true;
 
      // const postData = {};
      // postData["HubConnId"] = hub.HubConnId;
      progressUpload.value = 0;
      progressHandle.value = 0;
      finishedUpload.value = "";
      finishedHandle.value = "";
      message.value = "正在执行中...";
 
      const { data: res } = await axios.post("api/progress", hub.resultInfo);
      if (res.status !== 200 + "") {
        finishedUpload.value = "exception";
        return ElMessage.error("上传图片失败了, 请重试");
      }
      finishedUpload.value = "success";
      message.value = res.ResultMsg;
      const res1 = await axios.get("api/progress");
      console.log(res1);
      if (res1.status !== 202) {
        finishedHandle.value = "exception";
        return ElMessage.error("图片处理失败了, 请重试");
      }
      finishedHandle.value = "success";
      message.value = "处理已完成";
    }
    // #endregion
 
    return {
      progressUpload,
      progressHandle,
      message,
      isShow,
      hub,
      finishedUpload,
      finishedHandle,
      Edit,
      Picture,
      Upload,
      StartProgress,
    };
  },
});
</script>






<style lang="scss" scoped>
.map-container {
  height: 100%;
}
.logo {
  height: 40px;
}
h2 {
  margin-left: 12px;
  letter-spacing: 0.06em;
  color: #fff;
  font-size: 20px;
  height: 40px;
  line-height: 40px;
}
.el-header {
  background-color: rgb(26, 54, 82);
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  font-size: 22px;
  align-items: center;
}
.main-container {
  background-color: #eee;
}
.demo-progress {
  display: flex;
  justify-content: center;
  margin-left: 150px;
}
.demo-progress .el-progress--line {
  margin-bottom: 15px;
  width: 500px;
}
.demo-progress .el-progress--circle {
  margin-right: 288px;
}
.el-steps {
  padding-bottom: 20px;
}
:deep(.el-step__icon.is-icon) {
  width: 40px;
  background-color: #eee;
}
.progress {
  margin: 3% 12%;
 
  .result {
    margin-top: 20px;
    font-size: 14px;
  }
}
</style>