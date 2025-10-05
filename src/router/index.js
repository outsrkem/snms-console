import { createRouter, createWebHashHistory } from "vue-router";
import { isMobile } from "../utils/device";

const Layout = () => import("../views/layout/index.vue");
const MobileLayout = () => import("../mobile/layout/index.vue");
const Stuclass = () => import("../views/stuclass/index.vue");
const Report = () => import("../views/report/index.vue");
const Meals = () => import("../views/meals/index.vue");
const Home = () => import("../views/homs/index.vue");

const MobileHome = () => import("../mobile/home/index.vue");
const MobileMeals = () => import("../mobile/meals/index.vue");
const MobileReport = () => import("../mobile/report/index.vue");
const MobileRecord = () => import("../mobile/record/index.vue");
const MobileStuclass = () => import("../mobile/stuclass/index.vue");
const MobileClassAddTea = () => import("../mobile/classAddTea/index.vue");

// 动态导入组件（根据设备类型）
const loadComponent = (pcComponent, mobileComponent) => {
    return isMobile() ? mobileComponent : pcComponent;
};

const routes = [
    {
        path: "/",
        component: loadComponent(Layout, MobileLayout), // 动态选择布局（PC端Layout或移动端Layout）
        meta: { title: "营养餐就餐记录系统" },
        children: [
            { path: "/", name: "home", component: loadComponent(Home, MobileHome), meta: { title: "营养餐就餐记录系统" } },
            { path: "/meals", name: "meals", component: loadComponent(Meals, MobileMeals), meta: { title: "登记就餐数据" } },
            { path: "/report", name: "report", component: loadComponent(Report, MobileReport), meta: { title: "查看报表" } },
            { path: "/record", name: "record", component: MobileRecord, meta: { title: "查看记录明细" } },
            { path: "/stuclass", name: "stuclass", component: loadComponent(Stuclass, MobileStuclass), meta: { title: "班级管理" } },
            { path: "/classAddTeacher", name: "classAddTeacher", component: MobileClassAddTea, meta: { title: "班级添加教师" } },
        ],
    },
];

const router = createRouter({
    history: createWebHashHistory("/snms/"),
    routes,
});

router.beforeEach((to, from, next) => {
    if (to.meta && to.meta.title) {
        document.title = to.meta.title;
    }
    next();
});

export default router;
