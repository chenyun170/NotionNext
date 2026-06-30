# 构建性能与 ISR 预热说明

本文档记录当前站点的构建减负策略，避免每次上线都预生成大量低频页面。

## 当前策略

- 首页、核心静态页和少量高价值分类/标签继续预生成。
- 文章、分页、搜索、后台和登录子路由主要走 `fallback: 'blocking'` 按需生成。
- 构建期启用站点数据内存缓存，减少同一次 build 里重复转换 Notion 数据。
- 重点保留 `海关数据` 分类和标签的预生成，兼顾 SEO 与构建速度。

## 可调环境变量

| 变量 | 默认值 | 作用 |
| --- | --- | --- |
| `NEXT_PREBUILD_PATH_LIMIT` | 空 | 全局预生成数量兜底上限 |
| `NEXT_PREBUILD_TOP_LEVEL_PATH_LIMIT` | `6` | 一级动态路径预生成数量 |
| `NEXT_PREBUILD_SLUG_PATH_LIMIT` | `2` | 文章二级路径预生成数量 |
| `NEXT_PREBUILD_NESTED_SLUG_PATH_LIMIT` | `0` | 多级文章路径预生成数量 |
| `NEXT_PREBUILD_TAG_PATH_LIMIT` | `2` | 标签页预生成数量 |
| `NEXT_PREBUILD_TAG_PAGE_PATH_LIMIT` | `0` | 标签分页预生成数量 |
| `NEXT_PREBUILD_CATEGORY_PATH_LIMIT` | `2` | 分类页预生成数量 |
| `NEXT_PREBUILD_CATEGORY_PAGE_PATH_LIMIT` | `0` | 分类分页预生成数量 |
| `NEXT_PREBUILD_HOME_PAGE_PATH_LIMIT` | `0` | 首页分页预生成数量 |
| `NOTIONNEXT_SITE_DATA_MEMORY_CACHE` | `false` | 非构建模式下是否启用站点数据内存缓存 |

## ISR 预热

上线后可执行：

```bash
npm run warmup:isr
```

常用参数：

```bash
WARMUP_BASE_URL=https://www.123170.xyz npm run warmup:isr
WARMUP_PATHS=/customs-data-skill.html,/category/海关数据 npm run warmup:isr
WARMUP_EXTRA_PATHS=/article/ws,/tag/工具/page/1 npm run warmup:isr
WARMUP_CONCURRENCY=2 WARMUP_TIMEOUT_MS=90000 npm run warmup:isr
```

默认预热路径包括首页、海关数据核心页、工具页、`/category/海关数据`、`/tag/海关数据` 和 `/page/2`。
如果只想预热指定路径，用 `WARMUP_PATHS` 覆盖默认清单；如果想在默认清单后追加路径，用 `WARMUP_EXTRA_PATHS`。

## 发布建议

1. 本地先跑 `npm run type-check`。
2. 生产构建前跑 `npm run build:clean`。
3. 上线后对真实域名跑 `WARMUP_BASE_URL=https://www.123170.xyz npm run warmup:isr`。
4. 如果某个新专题很重要，把路径加入 `WARMUP_EXTRA_PATHS` 或脚本默认清单。
