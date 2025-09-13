import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  users, 
  questions, 
  userAnswers, 
  referrals, 
  marketingConfig, 
  appConfig,
  type User, 
  type Question, 
  type UserAnswer, 
  type Referral,
  type MarketingConfig,
  type AppConfig,
  type InsertUser,
  type RegisterRequest,
  type SubmitAnswerRequest
} from "@shared/schema";
import { eq, sql, and, desc } from "drizzle-orm";
import { generateRandomCode, assignABGroup } from "./services/utils";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

export interface IStorage {
  // User management
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(userData: RegisterRequest): Promise<User>;
  updateUserQuestions(userId: string, questionsToAdd: number): Promise<void>;
  updateUserScore(userId: string, newScore: number): Promise<void>;
  incrementCompletedQuestions(userId: string): Promise<void>;
  
  // Questions
  getRandomQuestion(excludeIds?: string[]): Promise<Question | undefined>;
  getQuestionById(id: string): Promise<Question | undefined>;
  
  // User answers
  saveUserAnswer(answerData: {
    userId: string;
    questionId: string;
    answer: string;
    score: number;
    feedback: any;
  }): Promise<UserAnswer>;
  getUserAnswers(userId: string): Promise<UserAnswer[]>;
  
  // Referrals
  processReferral(referrerCode: string, newUserEmail: string): Promise<{ success: boolean; message: string }>;
  getReferralStats(userId: string): Promise<{ totalReferrals: number; questionsEarned: number }>;
  
  // Configuration
  getMarketingConfig(abGroup: string): Promise<MarketingConfig[]>;
  getAppConfig(key: string, abGroup: string): Promise<number>;
  
