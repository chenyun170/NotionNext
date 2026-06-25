# SEO / GEO 监控清单

更新日期：2026-06-25

## 每次部署后先检查

1. 打开 `https://www.123170.xyz/robots.txt`，确认包含：
   - `https://www.123170.xyz/sitemap.xml`
   - `https://www.123170.xyz/sitemap-index.xml`
   - `https://www.123170.xyz/sitemap-core.xml`
   - `https://www.123170.xyz/llms.txt`
2. 打开 `https://www.123170.xyz/sitemap.xml`，确认是 XML 且返回 200。
3. 打开 `https://www.123170.xyz/sitemap-core.xml`，确认核心 SEO 页面都在里面。
4. 打开 `https://www.123170.xyz/google-submit-urls.txt`，按清单做 Search Console URL 检查。
5. 运行：

```powershell
D:\node\node.exe scripts\seo-health-check.js
D:\node\node.exe scripts\validate-seo-jsonld.js
```

## Search Console 需要提交

提交站点地图：

- `https://www.123170.xyz/sitemap.xml`
- `https://www.123170.xyz/sitemap-index.xml`
- `https://www.123170.xyz/sitemap-core.xml`

优先 URL 检查：

- 首页
- 海关数据专题
- 海关数据 Skill
- 海关数据怎么查进口商
- 外贸获客工具怎么选
- 外贸客户开发工具推荐
- 图灵搜和海关数据区别
- 顶易云和海关数据怎么配合

完整清单见：`public/google-submit-urls.txt`

## 每周看一次的数据

- 查询词：看是否出现 `图灵搜`、`顶易云`、`顶易`、`海关数据`、`进口商查询`、`HS 编码`。
- 曝光量：判断 Google 是否开始理解页面主题。
- 点击率：标题和描述是否需要改得更直接。
- 平均排名：排名 8-30 的词，优先补内容和内链。
- 已发现未编入索引：检查页面是否重复、内容太薄或内链不足。
- 已抓取但未编入索引：优先加强页面答案块、信任说明和站内链接。

## 下一批内容依据

优先写已有曝光但排名不稳定的词；不要只凭感觉扩页面。每次新增页面都要同步：

- `pages/sitemap.xml.js`
- `pages/sitemap-index.xml.js`
- `pages/sitemap-core.xml.js`
- `pages/llms.txt.js`
- `public/google-submit-urls.txt`
- `scripts/deploy-check.js`
- `scripts/validate-seo-jsonld.js` 覆盖的页面列表
- 站内入口或相关文章内链
