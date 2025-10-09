# test
This is my first project

## XiaoHongShu Keyword Scheduler

This repository now includes two complementary utilities that work with XiaoHongShu
(`小红书`) search results:

1. **`collect_notes.py`** – fetch a keyword immediately, sort the notes by
   popularity (likes) and export them as JSON/Markdown/CSV snapshots for
   analysis.
2. **`schedule_notes.py`** – schedule an automatic fetch that runs every day at
   8 AM (Asia/Shanghai by default) and keeps saving JSON snapshots locally.

Both scripts rely on a valid logged-in cookie string gathered from a browser
session because XiaoHongShu does not provide an open unauthenticated API.

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
3. **运行脚本并保存到本地**
   - 如果只想立即抓取一次并把结果整理成 JSON/Markdown/CSV 三种格式，可以运行：
     ```bash
     python collect_notes.py "咖啡" --pages 3 --page-size 20 --output-dir reports
     ```
     该命令会抓取前 3 页共 60 条与 “咖啡” 相关的笔记，按照点赞数排序后生成
     `reports/咖啡_YYYYMMDD_HHMMSS.json/.md/.csv` 三个文件，方便后续分析。
     还可以通过 `--formats json markdown` 控制导出格式，或用 `--limit 30`
     限制导出的笔记数量。
   - 如果希望在本地持续每天定时抓取，则可以：
     ```bash
     python schedule_notes.py "咖啡" --run-now --output-dir data
     ```
     `--run-now` 会立即抓取一次并把结果保存到 `data/` 目录，随后脚本会在每天
     北京时间 08:00 自动再次抓取并继续保存到本地。
   - 如果你暂时没有可用的 Cookie，只想演示运行流程，可以在任意脚本中加上
     `--demo` 参数：
     ```bash
     python collect_notes.py "咖啡" --demo
     python schedule_notes.py "咖啡" --once --demo
     ```
     演示模式会跳过真实的网络请求，输出几条示例笔记，方便确认保存路径与文件格式。

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
# 立即抓取一次并整理导出为 JSON + Markdown
python collect_notes.py "咖啡" --pages 2 --formats json markdown

# 运行调度器：立即抓取一次，并在每天 08:00 自动保存到本地
python schedule_notes.py "咖啡" --run-now --output-dir data

# 仅做流程演示，可添加 --demo 生成示例数据
python collect_notes.py "咖啡" --demo
python schedule_notes.py "咖啡" --once --demo
```

The example above will:

1. Fetch up to two pages of notes for the keyword `咖啡`, sort them by likes, and
   export JSON + Markdown reports.
2. Schedule a recurring job that runs every day at 08:00 (Asia/Shanghai).

Each run of the collector saves snapshots named `<keyword>_YYYYMMDD_HHMMSS.*`
containing the note metadata (note ID, title, excerpt, like count, canonical
URL) together with a Markdown table that can be shared with teammates.
