import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: varchar("password", { length: 100 }).notNull(),
  referralCode: varchar("referral_code", { length: 6 }).notNull().unique(),
  questionsAvailable: integer("questions_available").notNull().default(3),
  questionsCompleted: integer("questions_completed").notNull().default(0),
  abGroup: varchar("ab_group", { length: 10 }).notNull().default("A"),
  totalScore: real("total_score").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionText: text("question_text").notNull(),
  nearest_text: text("nearest_text").notNull(),
  chapter: text("nearest_chapter").notNull(),
  section: text("nearest_section").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  tip: text("tip"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const marketingConfig = pgTable("marketing_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageType: text("message_type").notNull(),
  content: text("content").notNull(),
  abGroup: varchar("ab_group", { length: 10 }).notNull(),
});

export const appConfig = pgTable("app_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull(),
  value: integer("value").notNull(),
  abGroup: varchar("ab_group", { length: 10 }).notNull().default("A"),
});

export const userAnswers = pgTable("user_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  questionId: varchar("question_id").notNull().references(() => questions.id),
  answer: text("answer").notNull(),
  score: real("score").notNull(),
  feedback: json("feedback").$type<{
    positiveComment: string;
    improvementComment: string;
    structureScore: number;
    contentScore: number;
    communicationScore: number;
  }>().notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  referredEmail: text("referred_email").notNull(),
  bonusGiven: boolean("bonus_given").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  password: true,
  referralCode: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

export const insertUserAnswerSchema = createInsertSchema(userAnswers).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertMarketingConfigSchema = createInsertSchema(marketingConfig).omit({
  id: true,
});

export const insertAppConfigSchema = createInsertSchema(appConfig).omit({
  id: true,
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(20), // Support 6-20 character passwords
});

export const registerSchema = z.object({
  email: z.string().email(),
  referralCode: z.string().length(6).optional(),
});

export const submitAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.string().min(10),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type UserAnswer = typeof userAnswers.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type MarketingConfig = typeof marketingConfig.$inferSelect;
export type AppConfig = typeof appConfig.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type SubmitAnswerRequest = z.infer<typeof submitAnswerSchema>;
