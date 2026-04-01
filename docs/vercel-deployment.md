# Vercel 试运行部署说明

这份说明对应当前 MVP 试运行版本，目标规模为 2 个教练账号 + 5 个学员。

## 1. 你需要手动做的步骤

1. 在 Vercel 创建项目，并连接当前仓库。
2. 在 Vercel Marketplace 为这个项目接入 Neon Postgres。
3. 在 Vercel 为这个项目创建 Blob Store。
4. 在 Vercel 项目环境变量里补充 `AUTH_SECRET`。
5. 如果你希望变量名更统一，手动再补两组别名：
   - `DATABASE_URL = POSTGRES_PRISMA_URL`
   - `DIRECT_URL = POSTGRES_URL_NON_POOLING`

## 2. 线上必需环境变量

至少保证这些变量存在：

- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `BLOB_READ_WRITE_TOKEN`
- `AUTH_SECRET`

推荐额外补齐：

- `DATABASE_URL`
- `DIRECT_URL`

## 3. 首次初始化

推荐方式：先在 Vercel 控制台把 Neon 和 Blob 接好，再在本地拉取远程环境，直接初始化远程 Neon。

```bash
vercel env pull .env.local --yes
PATH="$HOME/.local/node/node-v22.22.2-darwin-arm64/bin:$PATH" npm install
PATH="$HOME/.local/node/node-v22.22.2-darwin-arm64/bin:$PATH" npm run db:generate
PATH="$HOME/.local/node/node-v22.22.2-darwin-arm64/bin:$PATH" npm run db:migrate:deploy
PATH="$HOME/.local/node/node-v22.22.2-darwin-arm64/bin:$PATH" npm run db:seed
```

说明：

- `db:migrate:deploy` 用于把 Prisma migration 应用到远程 Neon。
- `db:seed` 只在首次试运行初始化时执行一次。
- 后续正常部署不要重复执行 `db:seed`，避免覆盖试运行数据。

## 4. 首次部署

完成首次初始化后，再触发 Vercel 部署即可。

建议顺序：

1. 推送代码到仓库
2. 在 Vercel 触发首次部署
3. 打开默认分配的 `*.vercel.app` 域名验收

## 5. 上线后最小验收路径

1. `/login`：教练和学员账号都能登录
2. `/coach/students`：学员管理列表可正常加载
3. 训练录入页：可保存草稿、可发布
4. `/api/uploads`：教练端可上传图片
5. `/student/home`：能看到最近一次已发布训练摘要
6. `/student/training/[recordId]`：能看到完整训练反馈
7. `/student/photos`：能看到动作对比 / 训练瞬间 / 教练总结
8. `/student/growth`：能看到轻量概览 / 当前阶段 / 时间轴

## 6. 当前试运行边界

- 只支持 1 组动作对比
- 图片线上走 Vercel Blob，不做裁剪、压缩和批量编辑
- 单张图片后端限制为 5MB，试运行建议控制在 3MB 内
- 成长页仍复用现有字段，不包含复杂成长分析
- `db:seed` 是演示初始化脚本，不适合反复覆盖线上真实数据
