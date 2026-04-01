"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";

import {
  COMPARE_SIDE_LABELS,
  PHOTO_USAGE_LABELS,
} from "@/lib/constants";

type EditablePhoto = {
  id?: string;
  url: string;
  usage: "MOMENT" | "COMPARE";
  focusLabel: string;
  compareGroupId: string;
  compareSide: "BEFORE" | "AFTER";
  sortOrder: number;
};

type PhotoManagerProps = {
  initialPhotos: EditablePhoto[];
};

export function PhotoManager({ initialPhotos }: PhotoManagerProps) {
  const [photos, setPhotos] = useState<EditablePhoto[]>(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const compareGroups = useMemo(() => {
    const groups = new Map<string, { hasBefore: boolean; hasAfter: boolean }>();

    for (const photo of photos) {
      if (photo.usage !== "COMPARE" || !photo.compareGroupId) {
        continue;
      }

      const current = groups.get(photo.compareGroupId) ?? { hasBefore: false, hasAfter: false };
      if (photo.compareSide === "BEFORE") {
        current.hasBefore = true;
      }
      if (photo.compareSide === "AFTER") {
        current.hasAfter = true;
      }
      groups.set(photo.compareGroupId, current);
    }

    return groups;
  }, [photos]);

  const serializedPhotos = useMemo(
    () =>
      JSON.stringify(
        photos.map((photo, index) => ({
          ...photo,
          sortOrder: index,
        })),
      ),
    [photos],
  );

  function updatePhoto(index: number, patch: Partial<EditablePhoto>) {
    setPhotos((current) =>
      current.map((photo, currentIndex) => {
        if (currentIndex !== index) {
          return photo;
        }

        const nextPhoto = { ...photo, ...patch };

        if (nextPhoto.usage === "MOMENT") {
          nextPhoto.focusLabel = nextPhoto.focusLabel || "训练瞬间";
          nextPhoto.compareGroupId = "";
          nextPhoto.compareSide = "BEFORE";
        } else {
          nextPhoto.compareGroupId = nextPhoto.compareGroupId || "main";
          nextPhoto.focusLabel = "";
        }

        return nextPhoto;
      }),
    );
  }

  function movePhoto(index: number, direction: -1 | 1) {
    setPhotos((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  }

  function removePhoto(index: number) {
    setPhotos((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadedPhotos: EditablePhoto[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error || "上传失败，请稍后再试。");
        }

        const payload = (await response.json()) as { url: string };
        uploadedPhotos.push({
          url: payload.url,
          usage: "MOMENT",
          focusLabel: "训练瞬间",
          compareGroupId: "",
          compareSide: "BEFORE",
          sortOrder: photos.length + uploadedPhotos.length,
        });
      }

      setPhotos((current) => [...current, ...uploadedPhotos]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "上传失败，请稍后再试。");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="panel-card rounded-[1.75rem] p-6">
      <input type="hidden" name="photosPayload" value={serializedPhotos} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-brand">照片管理</h2>
          <p className="mt-1 text-sm leading-7 text-muted">
            先做最小闭环：上传照片后手工标记用途。学员端第一版只展示 1 组动作对比、若干训练瞬间和底部教练总结。
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-brand transition hover:bg-[#c79f2c]">
          <ImagePlus className="h-4 w-4" />
          {isUploading ? "上传中..." : "上传照片"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              void handleUpload(event.target.files);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      <div className="mt-4 rounded-[1.25rem] border border-dashed border-line bg-surface-muted px-4 py-3 text-sm leading-7 text-brand/78">
        “动作对比”照片需要同一 `compareGroupId` 下同时存在 `BEFORE / AFTER` 才会进入学员端动作对比模块。
        “训练瞬间”照片会按 `focusLabel` 归入学员端分组展示。
      </div>

      {uploadError ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {uploadError}
        </div>
      ) : null}

      {photos.length === 0 ? (
        <div className="mt-5 rounded-[1.5rem] border border-dashed border-line px-5 py-10 text-center text-sm leading-7 text-muted">
          还没有上传照片。先选择图片，再为每张图片设置“动作对比”或“训练瞬间”用途。
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          {photos.map((photo, index) => (
            <div key={`${photo.url}-${index}`} className="rounded-[1.5rem] border border-line bg-white p-4">
              <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
                <div className="relative min-h-[220px] overflow-hidden rounded-[1.25rem] bg-surface-muted">
                  <Image
                    src={photo.url}
                    alt={`训练照片 ${index + 1}`}
                    fill
                    sizes="180px"
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-brand/6 px-3 py-1 text-xs font-semibold text-brand/75">
                        照片 {index + 1}
                      </div>
                      <div className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-brand">
                        将显示在：{photo.usage === "COMPARE" ? "动作对比" : "训练瞬间"}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => movePhoto(index, -1)}
                        disabled={index === 0}
                        className="rounded-xl border border-line px-3 py-2 text-xs font-semibold text-brand transition hover:bg-surface-muted disabled:opacity-45"
                      >
                        <span className="inline-flex items-center gap-1">
                          <ArrowUp className="h-4 w-4" />
                          上移
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(index, 1)}
                        disabled={index === photos.length - 1}
                        className="rounded-xl border border-line px-3 py-2 text-xs font-semibold text-brand transition hover:bg-surface-muted disabled:opacity-45"
                      >
                        <span className="inline-flex items-center gap-1">
                          <ArrowDown className="h-4 w-4" />
                          下移
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        删除
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] bg-surface-muted px-4 py-3 text-sm leading-6 text-brand/78">
                    {photo.usage === "COMPARE" ? (
                      (() => {
                        const groupStatus = compareGroups.get(photo.compareGroupId || "main");

                        if (groupStatus?.hasBefore && groupStatus?.hasAfter) {
                          return "这一组 before / after 已成对，发布后会进入学员端“动作对比”。";
                        }

                        if (groupStatus?.hasBefore) {
                          return "这一组目前还缺少 AFTER，发布后暂时不会出现在学员端动作对比。";
                        }

                        if (groupStatus?.hasAfter) {
                          return "这一组目前还缺少 BEFORE，发布后暂时不会出现在学员端动作对比。";
                        }

                        return "动作对比需要同一分组下同时存在 BEFORE 和 AFTER。";
                      })()
                    ) : (
                      <>发布后会进入学员端“训练瞬间”，并归入“{photo.focusLabel || "训练瞬间"}”分组。</>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-brand">照片用途</span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(["MOMENT", "COMPARE"] as const).map((usage) => (
                        <button
                          key={usage}
                          type="button"
                          onClick={() => updatePhoto(index, { usage })}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                            photo.usage === usage
                              ? "border-accent bg-accent text-brand"
                              : "border-line bg-white text-brand/75 hover:border-brand/20"
                          }`}
                        >
                          {PHOTO_USAGE_LABELS[usage]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {photo.usage === "COMPARE" ? (
                    <div className="grid gap-4 rounded-[1.25rem] bg-surface-muted p-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-brand">对比分组</span>
                        <input
                          value={photo.compareGroupId}
                          onChange={(event) =>
                            updatePhoto(index, {
                              compareGroupId: event.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
                          placeholder="例如：main"
                        />
                        <p className="text-xs leading-5 text-muted">第一版通常保持 `main` 即可。</p>
                      </label>

                      <div className="space-y-2">
                        <span className="text-sm font-semibold text-brand">对比位置</span>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {(["BEFORE", "AFTER"] as const).map((side) => (
                            <button
                              key={side}
                              type="button"
                              onClick={() => updatePhoto(index, { compareSide: side })}
                              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                photo.compareSide === side
                                  ? "border-accent bg-white text-brand"
                                  : "border-line bg-white/70 text-brand/70 hover:border-brand/20"
                              }`}
                            >
                              {COMPARE_SIDE_LABELS[side]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="block space-y-2 rounded-[1.25rem] bg-surface-muted p-4">
                      <span className="text-sm font-semibold text-brand">训练瞬间分组</span>
                      <input
                        value={photo.focusLabel}
                        onChange={(event) =>
                          updatePhoto(index, {
                            focusLabel: event.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
                        placeholder="例如：分腿垫步、盯球专注"
                      />
                      <p className="text-xs leading-5 text-muted">学员端会按这个分组名展示照片。</p>
                    </label>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
