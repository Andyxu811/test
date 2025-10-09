"""Utilities for fetching XiaoHongShu (Little Red Book) notes by keyword.

The real XiaoHongShu web API requires a valid logged-in cookie and some anti-
bot headers. This module keeps the networking and parsing logic in one place so
that the scheduling script can remain lightweight.
"""
from __future__ import annotations

import dataclasses
import json
import logging
import time
from datetime import datetime
from typing import Iterable, List, Protocol, Sequence

try:  # pragma: no cover - optional dependency for demo mode
    import requests  # type: ignore
except ModuleNotFoundError:  # pragma: no cover - handled gracefully below
    requests = None  # type: ignore

logger = logging.getLogger(__name__)


@dataclasses.dataclass(slots=True)
class Note:
    """Structured information for a XiaoHongShu note."""

    note_id: str
    title: str
    desc: str
    liked_count: int
    url: str


class SupportsNoteSearch(Protocol):
    """Protocol describing objects that can search for notes."""

    def search_notes(
        self,
        keyword: str,
        *,
        page: int = 1,
        page_size: int = 20,
    ) -> List["Note"]:
        ...


class XiaoHongShuClient:
    """Simple client for XiaoHongShu search endpoints.

    Parameters
    ----------
    cookie:
        A valid cookie string captured from a logged-in XiaoHongShu session.
    timeout:
        Request timeout in seconds.
    base_url:
        Base URL for the search API.  The default value is known to work for
        the web interface as of 2024, but may change without notice.
    """

    def __init__(
        self,
        *,
        cookie: str,
        timeout: int = 15,
        base_url: str = "https://edith.xiaohongshu.com/api/sns/web/v1/search/notes",
        user_agent: str | None = None,
    ) -> None:
        if requests is None:
            raise ImportError(
                "The 'requests' package is required to use XiaoHongShuClient."
            )

        if not cookie:
            raise ValueError("A valid XiaoHongShu cookie must be provided.")

        self._session = requests.Session()
        self._session.headers.update(
            {
                "User-Agent": user_agent
                or "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 "
                "Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Referer": "https://www.xiaohongshu.com",
                "Cookie": cookie,
            }
        )
        self._timeout = timeout
        self._base_url = base_url

    def search_notes(
        self,
        keyword: str,
        *,
        page: int = 1,
        page_size: int = 20,
    ) -> List[Note]:
        """Search notes matching ``keyword``.

        The API expects quite a few headers in a production environment.  The
        provided defaults are sufficient for scripts that inject valid cookies
        and run sparingly.  For heavier usage you may need to add extra anti-
        bot headers (``X-S``, ``X-T``...) that XiaoHongShu checks server-side.
        """

        params = {
            "keyword": keyword,
            "page": page,
            "page_size": page_size,
            # ``note_type`` keeps the API focused on notes rather than other
            # content types like users.
            "note_type": 0,
            "sort": "general",
        }

        logger.debug("Requesting notes", extra={"params": params})
        response = self._session.get(
            self._base_url,
            params=params,
            timeout=self._timeout,
        )
        response.raise_for_status()
        payload = response.json()
        return _parse_note_payload(payload)

    def dump_notes(
        self,
        keyword: str,
        *,
        page: int = 1,
        page_size: int = 20,
        stream=None,
    ) -> None:
        """Fetch and dump notes as JSON for quick inspection."""

        notes = self.search_notes(keyword, page=page, page_size=page_size)
        serialized = [dataclasses.asdict(note) for note in notes]
        text = json.dumps(serialized, ensure_ascii=False, indent=2)
        if stream is None:
            print(text)
        else:
            stream.write(text)


class XiaoHongShuError(RuntimeError):
    pass


