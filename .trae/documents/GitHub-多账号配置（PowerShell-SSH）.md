# GitHub 多账号配置（PowerShell + SSH）

适用场景：同一台 Windows 电脑需要同时使用两个 GitHub 账号（例如 `xieruibin` 与 `skipxie`），并在某个项目里用 `skipxie` 推送代码。

本文全部命令都可在 **PowerShell** 里执行。

---

## 1) 为 `skipxie` 生成新的 SSH Key

把邮箱替换成 `skipxie` 的 GitHub 邮箱。

```powershell
ssh-keygen -t ed25519 -C "你的skipxie邮箱@example.com" -f "$env:USERPROFILE\.ssh\id_ed25519_skipxie"
```

运行过程中如果提示输入 passphrase，可以直接回车跳过（也可以设置一个密码，按你习惯）。

---

## 2) 启用 ssh-agent 并添加 Key

```powershell
Get-Service ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent
ssh-add "$env:USERPROFILE\.ssh\id_ed25519_skipxie"
```

---

## 3) 把公钥添加到 GitHub（skipxie 账号）

复制公钥到剪贴板：

```powershell
Get-Content "$env:USERPROFILE\.ssh\id_ed25519_skipxie.pub" | Set-Clipboard
```

然后：
- 登录 `skipxie` 的 GitHub
- 打开 https://github.com/settings/ssh/new
- Title 随便填（例如 `Windows-PC`）
- Key 粘贴（Ctrl+V）
- 点击 Add SSH key

---

## 4) 配置 SSH 多账号映射（~/.ssh/config）

目标：给 `skipxie` 配一个 Host 别名（例如 `github-skipxie`），让 Git 使用对应的 SSH Key。

先确保 `.ssh` 目录存在：

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ssh"
```

打开 SSH 配置文件（没有就会新建）：

```powershell
notepad "$env:USERPROFILE\.ssh\config"
```

把以下内容粘贴进去并保存：

```text
Host github-skipxie
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_skipxie
```

说明：
- 这里用 `github-skipxie` 作为“别名”，不会影响你默认的 `github.com` 配置。
- 如果你已经有其它配置，保留原内容，在末尾追加这一段即可。

---

## 5) 验证 SSH 是否生效（可选，但推荐）

```powershell
ssh -T git@github-skipxie
```

第一次连接可能会提示确认指纹，输入 `yes` 并回车。

成功时一般会看到类似提示（不一定完全一致）：
- `Hi skipxie! You've successfully authenticated, but GitHub does not provide shell access.`

---

## 6) 在当前项目里使用 `skipxie` 身份提交与推送

进入项目目录（按你的实际路径）：

```powershell
cd "F:\trae\webmcp\opc-lab"
```

仅对当前项目设置 Git 提交身份：

```powershell
git config user.name "skipxie"
git config user.email "你的skipxie邮箱@example.com"
```

把远程仓库 URL 切换为 SSH（注意这里使用的是别名 `github-skipxie`）：

```powershell
git remote set-url origin git@github-skipxie:skipxie/opc-lab.git
```

推送：

```powershell
git push -u origin main
```

---

## 7) 常见问题

### 7.1 仍然 403 / Permission denied

通常是以下原因之一：
- 你添加 SSH Key 时登录的是错误的 GitHub 账号
- 你没有对目标仓库 `skipxie/opc-lab` 的写入权限（需要仓库所有者授权）
- 远程仓库 URL 仍然是 HTTPS（`https://github.com/...`），并没有切换到 SSH（`git@...`）

检查当前远程地址：

```powershell
git remote -v
```

### 7.2 config 文件写错了，怎么确认？

查看 config 内容：

```powershell
Get-Content "$env:USERPROFILE\.ssh\config"
```

### 7.3 我不想影响其它项目

第 6 步用的是 `git config`（不带 `--global`），只对当前项目生效，不会影响其他仓库。

