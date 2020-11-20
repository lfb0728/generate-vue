module.exports = {
    vueTemplate: (componentName, options) => {
        const {
            ModuleName,
            searchName,
            searchPlaceholder,
            tableCol,
            dialogTitle,
            formClass,
            formModel,
            formRef,
            formItems = []
        } = options;
        return `
<template>
    <div class="component-container">
      <div class="content-container">
        <!-- 搜索 -->
        <div class="filter-container">
            <el-form :inline="true" @submit.native.prevent>
                <el-form-item>
                    <el-input
                        v-model="${searchName}"
                        class="search-input-width220"
                        clearable
                        placeholder="${searchPlaceholder}"
                        @keyup.native.13="handleFilter"
                        @clear="handleFilter"
                    >
                        <i
                            slot="prefix"
                            class="iconfont icon-search"
                            @click="handleFilter"
                        />
                    </el-input>
                </el-form-item>
            </el-form>
            <div>
                <el-button
                    class="filter-item"
                    type="primary"
                    btn-show="${ModuleName}-${componentName}-add"
                    v-btnPermission
                    @click="handleAdd"
                    >新 增</el-button
                >
                <el-button
                    class="filter-item"
                    btn-show="${ModuleName}-${componentName}-batchDelete"
                    v-btnPermission
                    :disabled="!multiSelect.length"
                    @click="deleteMultiple"
                    >删 除</el-button
                >
            </div>
        </div>
        <!-- 搜索 end -->

        <!-- 表格 -->
        <el-table
            v-loading="tableLoading"
            :data="tableList"
            highlight-current-row
            @selection-change="handleSelectChange"
        >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="序号" prop="serial" show-overflow-tooltip />
            ${tableCol.map(item => {
                return `<el-table-column label="${item.label}" prop="${item.prop}" show-overflow-tooltip />`
            }).join("\n")}
            <el-table-column label="操作" width="120">
                <template slot-scope="{ row }">
                    <el-button
                        btn-show="${ModuleName}-${componentName}-edit"
                        v-btnPermission
                        type="text"
                        @click="editItem(row.id)"
                    >编辑</el-button
                    >
                    <el-button
                        btn-show="${ModuleName}-${componentName}-delete"
                        v-btnPermission
                        class="del-btn"
                        type="text"
                        @click="deleteItem(row.id)"
                    >删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>
        <!-- 表格 end -->
        <!-- 分页 -->
        <pagination
            v-show="total > 0"
            :total="total"
            :page.sync="listQuery.pageNo"
            :limit.sync="listQuery.pageSize"
            @pagination="getList"
        />
      <!-- 分页 end -->
      <!-- 弹窗 -->
        <Dialog
            v-bind="{
                width: '520px',
                title: dialogTitle,
                visible: dialogVisible
            }"
            v-on="{
                close: closeDialog,
                submit: saveDialog
            }"
        >
            <div slot="main" v-loading="dialogLoading">
                <el-form
                    :model="${formModel}"
                    :rules="rules"
                    ref="${formRef}"
                    label-width="105px"
                    class="${formClass}"
                >
                    ${formItems.map(item => {
                        return `<el-form-item label="${item.label}" prop="${item.prop}">
                         ${item.type === "input" ? `<el-input class="width320" v-model="${item.vModel}" placeholder="${item.placeholder}" />` : `<el-select class="width320" v-model="${item.vModel}" placeholder="${item.placeholder}"><el-option v-for="(item, index) in ${item.options}" :key="index" :label="${item.optionLabel}" :value="${item.optionValue}" /></el-select>`}
                        </el-form-item>`
                    }).join("\n")}
                </el-form>
            </div>
        </Dialog>
      <!-- 弹窗 end -->
      </div>
    </div>
</template>
<script>
import { tableSort } from "@dataexa/maya-customize/lib/utils";
import Dialog from "@dataexa/maya-customize/lib/components/Dialog";
import Pagination from "@dataexa/scaffold/lib/components/Pagination";
import {
    page,
    add,
    update,
    batchRemove,
    remove,
    findById,
} from "@/services/${componentName}-api";
export default {
    name: "${componentName.replace(/-[a-z]{1}/, (match) => match.slice(1).toLocaleUpperCase())}",
    components: {
        Pagination,
        Dialog
    },
    data() {
        const validateBlank = (rule, value, callback) => {
            if (value.trim() === "") {
              callback(new Error());
            } else {
              callback();
            }
        };
        return {
            ${searchName}: "",
            prevName: "", // 上次搜索的名称
            multiSelect: [], // 勾选中数据

            // 表格
            tableLoading: false, // loading
            tableList: [], // 表格数据

            // 分页
            total: 0,
            listQuery: {
                pageNo: 1,
                pageSize: 10
            },

            // 弹窗
            editId: null, // 正在编辑数据的id
            dialogTitle: 新增${dialogTitle},
            dialogVisible: false,
            dialogLoading: false,
            ${formModel}: {},
            rules: {}
        }
    },
    created() {
        // 分页查询
        this.getList("search");
    },
    methods: {
        /**
         * 获取列表
         * @param type 获取类型 是搜索还是获取列表
         */
        async getList(type) {
            if (type !== "search") {
                this.${searchName} = this.prevName;
            }
            let params = {
                data: {
                word: this.${searchName} || null,
                type: this.type
                },
                page: this.listQuery
            };
            this.tableLoading = true;
            const res = await page(params).finally(() => {
                this.tableLoading = false;
            });
            let { success, data, message } = res.data;
            if (success) {
                let { total, rows = [] } = data;
                this.total = total;
                this.tableList = tableSort(
                rows,
                this.listQuery.pageNo,
                this.listQuery.pageSize
                );
            } else {
                this.$message.error(message || "数据列表获取请求失败");
            }
        },
        // 搜索
        handleFilter() {
            this.prevName = this.${searchName};
            this.listQuery.pageNo = 1;
            this.getList("search");
        },
        // 新增
        handleAdd() {
            this.dialogTitle = 新增${dialogTitle};
            this.dialogVisible = true;
            this.editId = null;
        },
        // 多选删除
        deleteMultiple() {
            this.$confirm("确定删除选中数据?", "提示", {
                confirmButtonText: "确 定",
                cancelButtonText: "取 消"
            })
                .then(async () => {
                const ids = this.multiSelect.map(item => item.id).join();
                const res = await batchRemove(ids);
                let { success } = res.data;
                if (success) {
                    this.$message.success("删除成功");
                    // 重新查询列表数据
                    if (
                    (this.total - this.multiSelect.length) %
                        this.listQuery.pageSize ===
                    0
                    ) {
                    this.listQuery.pageNo = 1;
                    }
                    this.getList();
                } else {
                    this.$message.error("删除失败");
                }
                })
                .catch(() => {});
        },
        /**
         * 表格勾选触发
         * @param {array} val [选中项]
         */
        handleSelectChange(val) {
            this.multiSelect = val;
        },
        /**
         * 编辑表格项
         * @param {number} id [表格项id]
         */
        editItem(id) {
            this.dialogTitle = "编辑${dialogTitle}";
            this.dialogVisible = true;
            this.editId = id;
            this.findInfo(id);
        },
        /**
         * 查找单条数据
         * @param {number} id [表格项id]
         */
        async findInfo(id) {
            this.dialogLoading = true;
            const res = await findById(id).finally(() => {
                this.dialogLoading = false;
            });
            const { success, message, data } = res.data;
            if (success) {
                // TODO: 根据业务定义的表单进行赋值
            } else {
                this.$message.error(message || "获取数据失败");
            }
        },
        // 删除单项
        deleteItem(id) {
            this.$confirm(
                "此操作将永久删除该${dialogTitle}，是否确定删除？",
                "提示",
                {
                confirmButtonText: "确 定",
                cancelButtonText: "取 消"
                }
            )
                .then(async () => {
                if ((this.total - 1) % this.listQuery.pageSize === 0) {
                    this.listQuery.pageNo = 1;
                }
                const res = await remove(id);
                let { success } = res.data;
                if (success) {
                    this.$message.success("删除成功");
                    // 重新查询列表数据
                    this.getList();
                } else {
                    this.$message.error("删除失败");
                }
                })
                .catch(() => {});
        },

        // 关闭弹窗
        closeDialog() {
            this.$refs.${formRef}.resetFields();
            this.dialogVisible = false;
        },
        // 弹窗保存
        saveDialog() {
            this.$refs.${formRef}.validate(valid => {
                if (valid) {
                this.dialogLoading = true;
                let params = this.${formModel};
                if (!this.editId) {
                    // 新增
                    this.save(params);
                } else {
                    params.id = this.editId;
                    // 编辑
                    this.update(params);
                }
                }
            });
        },
        async save(params) {
            const res = await add(params).finally(() => {
              this.dialogLoading = false;
            });
            const { success, message } = res.data;
            if (success) {
              this.$message.success("新增数据成功");
              this.dialogVisible = false;
              this.getList();
            } else {
              this.$message.error(message || "操作失败");
            }
        },
        async update(params) {
            const res = await update(this.editId, params).finally(() => {
                this.dialogLoading = false;
            });
            const { success, message } = res.data;
            if (success) {
                this.$message.success("编辑数据成功");
                this.dialogVisible = false;
                this.getList();
            } else {
                this.$message.error(message || "操作失败");
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.search-input-width220 {
    width: 220px;
    .icon-search {
      cursor: pointer;
    }
}
.del-btn {
    color: var(--color-danger);
}
.${formClass} {
    .width320 {
        width: 320px;
    }
}
</style>
`
    },
    vueApi: () => {
    return `
import providers from "@/providers";

const { Api } = providers.apiMayaResource;

/**
 * 分页查询
 * @param {object} params
 */
export function page(params) {
    return Api.page(params);
}

/**
 * 添加
 * @param {object} params
 */
export function add(params) {
    return Api.add(params);
}

/**
 * 删除单条
 * @param {number} id
 */
export function remove(id) {
    return Api.remove(id);
}

/**
 * 批量删除
 * @param {string} ids
 */
export function batchRemove(ids) {
    return Api.batchRemove(ids);
}

/**
 * 查找
 * @param {number} id
 */
export function findById(id) {
    return Api.findById(id);
}

/**
 * 更新
 * @param {number} id
 * @param {object} params
 */
export function update(id, params) {
    return Api.update(id, params);
}
        `
    }
}