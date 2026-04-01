import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

import { UserRole } from "@prisma/client";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function resolveExtension(file: File) {
  const fileNameExtension = extname(file.name);
  if (fileNameExtension) {
    return fileNameExtension.toLowerCase();
  }

  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  return ".jpg";
}

function canUseBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isProductionLikeRuntime() {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
}

async function saveToLocalUploads(file: File, fileName: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadsDir = join(process.cwd(), "public", "uploads");

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(join(uploadsDir, fileName), buffer);

  return `/uploads/${fileName}`;
}

async function saveToBlob(file: File, fileName: string) {
  const blob = await put(`training-photos/${fileName}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return blob.url;
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== UserRole.COACH) {
    return NextResponse.json({ error: "仅教练端可上传照片。" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请选择要上传的图片。" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "当前只支持图片上传。" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "单张图片请控制在 5MB 以内。" }, { status: 400 });
  }

  const extension = resolveExtension(file);
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;

  try {
    if (!canUseBlobStorage() && isProductionLikeRuntime()) {
      return NextResponse.json(
        { error: "线上环境缺少 BLOB_READ_WRITE_TOKEN，暂时无法上传图片。" },
        { status: 500 },
      );
    }

    const url = canUseBlobStorage() ? await saveToBlob(file, fileName) : await saveToLocalUploads(file, fileName);

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "图片上传失败，请稍后再试。" },
      { status: 500 },
    );
  }
}
