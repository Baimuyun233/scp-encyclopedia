# 傻瓜式部署说明

这份说明只做一件事：把这个 SCP 档案网站放到 GitHub Pages 上，得到一个可以随时打开的网址。全程只用浏览器和鼠标，不需要终端、不需要安装软件、不需要运行任何命令。

部署完成后，网址大致是：

```text
https://你的GitHub用户名.github.io/scp-encyclopedia/
```

---

## 第 1 步：注册或登录 GitHub

1. 在浏览器打开 `https://github.com`。
2. 如果已经有账号，点右上角的 **Sign in** 登录，然后跳到第 2 步。
3. 如果没有账号，点右上角的 **Sign up**。
4. 按页面提示填写：
   - **Email**：你的邮箱。
   - **Password**：设置一个密码。
   - **Username**：你的用户名。只能用英文、数字和短横线，例如 `xiaoming-scp`。
5. 完成人机验证，点 **Create account**。
6. 去邮箱收 GitHub 的验证邮件，点邮件里的确认按钮。
7. 看到 GitHub 首页，右上角出现你的头像，说明注册成功。

> 用户名会出现在最终网址里，想好再填。后面也可以改，但网址会跟着变。

---

## 第 2 步：新建一个仓库

1. 登录后，看页面右上角，找到 **+** 按钮。
2. 点 **+**，在菜单里点 **New repository**。
3. 在新建页面填写：
   - **Owner**：保持默认，选你自己的用户名。
   - **Repository name**：填 `scp-encyclopedia`。
   - **Description**：可以不填。
   - 下面选择 **Public**。
   - **不要**勾选 “Add a README file”。
   - **不要**勾选 “Add .gitignore”。
   - **不要**勾选 “Choose a license”。
4. 点页面底部的绿色按钮 **Create repository**。
5. 成功后，你会看到一个空仓库页面，上面有 “Quick setup” 字样和几个上传入口。

> 仓库必须是 Public。Private 仓库不能免费使用 GitHub Pages。

---

## 第 3 步：把网站文件上传到仓库

### 3.1 先确认要上传什么

打开你电脑上的 `scp` 文件夹，里面应该有这些东西：

```text
index.html
browse.html
item.html
search.html
series.html
credits.html
DEPLOY.md
css/
js/
data/
assets/
```

注意：`index.html` 必须直接位于上传后的仓库最外层，不能变成 `scp/index.html`。

### 3.2 上传

1. 回到刚才的 GitHub 空仓库页面。
2. 点页面上方的 **Add file**，在菜单里点 **Upload files**。
3. 打开电脑上的 `scp` 文件夹。
4. 按 `Ctrl + A` 全选文件夹里的**所有文件和文件夹**。
   - 不要选中 `scp` 文件夹本身。
   - 确认选中的内容里有 `index.html`、`css`、`js`、`data`、`assets`。
5. 把这些内容一起拖进 GitHub 页面中间的上传区域。
6. 等待页面把文件逐个列出来。文件比较多，耐心等到列表不再变化。
7. 在页面下方的 **Commit changes** 区域，提交说明可以填 `first upload`。
8. 点绿色按钮 **Commit changes**。
9. 等待上传完成，回到仓库首页。你应该能看到 `index.html`、`css`、`js`、`data`、`assets` 等文件。

### 如果一次拖不上去

GitHub 网页一次上传很多文件时，浏览器可能会卡住。可以分两次：

**第一次：上传网页和样式**

1. 只选中 `index.html`、`browse.html`、`item.html`、`search.html`、`series.html`、`credits.html`、`DEPLOY.md`，以及 `css`、`js`、`assets` 三个文件夹。
2. 拖进上传区域，点 **Commit changes**。

**第二次：上传数据**

1. 回到仓库首页，点 **Add file** → **Upload files**。
2. 打开 `scp` 文件夹，把 `data` 文件夹整体拖进去。
3. 等待列表出现 `data/index.json` 和 `data/chunk-...json`。
4. 点 **Commit changes**。

> 无论分几次上传，最终仓库最外层都必须能看到 `index.html`。如果看到的是 `scp/index.html`，说明多套了一层文件夹，网站会打不开。

### 上传后检查

在仓库首页从上往下看，确认有：

- `index.html`
- `browse.html`
- `item.html`
- `search.html`
- `series.html`
- `credits.html`
- `DEPLOY.md`
- `css` 文件夹
- `js` 文件夹
- `data` 文件夹
- `assets` 文件夹

点一下 `data` 文件夹，里面应该有 `index.json`，以及很多 `chunk-....json` 文件。

---

