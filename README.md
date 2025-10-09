# test
This is my first project

## XiaoHongShu Keyword Scheduler

This repository now includes a small utility that can fetch notes from XiaoHongShu
(`小红书`) for a given keyword every day at 8 AM (Asia/Shanghai by default). The
script relies on a valid logged-in cookie string gathered from a browser session
because XiaoHongShu does not provide an open unauthenticated API.

### 中文说明

这个工具可以帮助你**每天自动在小红书上搜索指定的关键词，并保存匹配的笔记信息**。它适用于想要定时追踪品牌口碑、热门话题、竞品动态或市场趋势的用户。通过每天早上固定时间运行，你可以持续积累某个关键词的内容数据，方便后续分析和归档。

#### 如何在电脑上使用

按照下面的步骤操作，就可以在本地电脑上运行这个程序：

1. **准备 Python 环境**
   ```bash
   python -m venv .venv          # 创建隔离的虚拟环境
   source .venv/bin/activate     # 激活虚拟环境
   pip install -r requirements.txt
   ```
2. **配置登录 Cookie**
   - 在浏览器登录你的小红书账号，打开开发者工具（快捷键 F12），切换到“Network/网络”面板。
   - 刷新页面，找到任意对 `www.xiaohongshu.com` 的请求，在请求头中复制完整的 `Cookie` 字符串。
   - 将它保存到环境变量中，例如在 macOS/Linux 终端执行：
     ```bash
     export XHS_COOKIE='复制的 Cookie 字符串'
     ```
     如果是 Windows PowerShell，可以运行：
     ```powershell
     setx XHS_COOKIE "复制的 Cookie 字符串"
     ```
     也可以在运行脚本时通过命令行参数 `--cookie` 临时传入。
3. **运行调度脚本**
   - 假设要追踪“咖啡”相关的笔记，在终端中执行：
     ```bash
     python schedule_notes.py "咖啡" --run-now --output-dir data
     ```
   - `--run-now` 会立即抓取一次并把结果保存到 `data/` 目录。
   - 之后脚本会在每天北京时间 08:00 自动再次抓取，生成名为 `<关键词>_YYYYMMDD_HHMMSS.json` 的文件，包含笔记的 ID、标题、摘要、点赞数和链接等信息。
   - 如果你暂时没有可用的 Cookie，只想演示运行流程，可以加上 `--demo` 参数：
     ```bash
     python schedule_notes.py "咖啡" --run-now --demo
     ```
     演示模式会跳过真实的网络请求，输出两条示例笔记，方便确认保存路径与文件格式。

完成以上步骤后，你就能在电脑上定期获取并保存小红书相关关键词的笔记数据，为市场调研、内容监控或数据分析提供支持。

### Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Set the `XHS_COOKIE` environment variable or pass the cookie via the command
line when running the scheduler.

### Usage

```bash
python schedule_notes.py "咖啡" --run-now --output-dir data

# 仅做流程演示，可添加 --demo 生成示例数据
python schedule_notes.py "咖啡" --run-now --demo
```

The command above will:

1. Perform an immediate fetch for the keyword `咖啡` and store the results under
   the `data/` folder.
2. Schedule a recurring job that runs every day at 08:00 (Asia/Shanghai).

Each run saves a JSON snapshot named `<keyword>_YYYYMMDD_HHMMSS.json` containing
the note metadata (note ID, title, excerpt, like count, canonical URL).
