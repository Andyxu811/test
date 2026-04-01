"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, LockKeyhole, Trophy, Users } from "lucide-react";

import { DEMO_ACCOUNTS } from "@/lib/constants";

import { loginAction, type LoginFormState } from "@/app/login/actions";

const initialState: LoginFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "登录中..." : "进入系统"}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].password);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="panel-card brand-gradient relative overflow-hidden rounded-[2rem] p-8 text-white">
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" />
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-1.5 text-xs font-medium tracking-[0.24em] text-white/85 uppercase">
            MVP 第一阶段
          </div>
          <div className="space-y-3">
            <h1 className="max-w-xl font-display text-4xl font-extrabold leading-tight md:text-5xl">
              网球学员成长面板
            </h1>
            <p className="max-w-xl text-sm leading-7 text-white/78 md:text-base">
              先跑通最小闭环：教练建档、录入训练、保存草稿、发布给学员，再由学员端只读查看。
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl border border-white/12 bg-white/10 p-4 backdrop-blur">
              <Users className="mb-3 h-5 w-5 text-accent" />
              <div className="text-xl font-bold">2 位教练</div>
              <p className="mt-1 text-xs text-white/70">角色独立，导航分离</p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/10 p-4 backdrop-blur">
              <Trophy className="mb-3 h-5 w-5 text-accent" />
              <div className="text-xl font-bold">5 位学员</div>
              <p className="mt-1 text-xs text-white/70">围绕试运行样本设计</p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/10 p-4 backdrop-blur">
              <LockKeyhole className="mb-3 h-5 w-5 text-accent" />
              <div className="text-xl font-bold">草稿 / 发布</div>
              <p className="mt-1 text-xs text-white/70">未发布内容只给教练看</p>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/12 bg-white/8 p-5 backdrop-blur">
            <div className="mb-3 text-xs font-semibold tracking-[0.24em] text-white/70 uppercase">
              演示账号
            </div>
            <div className="grid gap-3">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-left transition hover:border-white/20 hover:bg-black/20"
                >
                  <div>
                    <div className="text-sm font-semibold">
                      {account.label} · {account.hint}
                    </div>
                    <div className="mt-1 text-xs text-white/70">{account.email}</div>
                  </div>
                  <span className="rounded-full bg-white/12 px-3 py-1 text-xs text-white/80">
                    {account.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel-card rounded-[2rem] p-8">
        <div className="mb-8 space-y-2">
          <div className="text-sm font-semibold tracking-[0.22em] text-brand/60 uppercase">
            登录入口
          </div>
          <h2 className="text-3xl font-bold text-brand">进入教练端或学员端</h2>
          <p className="text-sm leading-7 text-muted">
            第一版采用预置账号登录，不接入短信、微信或复杂权限系统。
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-brand">
              账号
            </label>
            <input
              id="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 text-sm outline-none ring-0 transition focus:border-accent focus:bg-white"
              placeholder="请输入账号"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-brand">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 text-sm outline-none ring-0 transition focus:border-accent focus:bg-white"
              placeholder="请输入密码"
            />
          </div>

          {state.error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {state.error}
            </div>
          ) : null}

          <SubmitButton />
        </form>

        <div className="mt-8 rounded-[1.5rem] bg-info-soft p-4 text-sm leading-6 text-brand">
          <div className="font-semibold">这一版的登录假设</div>
          <p className="mt-1 text-brand/78">
            教练与学员账号在同一套系统里分角色登录，登录后会自动跳转到各自独立端口。
          </p>
        </div>
      </section>
    </div>
  );
}
