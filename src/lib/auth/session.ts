import { createHmac, timingSafeEqual } from "node:crypto";

import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { COACH_HOME_PATH, STUDENT_HOME_PATH } from "@/lib/constants";

const SESSION_COOKIE = "tennis-growth-session";

export type SessionPayload = {
  userId: string;
  role: UserRole;
  name: string;
};

function getSecret() {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    return "tennis-growth-panel-dev-secret";
  }

  throw new Error("Missing AUTH_SECRET environment variable.");
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function encode(payload: SessionPayload) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${value}.${sign(value)}`;
}

function decode(rawValue?: string) {
  if (!rawValue) {
    return null;
  }

  const [payload, signature] = rawValue.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload);
  if (expectedSignature.length !== signature.length) {
    return null;
  }

  const isValid = timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  if (!isValid) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, encode(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  return decode(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireRole(role: UserRole) {
  const session = await getSession();
  if (!session || session.role !== role) {
    redirect("/login");
  }

  return session;
}

export function getRoleHomePath(role: UserRole) {
  return role === UserRole.COACH ? COACH_HOME_PATH : STUDENT_HOME_PATH;
}
