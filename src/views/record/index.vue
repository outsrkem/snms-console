<template>
    <MyHeader title="查看记录明细"></MyHeader>
    <div>
        <div class="reminder">
            <p>数据每餐一条，页面最大提供60条数据。</p>
        </div>
        <el-select v-model="class_id" @change="onChanClass" placeholder="请联系管理员将您添加到对应的班级">
            <el-option v-for="(item, index) in ownClass" :key="index" :label="item.name" :value="item.id" />
        </el-select>
        <div style="margin-bottom: 10px"></div>
        <div v-loading="loading" style="min-height: 220px">
            <el-collapse v-model="activeName" accordion>
                <el-collapse-item
                    v-for="(item, index) in detailInfo"
                    :key="index"
                    :title="item.dining_date + '     ' + formatPeriod(item.period)"
                    :name="index">
                    <div>
                        <el-text>班级：{{ showClassName(item.class_id) }}</el-text>
                    </div>
                    <div>
                        <el-text>预期就餐人数：{{ item.expected }}人</el-text>
                    </div>
                    <div>
                        <el-text>实际就餐人数：{{ item.actual }}人</el-text>
                    </div>
                    <div>
                        <el-text>未就餐学生（{{ item.canteen_number }}人）：</el-text>
                        <span v-for="(item, index) in formatStuName(item.canteen_absent_diners)" :key="index">
                            <span style="margin-left: 2px; margin-right: 2px"
                                ><el-tag type="primary" size="small">{{ item }}</el-tag>
                            </span>
                        </span>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </div>
    </div>
</template>

<script>
import MyHeader from "@/views/component/header.vue";
import { GetOwnClass, GetMealsDetail } from "@/api/index.js";
export default {
    name: "RecordIndex",
    components: { MyHeader },
    props: {},
    data() {
        return {
            detailInfo: [],
            activeName: null,
            ownClass: "",
            class_id: "",
            countdownTimer: null,
            loading: true,
        };
    },

    methods: {
        loadGetOwnClass: async function () {
            const params = { page: 1, page_size: 200 };
            const res = await GetOwnClass(params).catch(() => {});
            this.ownClass = res.payload.class;
            if (res.payload.class.length > 0) {
                this.class_id = res.payload.class[0]["id"];
            }
            if (this.class_id !== "") {
                this.loadGetMealsDetail();
            }
            this.loading = false;
        },
        loadGetMealsDetail: function () {
            const paths = { class_id: this.class_id };
            const params = { page: 1, page_size: 60 };
            GetMealsDetail(paths, params)
                .then((res) => {
                    this.detailInfo = res.payload.detail;
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        showClassName(class_id) {
            // 再班级中找到当前选中的id，并获取其班级名称
            return this.ownClass.find((item) => item.id === class_id).name;
        },
        formatPeriod(item) {
            let value = "";
            switch (item) {
                // 'breakfast 早','lunch 午','dinner 晚'
                case "breakfast":
                    value = "早餐";
                    break;
                case "lunch":
                    value = "午餐";
                    break;
                case "dinner":
                    value = "晚餐";
                    break;
                case "enterprise":
                    value = "企业";
                    break;
            }
            return value;
        },
        formatStuName(item) {
            const nameArr = item === "" ? [] : item.split(",");
            return nameArr;
        },
        onBack() {
            this.$router.push({ name: "home" });
        },
        onChanClass() {
            this.activeName = null;
            this.loadGetMealsDetail();
        },
        onRefresh() {
            this.loadGetOwnClass();
        },
    },
    created() {
        this.onRefresh();
    },
};
</script>

<style scoped lang="less"></style>
