<template>
    <div>
        <el-card>
            <template #header>
                <div class="my_refresh">
                    <div>
                        <span>班级管理</span>
                    </div>
                    <div>
                        <el-space>
                            <el-button type="primary" @click="onCreateClass()">创建班级</el-button>
                            <el-button type="primary" :icon="Refresh" @click="onRefresh()" :loading="loading">刷新</el-button>
                        </el-space>
                    </div>
                </div>
            </template>
            <div>
                <el-table :data="mergedClassData" style="width: 100%" v-loading="loading">
                    <el-table-column prop="name" label="班级名称" width="200" />
                    <el-table-column prop="zcrs" label="早餐" width="100" />
                    <el-table-column prop="zwrs" label="午餐" width="100" />
                    <el-table-column prop="wsrs" label="晚餐" width="100" />
                    <el-table-column prop="qyrs" label="企业餐" width="100" />
                    <el-table-column label="教师">
                        <template #default="scope">
                            <div class="flex gap-2">
                                <el-tag v-for="val in scope.row.teachers" effect="plain"> {{ val.compellation }} </el-tag>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200">
                        <template #default="scope">
                            <el-space>
                                <el-button link type="primary" @click="onUpdateClass(scope.row)">编辑</el-button>
                                <el-button link type="primary" @click="onDeleteCls(scope.row.id)" v-if="scope.row.deletable">删除</el-button>
                            </el-space>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="pagination">
                <pagination :pageTotal="pageTotal" :pageSize="pageSize" @CurrentChange="onCurrentChange" @SizeChange="onSizeChange" />
            </div>
        </el-card>
    </div>
    <UpdateClass ref="UpdateClass" />
    <CreateClassIndex ref="CreateClassIndex" />
</template>

<script>
import { Refresh } from "@element-plus/icons-vue";
import pagination from "../../components/pagination/pagination.vue";
import { msgcon } from "@/utils/message.js";
import { withDelay } from "../../utils/common.js";
import { GetAllClass, DeleteClass, GetClassesDetails } from "@/api/index.js";
import UpdateClass from "./update.vue";
import CreateClassIndex from "./create.vue";
export default {
    name: "StuclassIndex",
    components: { pagination, UpdateClass, CreateClassIndex },
    setup() {
        return {
            Refresh,
        };
    },
    data() {
        return {
            loading: false,
            pageTotal: 0,
            pageSize: 10,
            page: 1,
            classList: [], // GetAllClass接口数据（包含deletable）
            classDetails: [], // GetClassesDetails接口数据（主数据）
            mergedClassData: [], // 合并后的数据
        };
    },
    methods: {
        onCurrentChange(p) {
            this.page = p;
            this.loadData(this.pageSize, p);
        },
        onSizeChange(s) {
            this.pageSize = s;
            this.page = 1;
            this.loadData(s, 1);
        },
        onUpdateClass(val) {
            this.$refs.UpdateClass.openDialog(val);
        },
        // 合并数据
        mergeClassData() {
            // 创建classList的id映射表（key: id, value: 整条数据）
            const classMap = this.classList.reduce((map, item) => {
                map[item.id] = item;
                return map;
            }, {});

            // 合并逻辑：以classDetails为主，补充classList中的字段（尤其是deletable）
            this.mergedClassData = this.classDetails.map((detail) => {
                // 从映射表中找到对应id的记录
                const classItem = classMap[detail.id] || {};
                // 合并字段：classItem中的字段（如deletable）覆盖detail中可能存在的同名字段
                return {
                    ...detail,
                    ...classItem,
                };
            });
        },

        // 加载并合并数据
        loadData(pageSize, page) {
            this.loading = true;
            const params = { page, page_size: pageSize };

            // 并行请求两个接口
            Promise.all([withDelay(() => GetClassesDetails(params)), withDelay(() => GetAllClass(params))])
                .then(([detailsRes, allRes]) => {
                    // 存储接口数据（注意接口返回的结构）
                    this.classDetails = detailsRes.payload.items || [];
                    this.classList = allRes.payload.class || [];
                    // 更新总页数
                    this.pageTotal = detailsRes.payload.page_info?.total || 0;
                    // 执行合并
                    this.mergeClassData();
                })
                .catch((err) => {
                    console.error("加载数据失败:", err);
                    this.$message.error(msgcon("数据加载失败"));
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        loadDeleteClass(ids) {
            const data = { ids: ids };
            DeleteClass(data)
                .then(() => {
                    this.$message.success(msgcon("删除成功"));
                    this.loadData(this.pageSize, this.page);
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$message.warning(msgcon("您没有权限"));
                    } else if (err.status === 409) {
                        this.$message.warning(msgcon("班级有就餐数据，不能删除"));
                    } else if (err.status === 404) {
                        this.$message.warning(msgcon("班级不存在"));
                    } else {
                        this.$message.error(msgcon("操作失败"));
                    }
                });
        },
        onDeleteCls(id) {
            this.$confirm("确认要删除班级吗？", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this.loadDeleteClass([id]);
                })
                .catch(() => {});
        },
        onCreateClass() {
            this.$refs.CreateClassIndex.openDialog();
        },
        onRefresh() {
            this.loadData(this.pageSize, this.page);
        },
    },
    created() {
        this.onRefresh();
        this.$globalBus.emit("updateActivePath", "/stuclass");
        this.$globalBus.on("onRefresh", () => {
            this.onRefresh();
        });
    },
    beforeUnmount() {
        this.$globalBus.off("onRefresh");
        this.$globalBus.off("updateActivePath");
    },
};
</script>

<style scoped lang="less">
.flex {
    display: flex;
}
.gap-2 {
    gap: 0.5rem;
}
</style>
