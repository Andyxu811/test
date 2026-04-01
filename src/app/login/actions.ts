"use server";

import { redirect } from "next/navigation";

import { createSession, getRoleHomePath } from "@/lib/auth/session";
import { authenticateUser } from "@/lib/data";

export type LoginActionState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "请输入账号和密码。" };
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return { error: "账号或密码错误，请重新输入。" };
  }

  await createSession({
    userId: user.id,
    role: user.role,
    name: user.name,
  });

  redirect(getRoleHomePath(user.role));
}
