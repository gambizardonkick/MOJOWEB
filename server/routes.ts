import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import {
  insertLeaderboardEntrySchema,
  insertLeaderboardSettingsSchema,
  insertLevelMilestoneSchema,
  insertChallengeSchema,
  insertFreeSpinsOfferSchema,
  insertUserSchema,
  insertGameHistorySchema,
  insertShopItemSchema,
  insertRedemptionSchema,
} from "@shared/schema";
import { HOUSE_EDGE } from "@shared/constants";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Leaderboard Entries
  app.get("/api/leaderboard/entries", async (_req, res) => {
    try {
      const entries = await storage.getLeaderboardEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard entries" });
    }
  });

  app.post("/api/leaderboard/entries", async (req, res) => {
    try {
      const data = insertLeaderboardEntrySchema.parse(req.body);
      const entry = await storage.createLeaderboardEntry(data);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid leaderboard entry data" });
    }
  });

  app.patch("/api/leaderboard/entries/:id", async (req, res) => {
    try {
      const entry = await storage.updateLeaderboardEntry(req.params.id, req.body);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to update leaderboard entry" });
    }
  });

  app.delete("/api/leaderboard/entries/:id", async (req, res) => {
    try {
      await storage.deleteLeaderboardEntry(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete leaderboard entry" });
    }
  });

  // Leaderboard Settings
  app.get("/api/leaderboard/settings", async (_req, res) => {
    try {
      const settings = await storage.getLeaderboardSettings();
      res.json(settings || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard settings" });
    }
  });

  app.post("/api/leaderboard/settings", async (req, res) => {
    try {
      const data = insertLeaderboardSettingsSchema.parse(req.body);
      const settings = await storage.upsertLeaderboardSettings(data);
      res.json(settings);
    } catch (error) {
      console.error("Leaderboard settings validation error:", error);
      res.status(400).json({ error: "Invalid leaderboard settings data", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Level Milestones
  app.get("/api/milestones", async (_req, res) => {
    try {
      const milestones = await storage.getLevelMilestones();
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch milestones" });
    }
  });

  app.post("/api/milestones", async (req, res) => {
    try {
      const data = insertLevelMilestoneSchema.parse(req.body);
      const milestone = await storage.createLevelMilestone(data);
      res.json(milestone);
    } catch (error) {
      res.status(400).json({ error: "Invalid milestone data" });
    }
  });

  app.patch("/api/milestones/:id", async (req, res) => {
    try {
      const milestone = await storage.updateLevelMilestone(req.params.id, req.body);
      res.json(milestone);
    } catch (error) {
      res.status(500).json({ error: "Failed to update milestone" });
    }
  });

  app.delete("/api/milestones/:id", async (req, res) => {
    try {
      await storage.deleteLevelMilestone(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete milestone" });
    }
  });

  // Challenges
  app.get("/api/challenges", async (_req, res) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });

  app.post("/api/challenges", async (req, res) => {
    try {
      const data = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(data);
      res.json(challenge);
    } catch (error) {
      res.status(400).json({ error: "Invalid challenge data" });
    }
  });

  app.patch("/api/challenges/:id", async (req, res) => {
    try {
      const challenge = await storage.updateChallenge(req.params.id, req.body);
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ error: "Failed to update challenge" });
    }
  });

  app.delete("/api/challenges/:id", async (req, res) => {
    try {
      await storage.deleteChallenge(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete challenge" });
    }
  });

  app.post("/api/challenges/:id/claim", async (req, res) => {
    try {
      const claimSchema = z.object({
        username: z.string().min(1, "Username is required"),
        discordUsername: z.string().min(1, "Discord username is required"),
      });
      
      const validation = claimSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      
      const { username, discordUsername } = validation.data;
      const challenge = await storage.claimChallenge(req.params.id, username, discordUsername);
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ error: "Failed to claim challenge" });
    }
  });

  app.post("/api/challenges/:id/approve", async (req, res) => {
    try {
      const challenge = await storage.approveClaim(req.params.id);
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve claim" });
    }
  });

  app.post("/api/challenges/:id/decline", async (req, res) => {
    try {
      const challenge = await storage.declineClaim(req.params.id);
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ error: "Failed to decline claim" });
    }
  });

  // Free Spins Offers
  app.get("/api/free-spins", async (_req, res) => {
    try {
      const offers = await storage.getFreeSpinsOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch free spins offers" });
    }
  });

  app.post("/api/free-spins", async (req, res) => {
    try {
      const data = insertFreeSpinsOfferSchema.parse(req.body);
      const offer = await storage.createFreeSpinsOffer(data);
      res.json(offer);
    } catch (error) {
      res.status(400).json({ error: "Invalid free spins offer data" });
    }
  });

  app.patch("/api/free-spins/:id", async (req, res) => {
    try {
      const offer = await storage.updateFreeSpinsOffer(req.params.id, req.body);
      res.json(offer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update free spins offer" });
    }
  });

  app.delete("/api/free-spins/:id", async (req, res) => {
    try {
      await storage.deleteFreeSpinsOffer(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete free spins offer" });
    }
  });

  // User Session Management
  app.post("/api/users/session", async (req, res) => {
    try {
      let sessionId = req.body.sessionId;
      
      if (!sessionId) {
        sessionId = randomBytes(32).toString('hex');
      }
      
      let user = await storage.getUserBySessionId(sessionId);
      
      if (!user) {
        user = await storage.createUser({
          sessionId,
          username: null,
          points: 0,
          kickUsername: null,
          kickUserId: null,
          discordUsername: null,
          discordUserId: null,
          gamdomUsername: null,
          lastLogin: new Date(),
        });
      } else {
        user = await storage.updateUser(user.id, {});
      }
      
      res.json({ user, sessionId });
    } catch (error) {
      console.error("Session creation error:", error);
      res.status(500).json({ error: "Failed to create or retrieve session" });
    }
  });

  app.get("/api/users/me", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        return res.status(401).json({ error: "No session ID provided" });
      }
      
      const user = await storage.getUserBySessionId(sessionId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Discord OAuth
  app.get("/api/auth/discord", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string || randomBytes(32).toString('hex');
      
      const baseAuthLink = process.env.DISCORD_AUTH_LINK;
      
      if (baseAuthLink) {
        const authUrl = `${baseAuthLink}&state=${sessionId}`;
        res.json({ authUrl, sessionId });
      } else {
        const { getDiscordAuthUrl } = await import("./discord");
        const protocol = req.get('x-forwarded-proto') || req.protocol;
        const redirectUri = `${protocol}://${req.get('host')}/api/auth/discord/callback`;
        const authUrl = await getDiscordAuthUrl(redirectUri, sessionId);
        res.json({ authUrl, sessionId });
      }
    } catch (error) {
      console.error("Discord auth URL error:", error);
      res.status(500).json({ error: "Failed to generate Discord auth URL" });
    }
  });

  app.get("/api/auth/discord/callback", async (req, res) => {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;
      
      if (!code || !state) {
        return res.redirect(`/?error=missing_params`);
      }
      
      const { exchangeCodeForToken, getDiscordUserInfo } = await import("./discord");
      
      let redirectUri: string;
      if (process.env.DISCORD_AUTH_LINK) {
        const url = new URL(process.env.DISCORD_AUTH_LINK);
        redirectUri = decodeURIComponent(url.searchParams.get('redirect_uri') || '');
      } else {
        const protocol = req.get('x-forwarded-proto') || req.protocol;
        redirectUri = `${protocol}://${req.get('host')}/api/auth/discord/callback`;
      }
      
      const tokenData = await exchangeCodeForToken(code, redirectUri);
      const discordUser = await getDiscordUserInfo(tokenData.access_token);
      
      // Check if user with this Discord ID already exists
      let user = await storage.getUserByDiscordId(discordUser.id);
      
      if (user) {
        // User exists - link this session to the existing account
        console.log(`Discord user ${discordUser.username} already exists, linking session ${state} to user ${user.id}`);
        
        // Update session mapping to point to this user
        const db = (storage as any).db;
        await db.ref(`sessionMappings/${state}`).set(user.id);
        
        // Update Discord tokens and last login
        user = await storage.updateUser(user.id, {
          discordAccessToken: tokenData.access_token,
          discordRefreshToken: tokenData.refresh_token,
          discordAvatar: discordUser.avatar,
          discordUsername: discordUser.username,
          lastLogin: new Date(),
        });
      } else {
        // Check if this session already has a user (shouldn't happen, but handle it)
        const existingUser = await storage.getUserBySessionId(state);
        
        if (existingUser) {
          // Update existing user with Discord info
          user = await storage.updateUser(existingUser.id, {
            discordUsername: discordUser.username,
            discordUserId: discordUser.id,
            discordAccessToken: tokenData.access_token,
            discordRefreshToken: tokenData.refresh_token,
            discordAvatar: discordUser.avatar,
            username: discordUser.username,
            lastLogin: new Date(),
          });
        } else {
          // Create new user
          console.log(`Creating new user for Discord user ${discordUser.username}`);
          user = await storage.createUser({
            sessionId: state,
            username: discordUser.username,
            points: 0,
            discordUsername: discordUser.username,
            discordUserId: discordUser.id,
            discordAccessToken: tokenData.access_token,
            discordRefreshToken: tokenData.refresh_token,
            discordAvatar: discordUser.avatar,
            kickUsername: null,
            kickUserId: null,
            kickAccessToken: null,
            kickRefreshToken: null,
            gamdomUsername: null,
            lastLogin: new Date(),
          });
        }
      }
      
      res.redirect(`/dashboard?login=success&sessionId=${state}`);
    } catch (error) {
      console.error("Discord OAuth error:", error);
      res.redirect(`/?error=discord_auth_failed`);
    }
  });

  // Kick OAuth  
  app.get("/api/auth/kick", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }
      
      const { getKickAuthUrl } = await import("./kick");
      const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/kick/callback`;
      const { url, codeVerifier } = getKickAuthUrl(redirectUri, sessionId);
      
      await storage.storeKickVerifier(sessionId, codeVerifier);
      
      res.json({ authUrl: url, codeVerifier });
    } catch (error) {
      console.error("Kick auth URL error:", error);
      res.status(500).json({ error: "Failed to generate Kick auth URL" });
    }
  });

  app.get("/api/auth/kick/callback", async (req, res) => {
    try {
      console.log('Kick callback - Full URL:', req.url);
      console.log('Kick callback - Query params:', req.query);
      
      const code = req.query.code as string;
      const state = req.query.state as string;
      const error = req.query.error as string;
      const errorDescription = req.query.error_description as string;
      
      console.log('Kick callback received:', { code: !!code, state: !!state, error, errorDescription });
      
      if (error) {
        console.error('Kick OAuth error:', error, errorDescription);
        return res.redirect(`/dashboard?error=kick_oauth_error&error_message=${encodeURIComponent(errorDescription || error)}`);
      }
      
      if (!code || !state) {
        console.error('Missing code or state in Kick callback');
        return res.redirect(`/dashboard?error=missing_params`);
      }
      
      const codeVerifier = await storage.getKickVerifier(state);
      if (!codeVerifier) {
        console.error('Code verifier not found for state:', state);
        return res.redirect(`/dashboard?error=verifier_not_found`);
      }
      
      const { exchangeKickCodeForToken, getKickUserInfo } = await import("./kick");
      const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/kick/callback`;
      
      console.log('Exchanging Kick code for token...');
      const tokenData = await exchangeKickCodeForToken(code, codeVerifier, redirectUri);
      
      const user = await storage.getUserBySessionId(state);
      if (!user) {
        console.error('User not found for sessionId:', state);
        return res.redirect(`/dashboard?error=user_not_found`);
      }
      
      // Check if user info is in the token response
      let kickUsername: string;
      let kickUserId: string;
      
      if (tokenData.user) {
        // User info is included in token response
        console.log('User info found in token response:', tokenData.user);
        kickUsername = tokenData.user.username || tokenData.user.slug;
        kickUserId = String(tokenData.user.id);
      } else {
        // Need to fetch user info separately
        console.log('Fetching Kick user info...');
        const kickUser = await getKickUserInfo(tokenData.access_token);
        console.log('Kick user info:', { name: kickUser.name, user_id: kickUser.user_id });
        kickUsername = kickUser.name;
        kickUserId = String(kickUser.user_id);
      }
      
      if (!kickUsername || !kickUserId) {
        console.error('Invalid Kick user data');
        return res.redirect(`/dashboard?error=invalid_kick_data&error_message=${encodeURIComponent('Unable to retrieve Kick username')}`);
      }
      
      // Check if this Kick username is already linked to another user
      const existingKickUser = await storage.getUserByKickUsername(kickUsername);
      if (existingKickUser && existingKickUser.id !== user.id) {
        console.error(`Kick username ${kickUsername} is already linked to user ${existingKickUser.id}`);
        return res.redirect(`/dashboard?linked=kick&success=false&error_message=${encodeURIComponent('This Kick account is already linked to another user')}`);
      }
      
      console.log('Updating user with Kick info:', { userId: user.id, kickUsername, kickUserId });
      await storage.updateUser(user.id, {
        kickUsername,
        kickUserId,
        kickAccessToken: tokenData.access_token,
        kickRefreshToken: tokenData.refresh_token,
      });
      
      await storage.deleteKickVerifier(state);
      
      console.log('Kick OAuth successful for user:', user.id);
      res.redirect(`/dashboard?linked=kick&success=true`);
    } catch (error) {
      console.error("Kick OAuth error:", error);
      res.redirect(`/dashboard?linked=kick&success=false&error_message=${encodeURIComponent(String(error))}`);
    }
  });

  // Manual Account Linking
  app.post("/api/users/:id/link-gamdom", async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }
      
      // Check if this Gamdom username is already linked to another user
      const existingUser = await storage.getUserByGamdomUsername(username);
      if (existingUser && existingUser.id !== req.params.id) {
        return res.status(409).json({ error: "This Gamdom username is already linked to another account" });
      }
      
      const user = await storage.updateUser(req.params.id, {
        gamdomUsername: username,
      });
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to link Gamdom account" });
    }
  });

  app.post("/api/users/:id/link-kick", async (req, res) => {
    try {
      const { username, userId } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }
      
      const user = await storage.updateUser(req.params.id, {
        kickUsername: username,
        kickUserId: userId || null,
      });
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to link Kick account" });
    }
  });

  app.post("/api/users/:id/link-discord", async (req, res) => {
    try {
      const { username, userId } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }
      
      const user = await storage.updateUser(req.params.id, {
        discordUsername: username,
        discordUserId: userId || null,
      });
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to link Discord account" });
    }
  });

  // Points Management
  app.get("/api/users", async (_req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id/points", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ points: user.points });
    } catch (error) {
      console.error("Points fetch error:", error);
      res.status(500).json({ error: "Failed to fetch points" });
    }
  });

  app.post("/api/users/:id/points", async (req, res) => {
    try {
      const { points, action } = req.body;
      const pointsSchema = z.object({
        points: z.number().nonnegative(),
        action: z.enum(['add', 'remove', 'set']),
      });
      
      const validation = pointsSchema.safeParse({ points, action });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      
      if (points <= 0 && (action === 'add' || action === 'remove')) {
        return res.status(400).json({ error: 'Points must be greater than 0 for add/remove actions' });
      }
      
      let user;
      if (action === 'add') {
        user = await storage.addPoints(req.params.id, points);
      } else if (action === 'remove') {
        user = await storage.deductPoints(req.params.id, points);
      } else {
        user = await storage.setPoints(req.params.id, points);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Points update error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to update points" });
    }
  });

  // Game History
  app.get("/api/games/history/:userId", async (req, res) => {
    try {
      const history = await storage.getGameHistory(req.params.userId);
      res.json(history);
    } catch (error) {
      console.error("Game history error:", error);
      res.status(500).json({ error: "Failed to fetch game history" });
    }
  });

  // Game Logic - Dice (0-100 range)
  app.post("/api/games/dice/play", async (req, res) => {
    try {
      const gameSchema = z.object({
        userId: z.string(),
        betAmount: z.number().positive(),
        targetNumber: z.number().min(0).max(100),
        direction: z.enum(['under', 'over']),
      });
      
      const validation = gameSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      
      const { userId, betAmount, targetNumber, direction } = validation.data;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (user.points < betAmount) {
        return res.status(400).json({ error: "Insufficient points" });
      }
      
      await storage.deductPoints(userId, betAmount);
      
      const roll = Math.random() * 100;
      
      const won = direction === 'under' ? roll < targetNumber : roll > targetNumber;
      let payout = 0;
      let multiplier = 0;
      
      if (won) {
        if (direction === 'under') {
          multiplier = targetNumber > 0 ? (100 / targetNumber) * 0.99 : 0;
        } else {
          multiplier = (100 - targetNumber) > 0 ? (100 / (100 - targetNumber)) * 0.99 : 0;
        }
        payout = Math.floor(betAmount * multiplier);
        await storage.addPoints(userId, payout);
      }
      
      const gameData = JSON.stringify({ roll, targetNumber, direction, multiplier });
      await storage.createGameHistory({
        userId,
        gameName: 'dice',
        betAmount,
        payout,
        result: won ? 'win' : 'loss',
        gameData,
      });
      
      const updatedUser = await storage.getUser(userId);
      
      res.json({
        won,
        roll,
        result: won ? 'win' : 'lose',
        payout,
        newBalance: updatedUser?.points || 0,
      });
    } catch (error) {
      console.error("Dice game error:", error);
      res.status(500).json({ error: "Failed to play dice game" });
    }
  });

  // Game Logic - Limbo
  app.post("/api/games/limbo/play", async (req, res) => {
    try {
      const gameSchema = z.object({
        userId: z.string(),
        betAmount: z.number().positive(),
        targetMultiplier: z.number().min(1.01).max(1000),
      });
      
      const validation = gameSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      
      const { userId, betAmount, targetMultiplier } = validation.data;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (user.points < betAmount) {
        return res.status(400).json({ error: "Insufficient points" });
      }
      
      await storage.deductPoints(userId, betAmount);
      
      const crashPoint = Math.max(1, Math.floor(Math.random() * 1000) / 100);
      const won = crashPoint >= targetMultiplier;
      let payout = 0;
      
      if (won) {
        payout = Math.floor(betAmount * targetMultiplier * (1 - HOUSE_EDGE));
        await storage.addPoints(userId, payout);
      }
      
      const gameData = JSON.stringify({ crashPoint, targetMultiplier });
      await storage.createGameHistory({
        userId,
        gameName: 'limbo',
        betAmount,
        payout,
        result: won ? 'win' : 'loss',
        gameData,
      });
      
      const updatedUser = await storage.getUser(userId);
      
      res.json({
        won,
        crashPoint,
        payout,
        newBalance: updatedUser?.points || 0,
      });
    } catch (error) {
      console.error("Limbo game error:", error);
      res.status(500).json({ error: "Failed to play limbo game" });
    }
  });

  // Game Logic - Mines (simplified version)
  app.post("/api/games/mines/play", async (req, res) => {
    try {
      const gameSchema = z.object({
        userId: z.string(),
        betAmount: z.number().positive(),
        mines: z.number().min(1).max(24),
        revealed: z.number().min(1).max(24),
      });
      
      const validation = gameSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      
      const { userId, betAmount, mines, revealed } = validation.data;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (user.points < betAmount) {
        return res.status(400).json({ error: "Insufficient points" });
      }
      
      await storage.deductPoints(userId, betAmount);
      
      const totalTiles = 25;
      const safeTiles = totalTiles - mines;
      const hitMine = Math.random() < (mines / safeTiles);
      
      let payout = 0;
      if (!hitMine) {
        const multiplier = Math.pow(totalTiles / safeTiles, revealed / totalTiles) * 0.95;
        payout = Math.floor(betAmount * multiplier);
        await storage.addPoints(userId, payout);
      }
      
      const gameData = JSON.stringify({ mines, revealed, hitMine });
      await storage.createGameHistory({
        userId,
        gameName: 'mines',
        betAmount,
        payout,
        result: hitMine ? 'loss' : 'win',
        gameData,
      });
      
      const updatedUser = await storage.getUser(userId);
      
      res.json({
        won: !hitMine,
        hitMine,
        payout,
        newBalance: updatedUser?.points || 0,
      });
    } catch (error) {
      console.error("Mines game error:", error);
      res.status(500).json({ error: "Failed to play mines game" });
    }
  });

  // Game Logic - Blackjack (simplified version)
  app.post("/api/games/blackjack/play", async (req, res) => {
    try {
      const gameSchema = z.object({
        userId: z.string(),
        betAmount: z.number().positive(),
      });
      
      const validation = gameSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      
      const { userId, betAmount } = validation.data;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (user.points < betAmount) {
        return res.status(400).json({ error: "Insufficient points" });
      }
      
      await storage.deductPoints(userId, betAmount);
      
      const drawCard = () => Math.min(Math.floor(Math.random() * 13) + 1, 10);
      const calculateTotal = (cards: number[]) => {
        let total = cards.reduce((sum, card) => sum + card, 0);
        const aces = cards.filter(c => c === 1).length;
        for (let i = 0; i < aces; i++) {
          if (total + 10 <= 21) total += 10;
        }
        return total;
      };
      
      const playerCards = [drawCard(), drawCard()];
      const dealerCards = [drawCard(), drawCard()];
      
      let playerTotal = calculateTotal(playerCards);
      let dealerTotal = calculateTotal(dealerCards);
      
      while (dealerTotal < 17) {
        dealerCards.push(drawCard());
        dealerTotal = calculateTotal(dealerCards);
      }
      
      let won = false;
      let isPush = false;
      let payout = 0;
      
      if (playerTotal === 21 && playerCards.length === 2) {
        payout = Math.floor(betAmount * 2.5);
        won = true;
      } else if (playerTotal > 21) {
        won = false;
      } else if (dealerTotal > 21) {
        payout = betAmount * 2;
        won = true;
      } else if (playerTotal > dealerTotal) {
        payout = betAmount * 2;
        won = true;
      } else if (playerTotal === dealerTotal) {
        payout = betAmount;
        isPush = true;
        won = true;
      }
      
      if (payout > 0) {
        await storage.addPoints(userId, payout);
      }
      
      const gameData = JSON.stringify({ playerCards, dealerCards, playerTotal, dealerTotal, isPush });
      await storage.createGameHistory({
        userId,
        gameName: 'blackjack',
        betAmount,
        payout,
        result: won ? 'win' : 'loss',
        gameData,
      });
      
      const updatedUser = await storage.getUser(userId);
      
      res.json({
        won,
        isPush,
        playerCards,
        dealerCards,
        playerTotal,
        dealerTotal,
        payout,
        newBalance: updatedUser?.points || 0,
      });
    } catch (error) {
      console.error("Blackjack game error:", error);
      res.status(500).json({ error: "Failed to play blackjack game" });
    }
  });

  // Game Logic - Keno
  app.post("/api/games/keno/play", async (req, res) => {
    try {
      const gameSchema = z.object({
        userId: z.string(),
        betAmount: z.number().positive(),
        selectedNumbers: z.array(z.number().min(1).max(40)).min(1).max(10),
        risk: z.enum(['low', 'medium', 'high']),
      });
      
      const validation = gameSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      
      const { userId, betAmount, selectedNumbers, risk } = validation.data;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (user.points < betAmount) {
        return res.status(400).json({ error: "Insufficient points" });
      }
      
      await storage.deductPoints(userId, betAmount);
      
      const drawnNumbers: number[] = [];
      while (drawnNumbers.length < 10) {
        const num = Math.floor(Math.random() * 40) + 1;
        if (!drawnNumbers.includes(num)) {
          drawnNumbers.push(num);
        }
      }
      
      const hits = selectedNumbers.filter(num => drawnNumbers.includes(num)).length;
      
      const payoutTable: Record<string, Record<number, number>> = {
        low: { 0: 0, 1: 0, 2: 1, 3: 2, 4: 4, 5: 8, 6: 12, 7: 20, 8: 40, 9: 80, 10: 150 },
        medium: { 0: 0, 1: 0, 2: 0, 3: 1, 4: 3, 5: 6, 6: 15, 7: 35, 8: 75, 9: 150, 10: 300 },
        high: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 2, 5: 5, 6: 20, 7: 50, 8: 120, 9: 250, 10: 500 },
      };
      
      const multiplier = payoutTable[risk][Math.min(hits, selectedNumbers.length)] || 0;
      const payout = Math.floor(betAmount * multiplier);
      const won = payout > 0;
      
      if (payout > 0) {
        await storage.addPoints(userId, payout);
      }
      
      const gameData = JSON.stringify({ selectedNumbers, drawnNumbers, hits, risk, multiplier });
      await storage.createGameHistory({
        userId,
        gameName: 'keno',
        betAmount,
        payout,
        result: won ? 'win' : 'loss',
        gameData,
      });
      
      const updatedUser = await storage.getUser(userId);
      
      res.json({
        won,
        drawnNumbers,
        hits,
        multiplier,
        payout,
        newBalance: updatedUser?.points || 0,
      });
    } catch (error) {
      console.error("Keno game error:", error);
      res.status(500).json({ error: "Failed to play keno game" });
    }
  });

  // Shop Items
  app.get("/api/shop/items", async (_req, res) => {
    try {
      const items = await storage.getShopItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shop items" });
    }
  });

  app.post("/api/shop/items", async (req, res) => {
    try {
      const data = insertShopItemSchema.parse(req.body);
      const item = await storage.createShopItem(data);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid shop item data" });
    }
  });

  app.patch("/api/shop/items/:id", async (req, res) => {
    try {
      const item = await storage.updateShopItem(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update shop item" });
    }
  });

  app.delete("/api/shop/items/:id", async (req, res) => {
    try {
      await storage.deleteShopItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete shop item" });
    }
  });

  // Redemptions
  app.get("/api/shop/redemptions", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const redemptions = await storage.getRedemptions(userId);
      res.json(redemptions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch redemptions" });
    }
  });

  app.post("/api/shop/redeem", async (req, res) => {
    try {
      const redeemSchema = z.object({
        userId: z.string(),
        shopItemId: z.string(),
      });
      
      const validation = redeemSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      
      const { userId, shopItemId } = validation.data;
      
      const user = await storage.getUser(userId);
      const item = await storage.getShopItem(shopItemId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (!item) {
        return res.status(404).json({ error: "Shop item not found" });
      }
      
      if (!item.isActive) {
        return res.status(400).json({ error: "This item is no longer available" });
      }
      
      if (item.stock === 0) {
        return res.status(400).json({ error: "This item is out of stock" });
      }
      
      if (user.points < item.pointsCost) {
        return res.status(400).json({ error: "Insufficient points" });
      }
      
      await storage.deductPoints(userId, item.pointsCost);
      
      if (item.stock > 0) {
        await storage.updateShopItem(shopItemId, {
          stock: item.stock - 1,
        });
      }
      
      const redemption = await storage.createRedemption({
        userId,
        shopItemId,
        pointsSpent: item.pointsCost,
        status: 'pending',
      });
      
      const updatedUser = await storage.getUser(userId);
      
      res.json({
        redemption,
        newBalance: updatedUser?.points || 0,
      });
    } catch (error) {
      console.error("Redemption error:", error);
      res.status(500).json({ error: "Failed to redeem item" });
    }
  });

  app.patch("/api/shop/redemptions/:id", async (req, res) => {
    try {
      const redemption = await storage.updateRedemption(req.params.id, req.body);
      res.json(redemption);
    } catch (error) {
      res.status(500).json({ error: "Failed to update redemption" });
    }
  });

  app.post("/api/shop/redemptions/:id/approve", async (req, res) => {
    try {
      const redemption = await storage.updateRedemption(req.params.id, { status: 'approved' });
      res.json(redemption);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve redemption" });
    }
  });

  app.post("/api/shop/redemptions/:id/decline", async (req, res) => {
    try {
      const redemption = await storage.getRedemptions();
      const currentRedemption = redemption.find(r => r.id === req.params.id);
      
      if (!currentRedemption) {
        return res.status(404).json({ error: "Redemption not found" });
      }

      if (currentRedemption.status === 'pending') {
        await storage.addPoints(currentRedemption.userId, currentRedemption.pointsSpent);
      }
      
      const updatedRedemption = await storage.updateRedemption(req.params.id, { status: 'declined' });
      res.json(updatedRedemption);
    } catch (error) {
      console.error("Decline redemption error:", error);
      res.status(500).json({ error: "Failed to decline redemption" });
    }
  });

  // Server time endpoint for accurate countdown timers
  app.get("/api/time", (_req, res) => {
    res.json({ timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
