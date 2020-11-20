module.exports = {
  ModuleName: "dataManagement", // 主模块名 按钮权限标识需要用到
  searchName: "wordName", // 搜索字段
  searchPlaceholder: "请输入主词", // 搜索为输入提示
  tableCol: [ // 表格
    {
      label: "主词",
      prop: "word",
    },
    {
      label: "类型",
      prop: "type",
    },
    {
      label: "同义词",
      prop: "synonym",
    },
  ],

  // 弹窗
  dialogTitle: "同义词", // 弹窗标题

  // 表单
  formClass: "synonym-form", // 表单class
  formModel: "synonymForm", // 表单 model
  formRef: "synonymForm", // 表单 ref

  // 生成 el-form-item 目前只支持 input 和 select 两种类型
  formItems: [
    {
      label: "主词",
      prop: "word",
      type: "input",
      vModel: "synonym.word",
      placeholder: "请输入主词"
    },
    {
      label: "类型",
      prop: "type",
      type: "select",
      vModel: "synonym.type",
      placeholder: "请选择主词类型",
      options: "types", // options 循环字段
      optionLabel: "label",
      optionValue: "value"
    }
  ]
};
