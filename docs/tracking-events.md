# 站点统计事件说明

本文档用于说明外贸获客情报局的点击统计口径。

事件由浏览器直接上报，不经过服务端写日志：

- Next.js 页面：`lib/utils/customsDataSkillTracking.js` 调用 `gtag` 与 `window.va`
- 静态落地页：`public/analytics-static.js` 统一注入 GA4、Vercel Web Analytics，并监听 `[data-track]` 点击
- `/api/track-click` 只保留参数校验和部署自检，不再落盘

查看位置：GA4 → 报告 → 互动 → 事件；Vercel → 项目 → Analytics（自定义事件需 Pro 套餐）。

## 事件类型

| 事件名 | 用途 | 典型来源 |
| --- | --- | --- |
| `customs_data_skill_click` | 记录进入 OraSkl 海关数据 Skill 相关入口的点击 | 首页、文章页、搜索页、专题页 |
| `outbound_tool_click` | 记录跳转到第三方工具或活动页的外链点击 | 活动公告、移动端活动条 |
| `site_interaction` | 记录不跳转页面但有转化意义的站内互动 | 复制微信、关闭活动广告、关闭资料按钮 |

## 来源分组

| sourceGroup | 含义 |
| --- | --- |
| `home` | 首页入口 |
| `article` | 文章页入口 |
| `search` | 搜索页入口 |
| `topic` | 专题页入口 |
| `tools` | 工具导航页入口 |
| `activity` | 活动公告、活动浮窗、移动端活动条 |
| `lead` | 领取资料、微信复制等线索转化动作 |
| `brand` | 品牌页或 OraSkl 品牌入口 |
| `cluster` | 静态内容集群页 |
| `test` | 部署自检或健康检查事件，只验证接口可用性，不计入统计 |
| `other` | 未明确归类的入口，接口会把空分组统一归到这里 |

## 当前关键 action

| action | 含义 |
| --- | --- |
| `copy_wechat` | 用户点击复制微信号 |
| `dismiss_gift_widget` | 用户关闭领取资料按钮或资料浮窗 |
| `dismiss_activity_ad` | 用户关闭浮动活动广告 |

## 隐私口径

- 不再保存服务端点击日志，事件只存在于 GA4 和 Vercel Analytics。
- GA4 已开启 IP 匿名化（`anonymize_ip`）。
- 上报字段只有来源标识、页面路径、外链目标和事件类型，不采集表单内容。
- `sourceGroup=test` 或以 `deploy_check` 开头的请求只用于部署自检，接口正常返回但不计入统计。