## 第 4 步：打开 GitHub Pages

1. 在仓库页面顶部，点 **Settings**。
   - 位置：仓库名字下方的一排标签，靠右。
2. 在左侧菜单里向下找，点 **Pages**。
   - 位置：通常在 “Code and automation” 这一组下面。
3. 在 **Build and deployment** 下面，找到 **Source**。
4. 把 Source 选成 **Deploy from a branch**。
5. 下面会出现 **Branch**：
   - 第一个下拉框选 `main`。
   - 第二个下拉框选 `/ (root)`。
6. 点 **Save**。
7. 看到页面上方出现类似 “GitHub Pages source saved” 的提示，说明保存成功。

> 如果 Branch 下拉框里没有 `main`，先回到仓库首页，确认文件已经提交到默认分支。也可以试 `master`。

---

## 第 5 步：等待网站上线

1. 等 1 到 3 分钟。
2. 刷新当前 **Settings → Pages** 页面。
3. 页面顶部会出现一个绿色区域，里面有一句话：

```text
Your site is live at https://你的用户名.github.io/scp-encyclopedia/
```

4. 点这句话右边的 **Visit site**，或者直接把网址复制到浏览器打开。
5. 能看到深色首页、SCP 标题和系列卡片，就说明部署成功。

第一次打开可能比较慢，因为浏览器要下载目录数据。等几秒即可。

---

## 第 6 步：检查几个页面

打开下面几个地址，确认都能正常工作：

```text
https://你的用户名.github.io/scp-encyclopedia/
https://你的用户名.github.io/scp-encyclopedia/browse.html
https://你的用户名.github.io/scp-encyclopedia/item.html?id=SCP-173
https://你的用户名.github.io/scp-encyclopedia/search.html
https://你的用户名.github.io/scp-encyclopedia/series.html?series=1
https://你的用户名.github.io/scp-encyclopedia/credits.html
```

重点看：

- 首页统计数字是否显示，不应该一直是 `—`。
- 全编号目录是否能看到 SCP-001 到 SCP-9999。
- 点开 SCP-173 是否能显示正文。
- 搜索 `173` 或 `雕像` 是否有结果。
- 系列页是否能切换 01 到 10。

---

## 如果打不开

按顺序排查：

### 1. 等一会儿再刷新

GitHub Pages 第一次发布有时要 3 到 5 分钟。先等 5 分钟，按 `Ctrl + F5` 强制刷新。

### 2. 检查仓库是不是 Public

仓库页面 → **Settings** → 最下面 **Danger Zone** 附近可以看到可见性。如果是 Private，Pages 不能免费使用。

### 3. 检查 index.html 的位置

仓库首页最外层必须直接看到 `index.html`。如果看到的是一个 `scp` 文件夹，点进去才是 `index.html`，那就需要把里面的内容移到最外层。

### 4. 检查 Pages 设置

**Settings → Pages**：

- Source 是 **Deploy from a branch**。
- Branch 是 `main`。
- 文件夹是 `/ (root)`。
- 点过 **Save**。

### 5. 检查 data 文件夹

如果首页能打开，但统计一直是 `—`，或者目录空白：

- 回到仓库首页，确认 `data/index.json` 存在。
- 点开 `data` 文件夹，确认里面有很多 `chunk-....json`。
- 文件名和大小写必须完全一致。GitHub Pages 区分大小写。

### 6. 看 Actions 里有没有报错

仓库顶部点 **Actions**，如果看到红色的失败记录，点进去看最后一行错误。最常见的原因是文件没有上传完整，重新上传缺少的文件即可。

### 7. 换无痕窗口

浏览器缓存可能保留了旧的 404 页面。用无痕窗口打开网址，或者按 `Ctrl + F5`。

---

## 以后怎么更新

1. 在电脑上改好文件。
2. 打开仓库首页，点 **Add file** → **Upload files**。
3. 把修改过的文件或文件夹拖进去，文件名保持不变。
4. 点 **Commit changes**。
5. 等 1 到 2 分钟，刷新网站。

GitHub 会自动用新文件覆盖旧文件。不要改 `data`、`assets`、`css`、`js` 这些文件夹的名字，否则页面里的相对路径会失效。

---

## 最后

- 不需要买服务器。
- 不需要买域名。
- 不需要开终端。
- 不需要安装任何软件。
- 不需要运行构建命令。

网站是纯静态文件，GitHub Pages 只负责把这些文件原样发给浏览器。只要 `index.html` 在仓库最外层，剩下的事情 GitHub 会自动完成。

内容基于 SCP 基金会共笔创作，遵循 CC BY-SA 3.0。
