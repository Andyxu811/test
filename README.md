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

1. **准备 Python 环境**
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. **获取登录后的 Cookie**：在浏览器登录你的小红书账号，打开开发者工具复制请求头中的 `Cookie` 字符串，并保存到环境变量 `XHS_COOKIE` 中，或在运行脚本时通过命令行参数传入。
3. **运行调度脚本**：例如想追踪“咖啡”相关的笔记，可以执行：
   ```bash
   python schedule_notes.py "咖啡" --run-now --output-dir data
   ```
   - `--run-now` 会立即抓取一次并保存到 `data/` 目录。
   - 之后脚本会在每天北京时间 08:00 自动再次抓取，并生成名为 `<关键词>_YYYYMMDD_HHMMSS.json` 的文件，文件中包含笔记的 ID、标题、摘要、点赞数和链接等信息。

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
```

The command above will:

1. Perform an immediate fetch for the keyword `咖啡` and store the results under
   the `data/` folder.
2. Schedule a recurring job that runs every day at 08:00 (Asia/Shanghai).

Each run saves a JSON snapshot named `<keyword>_YYYYMMDD_HHMMSS.json` containing
the note metadata (note ID, title, excerpt, like count, canonical URL).
