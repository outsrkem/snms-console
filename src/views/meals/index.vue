<template>
    <div>
        <el-card>
            <template #header>
                <div class="my_refresh">
                    <div>
                        <el-space>
                            <span>报表管理</span>
                        </el-space>
                    </div>
                    <div>
                        <el-space>
                            <el-select v-model="class_id" @change="onChanClass" placeholder="请联系管理员将您添加到对应的班级" style="width: 240px">
                                <el-option v-for="(item, index) in ownClass" :key="index" :label="item.name" :value="item.id" />
                            </el-select>
                            <el-button type="primary" @click="onCreateMeals()">登记就餐数据</el-button>
                            <el-button type="primary" :icon="Refresh" @click="onRefresh()" :loading="loading">刷新</el-button>
                        </el-space>
                    </div>
                </div>
            </template>
            <div>
                <el-table :data="detailInfo" style="width: 100%" v-loading="loading">
                    <el-table-column prop="name" label="班级名称" width="200">
                        <template #default="scope">
                            <span>{{ showClassName(scope.row.class_id) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="dining_date" label="日期" width="200"> </el-table-column>
                    <el-table-column prop="dining_date" label="餐段" width="200">
                        <template #default="scope">
                            <span>{{ formatPeriod(scope.row.period) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="expected" label="预期人数" width="200"> </el-table-column>
                    <el-table-column prop="actual" label="实际人数" width="200"> </el-table-column>
                    <el-table-column prop="dining_date" label="未就餐学生">
                        <template #default="scope">
                            <span v-for="(item, index) in formatStuName(scope.row.canteen_absent_diners)" :key="index">
                                <span style="margin-left: 2px; margin-right: 2px"
                                    ><el-tag type="primary" size="small" effect="plain">{{ item }}</el-tag>
                                </span>
                            </span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="pagination">
                <pagination :pageTotal="pageTotal" :pageSize="pageSize" @CurrentChange="onCurrentChange" @SizeChange="onSizeChange" />
            </div>
        </el-card>
        <CreateMeals ref="CreateMeals" />
    </div>
</template>
<script>
import pagination from "../../components/pagination/pagination.vue";
import { Refresh } from "@element-plus/icons-vue";
import { withDelay } from "../../utils/common.js";
import { GetOwnClass, GetMealsDetail } from "@/api/index.js";
import CreateMeals from "./create.vue";
export default {
    name: "RecordIndex",
    components: { pagination, CreateMeals },
    props: {},
    setup() {
        return {
            Refresh,
        };
    },
    data() {
        return {
            loading: true,
            pageTotal: 0,
            pageSize: 10,
            page: 1,
            detailInfo: [],
            activeName: null,
            ownClass: [], // 初始化为空数组而非空字符串
            class_id: "",
            countdownTimer: null,
        };
    },

    methods: {
        onCurrentChange(p) {
            this.page = p;
            this.loadGetMealsDetail(this.pageSize, p);
        },
        onSizeChange(s) {
            this.pageSize = s;
            this.page = 1;
            this.loadGetMealsDetail(s, 1);
        },
        // 优化班级数据加载逻辑
        loadGetOwnClass: async function () {
            this.loading = true;
            try {
                const params = { page: 1, page_size: 200 };
                const res = await GetOwnClass(params);
                this.ownClass = res.payload?.class || [];

                // 确保班级数据存在再设置默认班级
                if (this.ownClass.length > 0) {
                    this.class_id = this.ownClass[0]["id"];
                    // 班级ID设置后再加载详情
                    this.loadGetMealsDetail();
                } else {
                    // 没有班级数据时清空详情
                    this.detailInfo = [];
                    this.pageTotal = 0;
                    this.loading = false;
                }
            } catch (err) {
                console.error("加载班级数据失败:", err);
                this.ownClass = [];
                this.detailInfo = [];
                this.pageTotal = 0;
                this.loading = false;
            }
        },
        // 加载详情前检查class_id是否有效
        loadGetMealsDetail: function (page_size = this.pageSize, page = this.page) {
            // 先检查class_id是否有效
            if (!this.class_id) {
                this.loading = false;
                return;
            }

            this.loading = true;
            const paths = { class_id: this.class_id };
            const params = { page: page, page_size: page_size };

            withDelay(() => GetMealsDetail(paths, params))
                .then((res) => {
                    this.detailInfo = res.payload?.detail || [];
                    this.pageTotal = res.payload?.page_info?.total || 0;
                })
                .catch((err) => {
                    console.error("加载就餐详情失败:", err);
                    this.detailInfo = [];
                    this.pageTotal = 0;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        showClassName(class_id) {
            const cls = this.ownClass.find((item) => item.id === class_id);
            return cls ? cls.name : "未知班级"; // 增加空值处理
        },
        formatPeriod(item) {
            const periodMap = {
                breakfast: "早餐",
                lunch: "午餐",
                dinner: "晚餐",
                enterprise: "企业",
            };
            return periodMap[item] || item;
        },
        formatStuName(item) {
            return item ? item.split(",").filter((name) => name) : [];
        },
        onBack() {
            this.$router.push({ name: "home" });
        },
        onChanClass() {
            this.activeName = null;
            // 班级变更时重新加载数据
            this.loadGetMealsDetail();
        },
        onRefresh() {
            // 刷新时先重新加载班级，再加载详情
            this.loadGetOwnClass();
        },
        onCreateMeals() {
            this.$refs.CreateMeals.openDialog();
        },
    },
    created() {
        // 初始化时只加载班级数据，详情数据在班级数据加载完成后再加载
        this.loadGetOwnClass();
        this.$globalBus.emit("updateActivePath", "/meals");
    },
};
</script>

<style scoped lang="less">
.my_refresh {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.pagination {
    margin-top: 15px;
    text-align: right;
}
</style>
