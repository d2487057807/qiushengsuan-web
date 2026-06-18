# 球胜算 - 竞彩足球数据分析（前端）

竞彩足球数据分析系统前端，基于 React + TypeScript + Tailwind CSS 构建。

## 技术栈

- **框架**：React 18 + TypeScript
- **构建**：Vite
- **样式**：Tailwind CSS v4
- **图表**：Recharts
- **状态管理**：Zustand
- **路由**：React Router v7
- **HTTP**：Axios
- **动画**：Motion (Framer Motion)

## 功能模块

- **首页**：在售赛事列表，按日期分组，支持查看赔率走势和匹配历史相似比赛
- **赛事详情**：6个Tab（胜平负/让球/比分/总进球/半全场/数据分析），赔率走势图，校准统计
- **历史赛事**：多条件筛选，表格/卡片视图，分页，Excel导出
- **个人中心**：头像上传，昵称编辑，手机/邮箱绑定，密码修改
- **认证**：验证码登录、密码登录、注册、忘记密码，腾讯云图形验证码

## 开发

```bash
npm install
npm run dev     # 开发服务器 http://localhost:3000/sporttery/
npm run build   # 生产构建
npm run preview # 预览生产构建
```

## 部署

- 基础路径：`/sporttery/`
- API 代理：`/sporttery/api` → `http://localhost:8181/api`
- 生产构建输出到 `dist/`，部署到 nginx
