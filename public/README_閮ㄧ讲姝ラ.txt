问鼎国际娱乐 · Cloudflare 正确部署版

这个版本已经去掉 Netlify 文件，并改成 Cloudflare Workers + Durable Object。

项目结构：
public/
  index.html
  style.css
  auth.js
  app1.js
  app2.js
  app3.js
  admin.html
  assets/logo.png
  assets/animals/01-36
worker.js
wrangler.jsonc
package.json

Cloudflare GitHub 部署：
1. GitHub 仓库使用：HCR-POS/wending
2. Cloudflare：Workers & Pages → Create application → Import a repository
3. 选择 GitHub → HCR-POS → wending
4. Production branch：main
5. Build command：留空
6. Deploy command：npx wrangler deploy
7. Root directory：/
8. Save and Deploy

部署后设置管理员密钥：
Cloudflare → Workers & Pages → wending → Settings → Variables and Secrets
新增 Secret：ADMIN_TOKEN
值填写你自己的管理员密码/令牌。

后台地址：
https://你的域名/admin.html
打开后输入 ADMIN_TOKEN 即可查看注册玩家的 IP、设备、浏览器等信息。

注意：用户注册、登录、会话、管理员用户列表已经由 worker.js 的 Durable Object 保存，不需要 Netlify。