  // Analytics
  getUserProgress(userId: string): Promise<{
    questionsCompleted: number;
    questionsAvailable: number;
    averageScore: number;
    totalScore: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async createUser(userData: RegisterRequest): Promise<User> {
    const password = generateRandomCode(6);
    let referralCode = generateRandomCode(6);
    
    // Ensure unique referral code
    while (true) {
      const existing = await db.select().from(users).where(eq(users.referralCode, referralCode)).limit(1);
      if (existing.length === 0) break;
      referralCode = generateRandomCode(6);
    }

    const abGroup = assignABGroup();
    const initialQuestions = await this.getAppConfig("login_questions", abGroup);
    
    let questionsAvailable = 3; // Free questions
    
    // Process referral if provided
    if (userData.referralCode) {
      const referralResult = await this.processReferral(userData.referralCode, userData.email);
      if (referralResult.success) {
        const referralBonus = await this.getAppConfig("referral_bonus_new", abGroup);
        questionsAvailable += referralBonus;
      }
    }

    const newUser = {
      email: userData.email,
      password,
      referralCode,
      questionsAvailable: questionsAvailable + initialQuestions,
      abGroup,
    };

    const result = await db.insert(users).values(newUser).returning();
    return result[0];
  }

  async updateUserQuestions(userId: string, questionsToAdd: number): Promise<void> {
    await db.update(users)
      .set({ 
        questionsAvailable: sql`${users.questionsAvailable} + ${questionsToAdd}` 
      })
      .where(eq(users.id, userId));
  }

  async updateUserScore(userId: string, newScore: number): Promise<void> {
    await db.update(users)
      .set({ 
        totalScore: sql`${users.totalScore} + ${newScore}` 
      })
      .where(eq(users.id, userId));
  }

  async incrementCompletedQuestions(userId: string): Promise<void> {
    await db.update(users)
      .set({ 
        questionsCompleted: sql`${users.questionsCompleted} + 1`,
        questionsAvailable: sql`${users.questionsAvailable} - 1`
      })
      .where(eq(users.id, userId));
  }

  async getRandomQuestion(excludeIds: string[] = []): Promise<Question | undefined> {
    let query = db.select().from(questions);
    
    if (excludeIds.length > 0) {
      query = query.where(sql`${questions.id} NOT IN (${excludeIds.map(id => `'${id}'`).join(',')})`);
    }
    
    const result = await query.orderBy(sql`RANDOM()`).limit(1);
    return result[0];
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const result = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
    return result[0];
  }

  async saveUserAnswer(answerData: {
    userId: string;
    questionId: string;
    answer: string;
    score: number;
    feedback: any;
  }): Promise<UserAnswer> {
    const result = await db.insert(userAnswers).values(answerData).returning();
    return result[0];
  }

  async getUserAnswers(userId: string): Promise<UserAnswer[]> {
    return await db.select().from(userAnswers)
      .where(eq(userAnswers.userId, userId))
      .orderBy(desc(userAnswers.createdAt));
  }

  async processReferral(referrerCode: string, newUserEmail: string): Promise<{ success: boolean; message: string }> {
    // Find referrer by code
    const referrer = await db.select().from(users).where(eq(users.referralCode, referrerCode)).limit(1);
    if (referrer.length === 0) {
      return { success: false, message: "Invalid referral code" };
    }

    // Check if this email was already referred
    const existingReferral = await db.select().from(referrals)
      .where(eq(referrals.referredEmail, newUserEmail)).limit(1);
    if (existingReferral.length > 0) {
      return { success: false, message: "This email has already been referred" };
    }

    // Create referral record
    await db.insert(referrals).values({
      referrerId: referrer[0].id,
      referredEmail: newUserEmail,
      bonusGiven: false,
    });

    // Give bonus questions to referrer
    const referrerBonus = await this.getAppConfig("referral_bonus_existing", referrer[0].abGroup);
    await this.updateUserQuestions(referrer[0].id, referrerBonus);

    // Mark bonus as given
    await db.update(referrals)
      .set({ bonusGiven: true })
      .where(and(
        eq(referrals.referrerId, referrer[0].id),
        eq(referrals.referredEmail, newUserEmail)
      ));

    return { success: true, message: "Referral processed successfully" };
  }

  async getReferralStats(userId: string): Promise<{ totalReferrals: number; questionsEarned: number }> {
    const referralCount = await db.select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(and(
        eq(referrals.referrerId, userId),
        eq(referrals.bonusGiven, true)
      ));

    const user = await this.getUserById(userId);
    const referralBonus = user ? await this.getAppConfig("referral_bonus_existing", user.abGroup) : 10;
    
    const totalReferrals = referralCount[0]?.count || 0;
    const questionsEarned = totalReferrals * referralBonus;

    return { totalReferrals, questionsEarned };
  }

  async getMarketingConfig(abGroup: string): Promise<MarketingConfig[]> {
    return await db.select().from(marketingConfig).where(eq(marketingConfig.abGroup, abGroup));
  }

  async getAppConfig(key: string, abGroup: string): Promise<number> {
    const result = await db.select().from(appConfig)
      .where(and(
        eq(appConfig.key, key),
        eq(appConfig.abGroup, abGroup)
      )).limit(1);
    
    if (result.length === 0) {
      // Fallback to default values
      const defaults: Record<string, number> = {
        free_questions: 3,
        login_questions: 10,
        referral_bonus_existing: 10,
        referral_bonus_new: 5,
      };
      return defaults[key] || 0;
    }
    
    return result[0].value;
  }

  async getUserProgress(userId: string): Promise<{
    questionsCompleted: number;
    questionsAvailable: number;
    averageScore: number;
    totalScore: number;
  }> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const answers = await this.getUserAnswers(userId);
    const averageScore = answers.length > 0 
      ? answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length 
      : 0;

    return {
      questionsCompleted: user.questionsCompleted,
      questionsAvailable: user.questionsAvailable,
      averageScore: Math.round(averageScore * 10) / 10,
      totalScore: user.totalScore,
    };
  }
}

export const storage = new DatabaseStorage();
