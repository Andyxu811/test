"""Fetch XiaoHongShu notes for a keyword and organise structured exports."""
from __future__ import annotations

import argparse
import csv
import dataclasses
import json
import logging
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Iterable, Sequence

from xiaohongshu_fetcher import (
    DemoXiaoHongShuClient,
    Note,
    XiaoHongShuClient,
    collect_notes_across_pages,
)

SUPPORTED_FORMATS: tuple[str, ...] = ("json", "markdown", "csv")


def parse_args(argv: Iterable[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Search XiaoHongShu (小红书) for a keyword, then export the matching notes "
            "to local JSON/Markdown/CSV files sorted by popularity."
        )
    )
    parser.add_argument("keyword", help="Keyword to search for on XiaoHongShu")
    parser.add_argument(
        "--cookie",
        help=(
            "Cookie string for an authenticated XiaoHongShu session. If omitted, the "
            "XHS_COOKIE environment variable will be used."
        ),
    )
    parser.add_argument("--pages", type=int, default=1, help="Number of result pages to fetch")
    parser.add_argument(
        "--page-size",
        type=int,
        default=20,
        help="Number of notes requested per page (default: 20)",
    )
    parser.add_argument(
        "--delay-between-pages",
        type=float,
        default=0.5,
        help="Delay in seconds between page fetches to avoid hitting rate limits.",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=3,
        help="Number of retries per page before giving up (default: 3)",
    )
    parser.add_argument(
        "--formats",
        nargs="+",
        choices=SUPPORTED_FORMATS,
        default=("json", "markdown"),
        help="Output formats to generate (default: json markdown)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("reports"),
        help="Directory where the exported files will be written",
    )
    parser.add_argument(
        "--sort-by",
        choices=("likes", "title", "none"),
        default="likes",
        help="Sorting strategy applied before exporting (default: likes)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Limit the number of notes exported after sorting",
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Run in demo mode using bundled sample notes instead of real requests",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        help="Logging level (DEBUG, INFO, WARNING...)",
    )
    return parser.parse_args(argv)


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )


def ensure_output_dir(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


def ensure_cookie(args: argparse.Namespace) -> str:
    cookie = args.cookie or os.environ.get("XHS_COOKIE")
    if not cookie:
        raise SystemExit(
            "A XiaoHongShu cookie is required. Pass --cookie or set XHS_COOKIE when not running in demo mode."
        )
    return cookie


def slugify_keyword(keyword: str) -> str:
    slug = re.sub(r"[^0-9A-Za-z\u4e00-\u9fff]+", "_", keyword).strip("_")
    return slug or "keyword"


def sort_notes(notes: Sequence[Note], strategy: str) -> list[Note]:
    if strategy == "likes":
        return sorted(notes, key=lambda note: note.liked_count, reverse=True)
    if strategy == "title":
        return sorted(notes, key=lambda note: note.title)
    return list(notes)


def truncate(text: str, limit: int = 160) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1] + "…"


def sanitize_markdown(text: str) -> str:
    return text.replace("|", "\\|").replace("\n", " ")


def export_json(notes: Sequence[Note], path: Path) -> None:
    payload = [dataclasses.asdict(note) for note in notes]
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def export_csv(notes: Sequence[Note], path: Path) -> None:
    with path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(["note_id", "title", "desc", "liked_count", "url"])
        for note in notes:
            writer.writerow([note.note_id, note.title, note.desc, note.liked_count, note.url])


def build_markdown(notes: Sequence[Note], keyword: str) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines = [
        f"# 小红书笔记整理：《{keyword}》",
        "",
        f"> 导出时间：{now}",
        f"> 共整理 {len(notes)} 条笔记",
        "",
        "| 排名 | 标题 | 点赞数 | 链接 | 摘要 |",
        "| --- | --- | --- | --- | --- |",
    ]
    for index, note in enumerate(notes, start=1):
        title = sanitize_markdown(note.title or "(无标题)")
        summary = sanitize_markdown(truncate(note.desc or "", limit=120) or "(无摘要)")
        url = note.url or ""
        lines.append(
            f"| {index} | {title} | {note.liked_count} | [打开]({url}) | {summary} |"
        )
    return "\n".join(lines) + "\n"


def export_markdown(notes: Sequence[Note], path: Path, keyword: str) -> None:
    path.write_text(build_markdown(notes, keyword), encoding="utf-8")


def main(argv: Iterable[str] | None = None) -> None:
    args = parse_args(argv)
    configure_logging(args.log_level)
    ensure_output_dir(args.output_dir)

    if args.demo:
        logging.getLogger("collect_notes").warning(
            "Running in demo mode. Sample data will be used instead of live requests."
        )
        client = DemoXiaoHongShuClient()
    else:
        cookie = ensure_cookie(args)
        client = XiaoHongShuClient(cookie=cookie)

    notes = collect_notes_across_pages(
        client,
        args.keyword,
        pages=args.pages,
        page_size=args.page_size,
        delay_between_pages=args.delay_between_pages,
        retries=args.retries,
    )

    sorted_notes = sort_notes(notes, args.sort_by)
    if args.limit is not None and args.limit > 0:
        sorted_notes = sorted_notes[: args.limit]

    keyword_slug = slugify_keyword(args.keyword)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_path = args.output_dir / f"{keyword_slug}_{timestamp}"

    exported_files: list[Path] = []
    for fmt in args.formats:
        if fmt == "json":
            target = base_path.with_suffix(".json")
            export_json(sorted_notes, target)
        elif fmt == "markdown":
            target = base_path.with_suffix(".md")
            export_markdown(sorted_notes, target, args.keyword)
        elif fmt == "csv":
            target = base_path.with_suffix(".csv")
            export_csv(sorted_notes, target)
        else:  # pragma: no cover - safeguarded by argparse choices
            continue
        exported_files.append(target)

    logger = logging.getLogger("collect_notes")
    logger.info(
        "Exported %s notes for keyword '%s' -> %s",
        len(sorted_notes),
        args.keyword,
        ", ".join(str(path) for path in exported_files) or "(no files)",
    )


if __name__ == "__main__":
    main()
