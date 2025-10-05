<template>
    <div>
        <my-header title="班级管理"></my-header>
        <el-tabs v-model="tabsActiveName" class="demo-tabs" @tab-change="onChangeTabs">
            <el-tab-pane label="创建班级" name="first">
                <div>
                    <div class="reminder">
                        <p>创建班级直接输入对应的数字：如下所示</p>
                        <p>"一年级（11）班" 输入 111</p>
                        <p>"三年级（3）班" 输入 303</p>
                        <p>"五年级（24）班" 输入 524</p>
                    </div>
                    <el-form label-position="top" label-width="auto" :model="fromData" :rules="rules">
                        <el-form-item label="输入班级" prop="clsCode" @input="displayClsName()">
                            <el-input v-model.number="clsCode" clearable placeholder="示例：304"> </el-input>
                        </el-form-item>
                    </el-form>
                    <div style="margin-bottom: 18px; height: 25px">
                        <el-text v-if="clsName">输入的班级是：{{ clsName }}</el-text>
                    </div>
                    <div style="display: flex; justify-content: center; align-items: center">
                        <el-button style="width: 100%" type="primary" @click="onCreateClass()">创建班级</el-button>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="班级列表" name="second">
                <div class="reminder">
                    <p>注意：班级有填报过就餐数据则不能被删除</p>
                </div>
                <div v-for="(item, index) in classList" :key="index">
                    <div class="cls-row">
                        <el-text>{{ item.name }}</el-text>
                        <div style="margin-left: auto">
                            <!-- <el-button size="small" type="">停用</el-button> -->
                            <span v-if="item.deletable" style="margin-left: 12px">
                                <el-button size="small" type="danger" @click="onDeleteCls(item.id)">删除</el-button>
                            </span>
                        </div>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import MyHeader from "../component/header.vue";
import { msgcon } from "@/utils/message.js";
import { CreateClass, GetAllClass, DeleteClass } from "@/api/index.js";
export default {
    // 班级管理
    name: "StuClass",
    components: { MyHeader },
    data() {
        return {
            tabsActiveName: "first",
            fromData: {},
            clsCode: "", // 班级代码
            clsName: "",
            rules: {
                clsCode: [],
            },
            classList: [],
        };
    },
    computed: {},
    methods: {
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
            if (this.clsCode === "") {
                this.$message.error(msgcon("请输入班级"));
                return;
            }
            if (!Number.isInteger(this.clsCode)) {
                this.$message.error(msgcon("输入的不是整数"));
                return;
            }
            if (this.clsCode < 101 || this.clsCode > 999) {
                this.$message.error(msgcon("范围错误，[101,999]"));
                return;
            }
            this.loadCreateClass();
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
    },
    created() {},
};
</script>

<style scoped lang="less">
.line-row {
    width: 100%;
    margin-top: 20px;
    margin-bottom: 35px;
}
h3 {
    margin-top: 0px;
    margin-bottom: 0px;
}
.cls-row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ebeef5;
    padding: 5px;
    padding-bottom: 10px;
    padding-top: 10px;
    height: 24px;
}
</style>
