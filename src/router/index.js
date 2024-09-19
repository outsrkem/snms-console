import { createRouter, createWebHashHistory } from 'vue-router'
const Home = () => import('../views/home/index.vue')
const Meals = () => import('../views/meals/index.vue')
const Report = () => import('../views/report/index.vue')
const Record = () => import('../views/record/index.vue')


const routes = [
    { path: '/', name: 'home', component: Home, meta: { title: '首页 - 营养餐就餐记录系统' } },
    { path: '/meals', name: 'meals', component: Meals, meta: { title: '登记就餐数据' } },
    { path: '/report', name: 'report', component: Report, meta: { title: '查看报表' } },
    { path: '/record', name: 'record', component: Record, meta: { title: '查看记录明细' } },
]

const router = createRouter({
    history: createWebHashHistory('/snms/'),
    routes,
})

router.beforeEach((to, from, next) => {
    if (to.meta && to.meta.title) {
        document.title = to.meta.title;
    }
    next();
});

export default router
