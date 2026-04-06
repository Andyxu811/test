"""Schedule a daily XiaoHongShu keyword search at 8 AM."""
from __future__ import annotations

import argparse
import json
import logging
import os
from datetime import datetime, tzinfo as datetime_tzinfo
from pathlib import Path
from typing import Iterable

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

from xiaohongshu_fetcher import (
    Note,
    SupportsNoteSearch,
    XiaoHongShuClient,
    resilient_search,
)

DEFAULT_TIMEZONE = "Asia/Shanghai"


def parse_args(argv: Iterable[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Fetch XiaoHongShu notes that match a keyword every day at 8 AM. "
            "A valid cookie captured from a logged-in browser session must "
            "be provided via the --cookie option or the XHS_COOKIE "
            "environment variable."
        )
    )
    parser.add_argument("keyword", help="Keyword to search for")
    parser.add_argument(
        "--cookie",
        help=(
            "Cookie string for the authenticated XiaoHongShu session. If "
            "omitted, the script will attempt to read the XHS_COOKIE "
            "environment variable."
        ),
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("output"),
        help="Directory where note snapshots will be stored.",
    )
    parser.add_argument(
        "--timezone",
        default=DEFAULT_TIMEZONE,
        help="IANA timezone name for scheduling (default: Asia/Shanghai)",
    )
    parser.add_argument(
        "--run-now",
        action="store_true",
        help="Run the fetch immediately in addition to scheduling.",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help=(
            "Fetch the keyword immediately, save the snapshot locally, and exit "
            "without starting the scheduler."
        ),
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        help="Logging level (DEBUG, INFO, WARNING...).",
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help=(
            "Run the scheduler in demo mode without network requests. "
            "Generates sample notes so the workflow can be tested without a cookie."
        ),
    )
    return parser.parse_args(argv)


def ensure_cookie(args: argparse.Namespace) -> str:
    cookie = args.cookie or os.environ.get("XHS_COOKIE")
    if not cookie:
        raise SystemExit(
            "A XiaoHongShu cookie is required. Pass --cookie or set XHS_COOKIE."
        )
    return cookie


class _DemoXiaoHongShuClient:
    """Return canned XiaoHongShu notes for demonstration purposes."""

    def search_notes(
        self,
        keyword: str,
        *,
        page: int = 1,
        page_size: int = 20,
    ) -> list[Note]:
        sample_notes = [
            Note(
                note_id="demo-001",
                title=f"示例笔记：{keyword} 的趋势洞察",
                desc="这是一条用于演示的笔记，展示如何保存抓取结果。",
                liked_count=520,
                url="https://www.xiaohongshu.com/explore/demo-001",
            ),
            Note(
                note_id="demo-002",
                title=f"{keyword} 营销案例分享",
                desc="演示模式下的第二条笔记，用于说明 JSON 输出格式。",
                liked_count=214,
                url="https://www.xiaohongshu.com/explore/demo-002",
            ),
        ]
        return sample_notes[:page_size]


def ensure_timezone(name: str):
    from zoneinfo import ZoneInfo

    try:
        return ZoneInfo(name)
    except Exception as exc:  # pragma: no cover - depends on system tzdata
        raise SystemExit(f"Invalid timezone '{name}': {exc}") from exc


def ensure_output_dir(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


def save_notes(
    notes: list[Note], *, keyword: str, output_dir: Path, tzinfo: datetime_tzinfo
) -> Path:
    timestamp = datetime.now(tz=tzinfo).strftime("%Y%m%d_%H%M%S")
    filename = f"{keyword}_{timestamp}.json"
    target = output_dir / filename
    payload = [note.__dict__ for note in notes]
    target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return target


def fetch_job(
    keyword: str,
    client: SupportsNoteSearch,
    output_dir: Path,
    tzinfo: datetime_tzinfo,
) -> None:
    logger = logging.getLogger("schedule_notes")
    notes = resilient_search(client, keyword)
    output_path = save_notes(
        notes, keyword=keyword, output_dir=output_dir, tzinfo=tzinfo
    )
    logger.info(
        "Saved %s notes for keyword '%s' to %s", len(notes), keyword, output_path
    )


def setup_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )


def main(argv: Iterable[str] | None = None) -> None:
    args = parse_args(argv)
    setup_logging(args.log_level)
    tz = ensure_timezone(args.timezone)
    output_dir = ensure_output_dir(args.output_dir)
    if args.demo:
        logger = logging.getLogger("schedule_notes")
        logger.warning(
            "Running in demo mode. Sample data will be generated instead of real network requests."
        )
        client: SupportsNoteSearch = _DemoXiaoHongShuClient()
    else:
        cookie = ensure_cookie(args)
        client = XiaoHongShuClient(cookie=cookie)

    logger = logging.getLogger("schedule_notes")
    if args.once:
        logger.info("Running one-off fetch for keyword '%s'", args.keyword)
        fetch_job(args.keyword, client, output_dir, tz)
        logger.info(
            "Fetch finished. Notes saved locally under %s", output_dir.resolve()
        )
        return

    scheduler = BlockingScheduler(timezone=tz)
    scheduler.add_job(
        fetch_job,
        trigger=CronTrigger(hour=8, minute=0, timezone=tz),
        args=(args.keyword, client, output_dir, tz),
        id="xhs-fetch-job",
        replace_existing=True,
    )

    logger.info(
        "Scheduled XiaoHongShu keyword fetch for '%s' every day at 08:00 (%s)",
        args.keyword,
        tz,
    )

    if args.run_now:
        logger.info("Running initial fetch for keyword '%s'", args.keyword)
        fetch_job(args.keyword, client, output_dir, tz)

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler stopped.")


if __name__ == "__main__":
    main()