class DemoXiaoHongShuClient:
    """Return canned XiaoHongShu notes for demonstration purposes."""

    def __init__(self) -> None:
        # The sample dataset intentionally mirrors the structure returned by
        # :class:`XiaoHongShuClient` so downstream code can operate without
        # branching based on the client type.
        now = datetime.now().strftime("%Y-%m-%d")
        self._samples = [
            Note(
                note_id="demo-001",
                title="示例笔记：品牌种草灵感",
                desc="这是一条用于演示的小红书笔记，展示如何保存抓取结果。",
                liked_count=520,
                url="https://www.xiaohongshu.com/explore/demo-001",
            ),
            Note(
                note_id="demo-002",
                title="案例拆解：内容营销打法",
                desc="演示模式下的第二条笔记，用于说明导出的字段格式。",
                liked_count=214,
                url="https://www.xiaohongshu.com/explore/demo-002",
            ),
            Note(
                note_id="demo-003",
                title=f"{now} 热门趋势观察",
                desc="第三条示例笔记，帮助验证多页抓取与排序逻辑。",
                liked_count=180,
                url="https://www.xiaohongshu.com/explore/demo-003",
            ),
        ]

    def search_notes(
        self,
        keyword: str,
        *,
        page: int = 1,
        page_size: int = 20,
    ) -> List[Note]:
        # Reuse the same slice-based pagination logic so that demo results are
        # deterministic and limited by ``page_size``.
        del keyword  # keyword is unused for canned data
        start = (page - 1) * page_size
        end = start + page_size
        return self._samples[start:end]


def _parse_note_payload(payload: dict) -> List[Note]:
    """Convert the XiaoHongShu payload into :class:`Note` objects."""

    if not isinstance(payload, dict):
        raise XiaoHongShuError("Unexpected response structure")

    data = payload.get("data")
    if not data:
        raise XiaoHongShuError("Response did not include 'data'")

    items: Sequence[dict] = data.get("items") or []
    notes: List[Note] = []
    for item in items:
        note_card = item.get("note_card") or {}
        note_id = note_card.get("note_id")
        if not note_id:
            logger.debug("Skipping item without note_id: %s", item)
            continue
        title = note_card.get("display_title") or note_card.get("title") or ""
        desc = note_card.get("desc") or ""
        liked_count = note_card.get("interact_info", {}).get("liked_count", 0)
        url = f"https://www.xiaohongshu.com/explore/{note_id}"
        notes.append(
            Note(
                note_id=note_id,
                title=title,
                desc=desc,
                liked_count=int(liked_count or 0),
                url=url,
            )
        )

    return notes


def backoff_delays(initial: float = 1.0, maximum: float = 60.0) -> Iterable[float]:
    """Generate exponential backoff delays capped at ``maximum`` seconds."""

    delay = initial
    while True:
        yield delay
        delay = min(delay * 2, maximum)


def resilient_search(
    client: SupportsNoteSearch,
    keyword: str,
    *,
    page: int = 1,
    page_size: int = 20,
    retries: int = 3,
    initial_delay: float = 1.0,
) -> List[Note]:
    """Wrapper around :meth:`XiaoHongShuClient.search_notes` with retries."""

    last_error: Exception | None = None
    delays = backoff_delays(initial_delay)
    RequestError = Exception if requests is None else requests.RequestException

    for attempt in range(1, retries + 2):
        try:
            logger.info(
                "Fetching keyword '%s' (attempt %s, page=%s, size=%s)",
                keyword,
                attempt,
                page,
                page_size,
            )
            return client.search_notes(keyword, page=page, page_size=page_size)
        except RequestError as exc:  # network or HTTP errors
            last_error = exc
            delay = next(delays)
            logger.warning(
                "Request failed (%s). Retrying in %.1f seconds...", exc, delay
            )
            time.sleep(delay)
    if last_error is None:
        raise XiaoHongShuError("Failed to fetch notes for unknown reasons")
    raise XiaoHongShuError("Failed to fetch notes") from last_error


def collect_notes_across_pages(
    client: SupportsNoteSearch,
    keyword: str,
    *,
    pages: int = 1,
    page_size: int = 20,
    delay_between_pages: float = 0.5,
    retries: int = 3,
    initial_delay: float = 1.0,
) -> List[Note]:
    """Fetch notes for multiple pages while deduplicating results."""

    if pages < 1:
        raise ValueError("'pages' must be at least 1")
    if page_size < 1:
        raise ValueError("'page_size' must be at least 1")

    notes: list[Note] = []
    seen_ids: set[str] = set()
    for page in range(1, pages + 1):
        page_notes = resilient_search(
            client,
            keyword,
            page=page,
            page_size=page_size,
            retries=retries,
            initial_delay=initial_delay,
        )
        for note in page_notes:
            if note.note_id in seen_ids:
                continue
            seen_ids.add(note.note_id)
            notes.append(note)
        if page < pages and delay_between_pages > 0:
            time.sleep(delay_between_pages)
    return notes


__all__ = [
    "Note",
    "SupportsNoteSearch",
    "XiaoHongShuClient",
    "DemoXiaoHongShuClient",
    "resilient_search",
    "collect_notes_across_pages",
    "XiaoHongShuError",
]
