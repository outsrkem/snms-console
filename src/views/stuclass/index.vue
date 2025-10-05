<template>
    <div>
        <el-card>
            <template #header>
                <div class="my_refresh">
                    <div>
                        <span>班级管理</span>
                        <span style="padding-left: 5px; padding-right: 5px"></span>
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
                <el-table :data="classDetails" style="width: 100%" v-loading="loading">
                    <el-table-column prop="name" label="班级名称" width="200" />
                    <el-table-column prop="zcrs" label="早餐" width="100" />
                    <el-table-column prop="zwrs" label="午餐" width="100" />
                    <el-table-column prop="wsrs" label="晚餐" width="100" />
                    <el-table-column prop="qyrs" label="企业餐" width="100" />
                    <el-table-column prop="" label="教师">
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
import { formatTime } from "../../utils/date.js";
import { msgcon } from "@/utils/message.js";
import { withDelay } from "../../utils/common.js";
import { CreateClass, GetAllClass, DeleteClass, GetClassesDetails } from "@/api/index.js";
import UpdateClass from "./update.vue";
import CreateClassIndex from "./create.vue";
export default {
    name: "StuclassIndex",
    components: { pagination, UpdateClass, CreateClassIndex },
    props: {},
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
            tabsActiveName: "first",
            fromData: {},
            clsCode: "", // 班级代码
            clsName: "",
            rules: {
                clsCode: [],
            },
            classList: [],
            classDetails: [],
        };
    },
    computed: {},
    methods: {
        formatDate(time) {
            return formatTime(time);
        },
        onCurrentChange(p) {
            this.page = p;
            this.loadGetClassesDetails(this.pageSize, p);
        },
        onSizeChange(s) {
            this.pageSize = s;
            this.page = 1;
            this.loadGetClassesDetails(s, 1);
        },
        onUpdateClass(val) {
            this.$refs.UpdateClass.openDialog(val);
        },
        loadCreateClass() {
            const data = { cls: { code: this.clsCode } };
            CreateClass(data)
                .then(() => {
                    this.$message.success(msgcon("创建成功"));
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$message.warning(msgcon("您没有权限"));
                    } else {
                        this.$message.error(msgcon("创建失败，请检查班级是否已经存在"));
                    }
                });
        },
        loadGetClassesDetails: function (page_size = this.page_size, page = this.page) {
            this.loading = true;
            const params = { page, page_size };
            withDelay(() => GetClassesDetails(params))
                .then((res) => {
                    this.classDetails = res.payload.items;
                    this.pageTotal = res.payload.page_info.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        loadGetAllClass() {
            const params = { page: 1, page_size: 300 };
            GetAllClass(params).then((req) => {
                this.classList = req.payload.class;
            });
        },
        loadDeleteClass(ids) {
            const data = { ids: ids };
            DeleteClass(data)
                .then(() => {
                    this.$message.success(msgcon("删除成功"));
                    this.loadGetAllClass(); // 删除后重新加载数据
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$message.warning(msgcon("您没有权限"));
                        return;
                    } else if (err.status === 409) {
                        this.$message.warning(msgcon("班级有就餐数据，不能删除"));
                    } else if (err.status === 404) {
                        this.$message.warning(msgcon("班级不存在"));
                    } else {
                        this.$message.error(msgcon("操作失败"));
                    }
                });
        },
        onDeleteCls(val) {
            this.$confirm("确认要删除班级吗？", { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" })
                .then(() => {
                    console.log(val);
                    let ids = [];
                    ids.push(val);
                    this.loadDeleteClass(ids);
                })
                .catch(() => {});
        },
        onChangeTabs() {
            this.loadGetAllClass();
        },
        onCreateClass() {
            this.$refs.CreateClassIndex.openDialog();
        },
        displayClsName() {
            let code = this.clsCode;
            if (!Number.isInteger(code)) {
                // 不是整数
                this.clsName = "";
                return;
            }
            let _c = code.toString();
            if (_c == "") {
                // 输入为空
                this.clsName = "";
                return;
            }
            let _y = {
                1: "一年级",
                2: "二年级",
                3: "三年级",
                4: "四年级",
                5: "五年级",
                6: "六年级",
                7: "七年级",
                8: "八年级",
                9: "九年级",
            };
            let a = _c.slice(0, 1);
            let b = _c.slice(1);
            let c = "";
            if (b.length === 2) {
                c = parseInt(b);
            }
            this.clsName = _y[a] + "（" + c + "）班";
        },
        onRefresh() {
            this.loadGetAllClass(this.pageSize, this.page);
            this.loadGetClassesDetails();
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
