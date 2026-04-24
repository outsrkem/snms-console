import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import EventBusPlugin from "./utils/event-bus.js";
// 加载 引入vue-cookies。
import vueCookies from "vue-cookies";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

// 加载全局样式文件
import "./styles/index.less";
import "./styles/normalize.css";

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// 使用element国际化
app.use(ElementPlus, {
    locale: zhCn,
});

app.use(router);
app.use(vueCookies);
app.use(EventBusPlugin);
app.mount("#app");
