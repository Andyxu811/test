import { StudentStatus, TrainingStage } from "@prisma/client";

export const COACH_HOME_PATH = "/coach/students";
export const STUDENT_HOME_PATH = "/student/home";

export const stageLabels: Record<TrainingStage, string> = {
  INTRO_ASSESSMENT: "入门评估期",
  FOREHAND_FOUNDATION: "基础正手建立期",
  FOREHAND_STABILITY: "正手稳定强化期",
  COMPREHENSIVE_UPGRADE: "综合提升期",
};

export const studentStatusLabels: Record<StudentStatus, string> = {
  ACTIVE: "进行中",
  PAUSED: "暂停训练",
  ARCHIVED: "已归档",
};

export const studentStatusTagStyles: Record<StudentStatus, string> = {
  ACTIVE: "bg-white/15 text-white",
  PAUSED: "bg-[var(--accent-red-soft)] text-[var(--coach-green)]",
  ARCHIVED: "bg-white/80 text-[var(--ink-700)]",
};

export const studentStageTone: Record<TrainingStage, string> = {
  INTRO_ASSESSMENT: "bg-[var(--accent-blue-soft)] text-[var(--ink-900)] border-[var(--border-soft)]",
  FOREHAND_FOUNDATION: "bg-[var(--accent-mint-soft)] text-[var(--ink-900)] border-[var(--border-soft)]",
  FOREHAND_STABILITY: "bg-[var(--accent-amber-soft)] text-[var(--ink-900)] border-[var(--border-soft)]",
  COMPREHENSIVE_UPGRADE: "bg-[#f2efe9] text-[var(--ink-900)] border-[var(--border-soft)]",
};
