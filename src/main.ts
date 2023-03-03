import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import axios from "axios";
axios.defaults.baseURL = "https://localhost:7103/"; // 服务端地址
 

import ElMessage from 'element-plus'
const app = createApp(App)
// 全局挂载axios
app.config.globalProperties.$http = axios;
app.use(ElMessage)
app.use(createPinia())
app.use(router)

app.mount('#app')
