# 日常万能助手

一个微信小程序工具集合，提供多种实用工具。

## 功能模块

### 财务工具
- **个税计算器**：计算个人所得税，支持多个月份累计计算
- **年终奖计算器**：计算年终奖缴税金额
- **汇率转换**：实时查询和转换多种货币汇率

### 图片工具
- **照片隐私清除**：去除照片中的位置、时间、设备等隐私信息（EXIF）

### 更多工具
持续更新中...

## 技术栈

- 微信小程序原生框架
- TDesign 组件库
- ES6+ 语法

## 项目结构

```
pages/
  ├── index/                    # 工具分类首页
  ├── tools/                    # 工具页面目录
  │   ├── tax-calculator/       # 个税计算器
  │   ├── pension-calculator/   # 年终奖计算器
  │   ├── currency-exchange/    # 汇率转换
  │   └── photo-privacy/        # 照片隐私清除
  └── detail/                   # 详情页
components/
  ├── group-btn/                # 按钮组组件
  ├── output/                   # 输出展示组件
  ├── area/                     # 币种选择组件
  └── pull-down-list/           # 下拉列表组件
utils/
  ├── config.js                 # API 配置
  └── exif-parser.js            # EXIF 信息解析
```

## 开发调试

### 直接跳转到指定页面

在微信开发者工具中，可以通过**编译模式**直接打开某个页面：

1. 点击工具栏的 **"普通编译"** 下拉菜单
2. 选择 **"添加编译模式"**
3. 填写配置：
   - 模式名称：如 `照片隐私`
   - 启动页面：选择要跳转的页面路径
4. 点击确定保存
5. 选择新建的编译模式进行编译

### 可用页面路径

| 页面 | 路径 |
|------|------|
| 首页 | `pages/index/index` |
| 个税计算器 | `pages/tools/tax-calculator/index` |
| 年终奖计算器 | `pages/tools/pension-calculator/index` |
| 汇率转换 | `pages/tools/currency-exchange/index` |
| 照片隐私清除 | `pages/tools/photo-privacy/index` |

## License

MIT
