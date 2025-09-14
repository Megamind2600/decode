import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { evaluateAnswer } from "./services/gemini";
import { registerSchema, loginSchema, submitAnswerSchema } from "@shared/schema";
import { z } from "zod";
import * as bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const user = await storage.createUser(userData);
      const userWithRawPassword = user as any;
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          questionsAvailable: user.questionsAvailable,
          referralCode: user.referralCode 
        },
        password: userWithRawPassword.rawPassword // Return only raw password, never hashed
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          questionsAvailable: user.questionsAvailable,
          questionsCompleted: user.questionsCompleted,
          referralCode: user.referralCode,
          abGroup: user.abGroup
        } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Questions routes
  app.get("/api/questions/random", async (req, res) => {
    try {
      const excludeIds = req.query.exclude ? (req.query.exclude as string).split(',') : [];
      const question = await storage.getRandomQuestion(excludeIds);
      
      if (!question) {
        return res.status(404).json({ message: "No questions available" });
      }

      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  app.post("/api/questions/submit", async (req, res) => {
    try {
      const { questionId, answer } = submitAnswerSchema.parse(req.body);
      const userId = req.body.userId; // In a real app, this would come from auth middleware
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      // Check if user has questions available
      const user = await storage.getUserById(userId);
      if (!user || user.questionsAvailable <= 0) {
        return res.status(400).json({ message: "No questions available" });
      }

      // Get the question
      const question = await storage.getQuestionById(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Evaluate answer with Gemini
      const evaluation = await evaluateAnswer(question.questionText, answer, question.nearest_text);

      // Save the answer
      const userAnswer = await storage.saveUserAnswer({
        userId,
        questionId,
        answer,
        score: evaluation.score,
        feedback: {
          positiveComment: evaluation.positiveComment,
          improvementComment: evaluation.improvementComment,
          structureScore: evaluation.structureScore,
          contentScore: evaluation.contentScore,
          communicationScore: evaluation.communicationScore,
        },
      });

      // Update user stats
      await storage.incrementCompletedQuestions(userId);
      await storage.updateUserScore(userId, evaluation.score);

      res.json({
        evaluation,
        userAnswer,
        questionsRemaining: user.questionsAvailable - 1,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Submit answer error:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  // User progress routes
  app.get("/api/user/:userId/progress", async (req, res) => {
    try {
      const { userId } = req.params;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.get("/api/user/:userId/answers", async (req, res) => {
    try {
      const { userId } = req.params;
      const answers = await storage.getUserAnswers(userId);
      res.json(answers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch answers" });
    }
  });

  // Referral routes
  app.get("/api/user/:userId/referrals", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getReferralStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  // Marketing configuration routes
  app.get("/api/marketing/:abGroup", async (req, res) => {
    try {
      const { abGroup } = req.params;
      const config = await storage.getMarketingConfig(abGroup);
      
      const marketingData: Record<string, string> = {};
      config.forEach(item => {
        marketingData[item.messageType] = item.content;
      });
      
      res.json(marketingData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch marketing config" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
