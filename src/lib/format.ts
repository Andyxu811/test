const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatDateDisplay(date: Date | string) {
  return dateFormatter.format(new Date(date));
}

export function formatDateField(date: Date | string) {
  return monthFormatter
    .format(new Date(date))
    .replace(/\//g, "-");
}

export function calculateMonthSpan(startedAt: Date | string) {
  const start = new Date(startedAt);
  const now = new Date();

  const monthDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return Math.max(monthDiff, 0);
}
