import { createHash } from "node:crypto";

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

function resolveDatabaseUrl() {
  return process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
}

const databaseUrl = resolveDatabaseUrl();

if (!databaseUrl) {
  throw new Error(
    "缺少 Postgres 连接。请先配置 DATABASE_URL 或 POSTGRES_PRISMA_URL 后再执行 seed。",
  );
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

function hashPassword(password) {
  return createHash("sha256").update(`tennis-growth-panel:${password}`).digest("hex");
}

async function main() {
  await prisma.trainingPhoto.deleteMany();
  await prisma.trainingRecord.deleteMany();
  await prisma.student.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.user.deleteMany();

  const coachLi = await prisma.user.create({
    data: {
      role: "COACH",
      name: "李教练",
      email: "coach.li@tennis.local",
      passwordHash: hashPassword("coach123"),
      coach: { create: { displayName: "李教练" } },
    },
  });

  const coachWang = await prisma.user.create({
    data: {
      role: "COACH",
      name: "王教练",
      email: "coach.wang@tennis.local",
      passwordHash: hashPassword("coach123"),
      coach: { create: { displayName: "王教练" } },
    },
  });

  const studentUsers = await Promise.all([
    prisma.user.create({
      data: {
        role: "STUDENT",
        name: "王小明",
        email: "student.wxm@tennis.local",
        passwordHash: hashPassword("student123"),
      },
    }),
    prisma.user.create({
      data: {
        role: "STUDENT",
        name: "张晓雨",
        email: "student.zxy@tennis.local",
        passwordHash: hashPassword("student123"),
      },
    }),
    prisma.user.create({
      data: {
        role: "STUDENT",
        name: "陈浩然",
        email: "student.chen@tennis.local",
        passwordHash: hashPassword("student123"),
      },
    }),
    prisma.user.create({
      data: {
        role: "STUDENT",
        name: "刘思琪",
        email: "student.liu@tennis.local",
        passwordHash: hashPassword("student123"),
      },
    }),
    prisma.user.create({
      data: {
        role: "STUDENT",
        name: "周建国",
        email: "student.zhou@tennis.local",
        passwordHash: hashPassword("student123"),
      },
    }),
  ]);

  const students = await Promise.all([
    prisma.student.create({
      data: {
        userId: studentUsers[0].id,
        primaryCoachId: coachLi.id,
        name: "王小明",
        nickname: "小明",
        age: 8,
        gender: "男",
        ageGroup: "8-10岁",
        trainingGoal: "建立稳定正手动作",
        startedAt: new Date("2025-10-05"),
        stage: "FOREHAND_STABILITY",
        stageStartedAt: new Date("2026-02-16"),
        status: "ACTIVE",
      },
    }),
    prisma.student.create({
      data: {
        userId: studentUsers[1].id,
        primaryCoachId: coachLi.id,
        name: "张晓雨",
        nickname: "雨雨",
        age: 9,
        gender: "女",
        ageGroup: "8-10岁",
        trainingGoal: "建立基础正手与启动意识",
        notes: "对节奏感反应好，适合多做脚步训练。",
        startedAt: new Date("2026-01-12"),
        stage: "FOREHAND_FOUNDATION",
        stageStartedAt: new Date("2026-01-12"),
        status: "ACTIVE",
      },
    }),
    prisma.student.create({
      data: {
        userId: studentUsers[2].id,
        primaryCoachId: coachWang.id,
        name: "陈浩然",
        age: 13,
        gender: "男",
        ageGroup: "12-15岁",
        trainingGoal: "提升比赛中的稳定对拉",
        startedAt: new Date("2025-05-20"),
        stage: "COMPREHENSIVE_UPGRADE",
        stageStartedAt: new Date("2026-03-10"),
        status: "PAUSED",
      },
    }),
    prisma.student.create({
      data: {
        userId: studentUsers[3].id,
        primaryCoachId: coachLi.id,
        name: "刘思琪",
        age: 7,
        gender: "女",
        ageGroup: "6-8岁",
        trainingGoal: "建立启蒙期击球感觉",
        startedAt: new Date("2026-02-18"),
        stage: "INTRO_ASSESSMENT",
        stageStartedAt: new Date("2026-02-18"),
        status: "ACTIVE",
      },
    }),
    prisma.student.create({
      data: {
        userId: studentUsers[4].id,
        primaryCoachId: coachWang.id,
        name: "周建国",
        age: 12,
        gender: "男",
        ageGroup: "12-15岁",
        trainingGoal: "恢复训练节奏",
        notes: "近期学业较忙，训练频率下降。",
        startedAt: new Date("2025-06-12"),
        stage: "FOREHAND_STABILITY",
        stageStartedAt: new Date("2025-12-20"),
        status: "ARCHIVED",
        archivedAt: new Date("2026-03-01"),
      },
    }),
  ]);

  const records = await Promise.all([
    prisma.trainingRecord.create({
      data: {
        studentId: students[0].id,
        coachId: coachLi.id,
        sessionDate: new Date("2026-03-29"),
        sessionIndex: 12,
        title: "正手引拍 + 分腿垫步 + 盯球训练",
        trainedToday: "正手引拍动作\n分腿垫步启动\n盯球专注力",
        highlights: "左右手一起完成引拍\n分腿垫步更充分\n看球更专注",
        improvements: "击球后太快收拍\n右脚没有踩实\n送球不够往前",
        nextFocus: "右脚踩实再击球\n击球后往前送\n击球点前移",
        homework: "对镜完成 10 组正手引拍\n每组开始前先做分腿垫步\n击球后随挥停住 2 秒感受动作",
        coachComment:
          "小明这节课表现不错，引拍动作有了明显进步。接下来重点要把下盘支撑和随挥动作做完整，击球质量会更稳定。",
        status: "PUBLISHED",
        publishedAt: new Date("2026-03-29T18:20:00"),
      },
    }),
    prisma.trainingRecord.create({
      data: {
        studentId: students[1].id,
        coachId: coachLi.id,
        sessionDate: new Date("2026-03-22"),
        sessionIndex: 5,
        title: "基础正手建立 + 启动步伐",
        trainedToday: "基础正手挥拍路径\n分腿启动练习",
        highlights: "挥拍节奏更完整\n更敢主动启动",
        improvements: "准备姿势保持不够稳定\n击球点偶尔偏后",
        nextFocus: "保持准备姿势稳定\n提前完成引拍",
        homework: "每天原地挥拍 20 次\n练习启动时先分腿再移动",
        coachComment:
          "雨雨对节奏很敏感，这节课的动作完整度比上次更好。继续加强启动时机判断，会进步很快。",
        status: "PUBLISHED",
        publishedAt: new Date("2026-03-22T17:00:00"),
      },
    }),
    prisma.trainingRecord.create({
      data: {
        studentId: students[1].id,
        coachId: coachLi.id,
        sessionDate: new Date("2026-04-01"),
        sessionIndex: 6,
        title: "正手稳定性强化",
        trainedToday: "正手引拍和击球点练习",
        highlights: "启动意识更积极",
        improvements: "拍面控制还不稳定",
        nextFocus: "提前准备并稳定拍面",
        homework: "回家复习拍面朝向控制",
        coachComment: "这是一条未发布草稿，用于演示继续编辑。",
        status: "DRAFT",
      },
    }),
    prisma.trainingRecord.create({
      data: {
        studentId: students[2].id,
        coachId: coachWang.id,
        sessionDate: new Date("2026-03-25"),
        sessionIndex: 24,
        title: "对拉节奏与击球深度",
        trainedToday: "中场对拉稳定性\n击球深度控制",
        highlights: "连续对拉回合增加\n击球深度更稳定",
        improvements: "反拍转换略慢\n落点变化不够主动",
        nextFocus: "增加落点变化\n提升反拍衔接速度",
        homework: "完成 3 组多球节奏脚步练习",
        coachComment: "整体实战能力在持续提升，下一步要更主动地制造变化。",
        status: "PUBLISHED",
        publishedAt: new Date("2026-03-25T19:10:00"),
      },
    }),
    prisma.trainingRecord.create({
      data: {
        studentId: students[3].id,
        coachId: coachLi.id,
        sessionDate: new Date("2026-03-22"),
        sessionIndex: 3,
        title: "入门挥拍与盯球启蒙",
        trainedToday: "挥拍动作启蒙\n盯球小游戏",
        highlights: "愿意主动挥拍\n对盯球游戏很投入",
        improvements: "准备姿势需要提醒\n脚步停顿偏多",
        nextFocus: "养成准备姿势习惯\n边移动边盯球",
        homework: "每天做 5 次准备姿势 + 盯球小游戏",
        coachComment: "思琪参与感很好，启蒙阶段先把兴趣和节奏建立起来。",
        status: "PUBLISHED",
        publishedAt: new Date("2026-03-22T16:30:00"),
      },
    }),
    prisma.trainingRecord.create({
      data: {
        studentId: students[4].id,
        coachId: coachWang.id,
        sessionDate: new Date("2026-02-28"),
        sessionIndex: 18,
        title: "恢复期正手稳定训练",
        trainedToday: "正手击球节奏恢复\n基本脚步找回",
        highlights: "击球节奏逐步回暖",
        improvements: "耐力状态不足\n专注度波动较大",
        nextFocus: "恢复连续击球耐力\n固定训练频率",
        homework: "先恢复每周两次基础挥拍",
        coachComment: "先把训练节奏找回来，不急于加量。",
        status: "PUBLISHED",
        publishedAt: new Date("2026-02-28T18:00:00"),
      },
    }),
  ]);

  await prisma.trainingPhoto.createMany({
    data: [
      {
        recordId: records[0].id,
        url: "/demo-photos/wxm-before.svg",
        usage: "COMPARE",
        compareGroupId: "main",
        compareSide: "BEFORE",
        sortOrder: 0,
      },
      {
        recordId: records[0].id,
        url: "/demo-photos/wxm-after.svg",
        usage: "COMPARE",
        compareGroupId: "main",
        compareSide: "AFTER",
        sortOrder: 1,
      },
      {
        recordId: records[0].id,
        url: "/demo-photos/wxm-moment-1.svg",
        usage: "MOMENT",
        focusLabel: "分腿垫步",
        sortOrder: 2,
      },
      {
        recordId: records[0].id,
        url: "/demo-photos/wxm-moment-2.svg",
        usage: "MOMENT",
        focusLabel: "盯球专注",
        sortOrder: 3,
      },
    ],
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
