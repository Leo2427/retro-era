# RetroEra — 复古游戏信息网站 技术方案

> 项目名称：RetroEra（怀旧时光 · 经典永存）
> 最后更新：2026-06-11
> 说明：plan.md 是项目唯一技术文档，所有修改、新增、配置变更都应及时同步到此文件

---

## 一、项目概述

构建一个复古游戏信息数据库网站，用户可以浏览游戏的详细介绍、玩法、出招表等内容。管理员后台分为两大管理模块：

1. **游戏内容管理** — 添加/编辑游戏信息、上传封面图、管理出招表
2. **人员管理** — 查看注册用户、分配角色、管理权限

界面简洁干净、内容优先，框架设计充分考虑扩展性，后续可增加论坛、视频上传等功能。

### 参考网站

| 网站 | 参考点 |
|------|--------|
| [rpgmaker.net](https://rpgmaker.net/) | 社区驱动模式、用户系统、游戏展示与推荐 |
| [spmoves.com](https://www.spmoves.com/index.html) | 游戏封面网格导航、出招表数据库、极简卡片布局 |
| [arcade.besz.ca](https://arcade.besz.ca/) | 纯内容优先的极简风格、文字列表清晰可读 |

---

## 二、技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端框架** | Next.js | 14+ (App Router) | SSR/SSG 灵活选型，SEO 好 |
| **样式方案** | Tailwind CSS | 3.x | 原子化 CSS，快速干净界面 |
| **UI 组件** | shadcn/ui | latest | 基于 Radix UI 的无样式组件库 |
| **数据库** | Supabase (PostgreSQL) | — | 托管数据库，自带 Auth 和 Storage |
| **ORM** | Prisma | latest | 类型安全，迁移方便 |
| **认证** | Auth.js (NextAuth v5) | latest | 支持邮箱密码 + OAuth 扩展 |
| **存储** | Supabase Storage | — | 封面图、截图文件存储 |
| **部署** | Vercel | — | 自动部署，Preview URLs |
| **CDN/域名** | Cloudflare | — | DNS 托管 + 全球 CDN + SSL |

---

## 三、部署架构

### 开发环境

```
localhost:3000 ──► Supabase 云数据库 + Storage
Next.js Dev Server
```

### 生产环境

```
Cloudflare CDN ──► Vercel ──► Supabase (数据库 + Auth + Storage)
                              ├── Bucket: game-covers
                              └── Bucket: screenshots
```

---

## 四、权限与角色模型

```
┌─ 访客 ─────────────────────────────────┐
│  浏览游戏列表、详情、出招表               │
│  搜索                                     │
└──────────────────────────────────────────┘

┌─ 注册用户 ──────────────────────────────┐
│  访客全部权限 +                           │
│  个人资料管理（头像、昵称）               │
└──────────────────────────────────────────┘

┌─ 管理员 (role: admin) ──────────────────┐
│  注册用户全部权限 +                       │
│  新建/编辑/删除游戏信息                   │
│  上传/替换游戏封面图                      │
│  管理出招表（增删改招式）                  │
│  ❌ 无权访问人员管理                      │
└──────────────────────────────────────────┘

┌─ 超级管理员 (role: super_admin) ────────┐
│  管理员全部权限 +                         │
│  查看注册用户列表                        │
│  提升/撤销管理员角色                      │
│  封禁/解封用户账号                        │
│  重置用户密码                            │
│  专属登录入口 /RetroEra-super             │
└──────────────────────────────────────────┘
```

---

## 五、数据模型

### 核心模型

```prisma
// 游戏
model Game {
  id             String     @id @default(cuid())
  title          String
  slug           String     @unique
  developer      String?
  publisher      String?
  releaseYear    Int?
  description    String?
  gameplayText   String?
  storyText      String?
  coverImageUrl  String?
  screenshots    String[]
  popular        Boolean   @default(false)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  platforms GamePlatform[]
  genres     GameGenre[]
  moveLists  MoveList[]
}

// 出招表
model MoveList {
  id          String  @id @default(cuid())
  gameId      String
  character   String?
  category    String
  command     String
  name        String?
  description String?
  damage      String?
  order       Int     @default(0)

  game Game @relation(fields: [gameId], references: [id], onDelete: Cascade)
  @@index([gameId])
}

// 平台
model Platform {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique
  games GamePlatform[]
}

// 类型
model Genre {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique
  games GameGenre[]
}

// 用户（含角色）
model User {
  id             String    @id @default(cuid())
  username       String?   @unique
  email          String?   @unique
  password       String?
  avatarUrl      String?
  role           String    @default("user")   // user | editor | admin
  banned         Boolean   @default(false)    // 是否被封禁
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  accounts  Account[]
  sessions  Session[]
}

// 密码重置令牌
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}

// 页面内容（关于、打赏等）
model PageContent {
  id        String   @id @default(cuid())
  slug      String   @unique
  title     String
  content   String?
  qrCodeUrl String?    // 微信收款码
  updatedAt DateTime @updatedAt
}

// 留言板
model Message {
  id        String   @id @default(cuid())
  content   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}
```

> **角色说明**：`user` = 普通注册用户，`admin` = 管理员（仅管理游戏），`super_admin` = 超级管理员（游戏+人员）
> **封禁机制**：`banned = true` 的用户登录时将被拒绝

---

## 六、UI/UX 设计方案

### 颜色方案

```css
--color-bg:         #F0F5FA
--color-surface:    #FFFFFF
--color-text:       #1A1A1A
--color-text-muted: #6B6B6B
--color-border:     #E8E6E1
--color-accent:     #C73E3E
--color-accent-alt: #2D5A27
```

### 管理后台布局

```
┌──────────────────────────────────────────────┐
│  Header  [返回前台]   [{用户头像} 管理员]     │
├────────┬─────────────────────────────────────┤
│        │                                      │
│  菜单   │  内容区域                            │
│        │                                      │
│  📋 游戏│  ┌──────────────────────────────┐   │
│   管理  │  │  标题 / 搜索 / 筛选           │   │
│        │  ├──────────────────────────────┤   │
│  👥 人员│  │  ┌────┐ ┌────┐ ┌────┐      │   │
│   管理  │  │  │ 游戏│ │ 游戏│ │ 游戏│      │   │
│        │  │  └────┘ └────┘ └────┘      │   │
│  ⚙️ 设置│  │  ┌──────┐ ┌──────┐       │   │
│        │  │  │ +新建 │ │ 批量 │       │   │
│        │  │  └──────┘ └──────┘       │   │
│        │  └──────────────────────────────┘   │
├────────┴─────────────────────────────────────┤
│  Footer                                      │
└──────────────────────────────────────────────┘
```

---

## 七、项目目录结构

```
src/
├── app/
│   ├── (public)/                 # 前台公开页面
│   │   ├── page.tsx              # 首页
│   │   └── games/
│   │       ├── page.tsx          # 游戏列表
│   │       └── [slug]/
│   │           ├── page.tsx      # 游戏详情
│   │           └── edit/
│   │               └── page.tsx  # 游戏编辑（editor+）
│   ├── (auth)/                   # 认证
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (user)/                   # 用户中心
│   │   └── profile/page.tsx
│   │
│   ├── admin/                    # 管理后台
│   │   ├── layout.tsx            # 后台布局（侧边栏菜单）
│   │   ├── page.tsx              # 后台首页（数据概览）
│   │   ├── games/                # 游戏内容管理
│   │   │   ├── page.tsx          # 游戏管理列表
│   │   │   └── new/
│   │   │       └── page.tsx      # 新建游戏
│   │   └── users/                # 人员管理
│   │       ├── page.tsx          # 用户列表
│   │       └── [id]/
│   │           └── page.tsx      # 用户详情/编辑角色
│   │
│   └── api/                      # API 路由
│       ├── auth/[...nextauth]
│       ├── games/                # 前台公开 API
│       ├── platforms/
│       └── admin/                # 管理后台 API
│           ├── games/
│           │   ├── route.ts      # 管理列表 + 新建
│           │   └── [id]/
│           │       ├── route.ts  # 更新 + 删除
│           │       └── upload/
│           │           └── route.ts  # 封面上传
│           └── users/
│               ├── route.ts      # 用户列表
│               └── [id]/
│                   └── route.ts  # 角色修改 + 封禁
│
├── components/
│   ├── ui/                       # shadcn/ui
│   ├── layout/                   # 前台布局
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── admin/                    # 管理后台组件
│   │   ├── Sidebar.tsx           # 侧边栏菜单
│   │   ├── GameTable.tsx         # 游戏管理表格
│   │   ├── GameForm.tsx          # 游戏编辑表单
│   │   ├── ImageUploader.tsx     # 封面上传
│   │   ├── MoveListEditor.tsx    # 出招表编辑器
│   │   ├── UserTable.tsx         # 用户管理表格
│   │   ├── UserRoleBadge.tsx     # 角色标签
│   │   └── AdminGuard.tsx        # 权限守卫
│   └── auth/
│       ├── LoginForm.tsx
│       └── RegisterForm.tsx
│
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── auth-helpers.ts           # 权限判断工具
│   ├── utils.ts
│   └── upload.ts                 # Supabase Storage 上传
│
└── data/
    └── seed.ts
```

---

## 八、实施阶段

### 阶段 1-3：基础搭建（✅ 已完成）

- [x] 项目初始化 + Tailwind + 设计 Token
- [x] Prisma + Supabase 数据库
- [x] 12 款经典游戏种子数据
- [x] 首页 / 游戏列表 / 游戏详情 + 出招表

### 阶段 4：管理后台 — 游戏内容管理（✅ 已完成）

游戏内容管理面向**管理员（admin）**和**超级管理员（super_admin）**。

| 功能 | 说明 | 涉及文件 |
|------|------|---------|
| 管理后台布局 | 侧边栏菜单 + 顶部导航，区分前后台 | `admin/layout.tsx` |
| 后台首页 | 数据看板：游戏总数、出招表数、用户数 | `admin/page.tsx` |
| 游戏管理列表 | 表格展示所有游戏，支持搜索/筛选/排序 | `admin/games/page.tsx` |
| 新建游戏 | 填写标题、开发商、年份、平台、类型 | `admin/games/new/page.tsx` |
| 编辑游戏 | 修改游戏介绍、玩法、故事等文本内容 | `games/[slug]/edit/page.tsx` |
| 封面上传 | 拖拽上传，预览，自动转 WebP，裁切建议 | `components/admin/ImageUploader.tsx` |
| 出招表管理 | 增删改招式条目，按角色分组编辑 | `components/admin/MoveListEditor.tsx` |
| 删除游戏 | 确认弹窗后删除游戏及其关联数据 | `api/admin/games/[id]/route.ts` |

**API 路由：**
```
GET    /api/admin/games          — 游戏管理列表（含搜索）
POST   /api/admin/games          — 新建游戏
GET    /api/admin/games/[id]     — 获取单个游戏（含编辑用数据）
PUT    /api/admin/games/[id]     — 更新游戏信息
DELETE /api/admin/games/[id]     — 删除游戏
POST   /api/admin/games/[id]/upload  — 上传封面图
```

### 阶段 5：管理后台 — 人员管理（✅ 已完成）

人员管理仅面向**超级管理员（super_admin）**。

| 功能 | 说明 | 涉及文件 |
|------|------|---------|
| 用户列表 | 表格展示所有注册用户（邮箱、角色、注册时间、状态） | `admin/users/page.tsx` |
| 搜索/筛选 | 按邮箱、用户名、角色、状态筛选 | 同上 |
| 用户详情 | 查看用户信息、登录历史、操作记录 | `admin/users/[id]/page.tsx` |
| 角色分配 | 将用户提升为 editor / 降级为 user | `api/admin/users/[id]/route.ts` |
| 账号封禁 | 封禁/解封用户，封禁后无法登录 | 同上 |
| 密码重置 | 管理员直接重置用户密码（生成随机新密码，显示一次后加密存储） | 同上 |
| 用户删除 | 删除违规账号及其相关内容 | 同上 |

**密码重置流程（发送邮件）：**
```
管理员在用户详情页点击"重置密码"
    → 确认弹窗："将向 xxx@email.com 发送密码重置邮件？"
    → 确认后系统为该用户生成一次性重置令牌（有效期 1 小时）
    → 通过邮件服务发送重置链接到用户注册邮箱
    → 用户点击链接进入重置密码页面
    → 用户自行输入新密码并确认
    → 新密码 bcrypt 加密存入数据库，令牌失效
```

**依赖**：需接入邮件发送服务（如 Resend / SendGrid / 阿里云邮件推送），
在 `.env` 中配置发件人信息和 API Key。
后续可在管理后台增加"手动发送重置链接"的记录日志。

**API 路由：**
```
GET    /api/admin/users           — 用户列表（含搜索/分页）
GET    /api/admin/users/[id]      — 用户详情
PUT    /api/admin/users/[id]      — 修改角色 / 封禁/解封 / 重置密码
DELETE /api/admin/users/[id]      — 删除用户
```

**用户列表页面布局：**

```
用户管理                              [+ 导出]
────────────────────────────────────────────────────────
[搜索框]           [全部角色 ▾]  [全部状态 ▾]
────────────────────────────────────────────────────────
┌────┬────────┬──────────┬──────────┬────────┬─────────┐
│ #  │ 邮箱    │ 用户名   │ 角色      │ 状态    │ 操作    │
├────┼────────┼──────────┼──────────┼────────┼─────────┤
│ 1  │ a@b..  │ Player1  │ admin    │ 正常   │ [编辑]  │
│ 2  │ c@d..  │ Gamer99  │ editor   │ 正常   │ [编辑]  │
│ 3  │ e@f..  │ Newbie   │ user     │ 封禁   │ [编辑]  │
└────┴────────┴──────────┴──────────┴────────┴─────────┘
                                    共 12 人  第 1/2 页
```

### 阶段 6：用户系统（公共前台）（✅ 已完成）

| 功能 | 说明 |
|------|------|
| 注册 | 邮箱 + 密码 + 用户名 |
| 登录 | 邮箱密码登录，JWT Session |
| 忘记密码 | Resend 邮件发送重置链接 |
| 个人资料 | 头像上传、修改昵称 |
| 受保护路由 | 未登录用户重定向到登录页 |
| 权限守卫 | 非 admin/super_admin 访问管理后台时重定向 |

### 阶段 7：其他功能（✅ 已完成）

| 功能 | 说明 | 权限 |
|------|------|------|
| 留言板 | 注册用户可留言，访客可浏览 | 超级管理员可删除 |
| 关于页面编辑 | 标题 + 内容 + 微信收款码上传 | 仅超级管理员可编辑 |
| 搜索与筛选 | 游戏库搜索、平台/类型筛选、分页 | 公开 |
| 平台列表 | 按平台浏览游戏 | 公开 |
| 热门游戏 | 首页热门栏目 + /popular 页面 | 管理员/超级管理员可标记 |
| 翻页美化 | 百度风格页码导航 | 公开 |

## 十三、部署指南

### 13.1 前置准备

需要注册的账号（免费）：

| 服务 | 用途 | 注册链接 |
|------|------|---------|
| **Vercel** | 托管网站（Next.js） | https://vercel.com → GitHub 登录 |
| **Supabase** | 数据库 + 存储 | ✅ 已注册 |
| **域名** | 自定义访问地址（可选） | Namesilo / GoDaddy / 阿里云 |

### 13.2 Vercel 部署步骤

#### Step 1：导入项目

```
1. 打开 https://vercel.com
2. 点 "Add New" → "Project"
3. 选择 retro-era 仓库（GitHub）
4. Framework Preset 自动识别为 Next.js
```

#### Step 2：配置环境变量

逐一添加以下变量（值从本地 .env 复制）：

| 变量名 | 说明 | 是否必填 |
|--------|------|---------|
| `DATABASE_URL` | Supabase 数据库连接 | ✅ |
| `AUTH_SECRET` | Session 加密密钥 | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目地址 | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥（上传用） | ✅ |
| `NEXT_PUBLIC_APP_URL` | 先填 `https://项目名.vercel.app` | ✅ |
| `RESEND_API_KEY` | 邮件服务（密码重置） | ⭕ 按需 |
| `EMAIL_FROM` | 发件人地址 | ⭕ 按需 |

#### Step 3：部署

```
Build Command:   pnpm run build（默认）
Output Dir:      .next（默认）
Node Version:    20.x（默认）

→ 点 "Deploy"，等 2-3 分钟
→ 部署完成自动分配 https://retro-era-xxx.vercel.app
```

### 13.3 绑定自定义域名（可选）

```
1. Vercel → Project → Settings → Domains
2. 输入你的域名（如 retroera.com）
3. 按提示在域名管理后台添加 CNAME 记录
4. 等待 DNS 生效（几分钟到几小时）
```

### 13.4 邮件服务配置（密码重置用）

```env
# 推荐 Resend（注册 → 验证域名 → 获取 API Key）
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@你的域名"
```

### 13.5 Supabase 生产检查

```
□ Storage Buckets: game-covers ✅（已设为 Public）
□ Storage Buckets: avatars ✅（已设为 Public）
□ RLS: 使用 service_role key 绕过 ✅（已在 .env 配置）
```

### 13.6 域名与备案

| 部署方式 | 要求 |
|---------|------|
| Vercel（海外节点） | 无需 ICP 备案 |
| 国内服务器 | 必须 ICP 备案（2-4 周） |

### 13.7 部署后检查清单

- [ ] 网站能正常访问
- [ ] 首页显示游戏列表
- [ ] 注册/登录功能正常
- [ ] 上传封面/头像正常
- [ ] 管理后台可进入
- [ ] 密码重置链接能发送（需配置邮件服务）

---

## 十四、服务概览与账号关系

### 14.1 服务清单

| 服务 | 用途 | 账户 | 付费状态 |
|------|------|------|---------|
| **GitHub** | 代码托管 | `Leo2427` | 免费 |
| **Supabase** | PostgreSQL 数据库 + Storage 存储 | 项目 `mgyniiqtrnjzdyjkxbmr` | 免费（数据库 500MB，Storage 1GB） |
| **Vercel** | Next.js 托管 + 自动部署 | GitHub 关联登录 | 免费（Hobby Plan） |
| **Cloudflare** | DNS + CDN + SSL | 用户注册邮箱 | 免费 |
| **Namesilo** | 域名注册商（retro-era.xyz） | 用户注册邮箱 | 付费（域名年费） |
| **Resend** | 邮件发送（密码重置） | 用户注册邮箱 | 免费（100 封/天） |

### 14.2 架构关系图

```
用户浏览器
    ↓
Cloudflare CDN（加速 + SSL）       ← 免费
    ↓
Vercel（Next.js SSR）              ← 免费
    ├── GitHub 自动部署             ← Leo2427/retro-era
    ├── env: 环境变量（见 13.2）
    │
    └── Supabase（数据库 + 存储）   ← 免费档
        ├── PostgreSQL（游戏数据、用户、留言）
        ├── Storage game-covers（封面图）
        └── Storage avatars（头像 + 收款码）

邮件服务：
用户忘记密码 → Resend API → 发送重置邮件  ← 免费
```

### 14.3 域名配置关系

```
Namesilo 注册 → retro-era.xyz（年费）
    ↓ NS 指向
Cloudflare DNS → 管理 DNS 记录
    ↓ CNAME @ / www
Vercel → 绑定域名 + 自动 SSL 证书
```

### 14.4 关键配置备忘

| 项目 | 位置 | 说明 |
|------|------|------|
| **数据库连接** | Vercel → Environment Variables → `DATABASE_URL` | Supabase 连接池地址 |
| **Auth 密钥** | Vercel → `AUTH_SECRET` | 已生成随机 64 位字符串 |
| **Supabase URL/Key** | Vercel → `NEXT_PUBLIC_SUPABASE_*` | Project Settings → API 获取 |
| **Storage 上传密钥** | Vercel → `SUPABASE_SERVICE_ROLE_KEY` | 服务端密钥，绕过 RLS |
| **邮件 API** | Vercel → `RESEND_API_KEY` | Resend Dashboard 获取 |
| **发件地址** | Vercel → `EMAIL_FROM` | `noreply@retro-era.xyz` ✅ 已验证 |
| **应用 URL** | Vercel → `NEXT_PUBLIC_APP_URL` | `https://retro-era.xyz` |
| **Cloudflare SSL** | SSL/TLS → Full 模式 | 必须配置，否则 Vercel 检测到代理报错 |
| **Cloudflare 代理** | DNS 记录 → 橙色云朵 ☁️ | 开启 CDN 加速，隐藏源站 IP |

### 14.5 操作权限

| 操作 | 谁可以做 | 入口 |
|------|---------|------|
| 代码修改推送 | 开发者 | GitHub |
| 部署新版本 | 自动（push 触发） | Vercel |
| 查看数据库 | 开发者 | Supabase Dashboard |
| 修改域名 DNS | 域名所有者 | Cloudflare |
| 续费域名 | 域名所有者 | Namesilo |
| 管理邮箱 API | 邮箱所有者 | Resend Dashboard |

---

## 十五、文档同步说明

> 本文件（plan.md）是项目的唯一技术文档，
> 所有功能修改、新增、配置变更都应及时同步到此文档中。
> 包括但不限于：
> - 新增数据模型
> - 修改权限体系
> - 添加环境变量
> - 变更部署配置
> - 调整技术栈

---

## 九、图片上传方案

### Storage Bucket 结构

```
game-covers/                    # 游戏封面（公开读取）
  └── {game-slug}/
       └── cover.{ext}
avatars/                        # 用户头像（公开读取）
  └── {userId}.{ext}
```

### 上传流程

```
用户选择图片
  → 前端预览（FileReader API）
  → POST /api/upload (multipart/form-data)
  → 后端验证（类型/大小）
  → 上传到 Supabase Storage（upsert 覆盖）
  → 返回公开 URL
  → 写入数据库对应字段
```

### API 接口

| 路由 | 方法 | 参数 | 说明 |
|------|------|------|------|
| `/api/upload` | POST | `file` (File), `type` ("cover"/"avatar"), `slug` (游戏标识) | 上传图片，返回公开 URL |

### ImageUploader 组件

**位置**：`src/components/admin/ImageUploader.tsx`

**功能**：
- 点击选择文件（支持 JPG / PNG / WebP / GIF）
- 上传前本地预览
- 上传中显示加载遮罩
- 上传后自动回调 URL
- 错误提示

**集成页面**：
- 游戏编辑页 `/games/[slug]/edit` → 封面上传
- 个人资料页 `/profile` → 头像上传

### 初始化步骤

首次使用前需在 Supabase 后台创建 Storage Bucket：

```
1. 进入 Supabase 后台 → Storage → New bucket
2. 创建 game-covers（Public bucket）
3. 创建 avatars（Public bucket）
4. 如需 RLS 策略，添加：
   - 允许公开 SELECT（任何人可查看图片）
   - 仅认证用户可 INSERT / UPDATE
```

### 环境变量

```env
NEXT_PUBLIC_SUPABASE_URL="https://mgyniiqtrnjzdyjkxbmr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="从 Project Settings → API → anon public 获取"
SUPABASE_SERVICE_ROLE_KEY="从 Project Settings → API → service_role 获取（绕过 RLS 用）"
```

### 图片规格

| 用途 | 建议尺寸 | 格式 | 最大体积 | 存储路径 |
|------|---------|------|---------|---------|
| 游戏封面 | 800×600 (4:3) | WebP/PNG/JPG | 5MB | `game-covers/{slug}/cover.*` |
| 用户头像 | 256×256 (1:1) | WebP/PNG/JPG | 5MB | `avatars/{userId}.*` |

---

## 十、管理后台导航结构

```
管理后台
├── 📋 概览               /admin
├── 🎮 游戏管理           /admin/games
│   ├── 所有游戏列表
│   └── + 新建游戏
├── 👥 人员管理           /admin/users      (仅 super_admin)
│   ├── 用户列表
│   ├── 提升/撤销管理员
│   ├── 封禁/解封
│   └── 重置密码
└── 🏠 返回前台
```

---

## 十一、环境变量

```env
# ── 数据库 ──
DATABASE_URL="postgresql://postgres.xxxxx:密码@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ── Supabase ──
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJxxxxx"

# ── Auth.js ──
AUTH_SECRET="openssl rand -base64 32 生成"

# ── 应用 URL（生产环境替换为实际域名）──
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ── 邮件服务（生产环境必配）──
# RESEND_API_KEY="re_..."
# SENDGRID_API_KEY="SG.xxx"
# EMAIL_FROM="noreply@retroera.com"

# ── Supabase 服务端操作（管理后台用）──
# SUPABASE_SERVICE_ROLE_KEY=""
```

---

## 十二、后续扩展

| 功能 | 说明 | 前置条件 |
|------|------|---------|
| 论坛 | 社区讨论功能 | 用户系统完成后 |
| 视频上传 | 游戏视频/攻略 | Storage 就绪后 |
| 游戏评分 | 用户打分 | 用户系统完成后 |
| 用户收藏 | 收藏游戏列表 | 用户系统完成后 |
| 操作日志 | 管理员操作审计 | 管理后台完成后 |
