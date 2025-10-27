import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Leaderboard entries
export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rank: integer("rank").notNull(),
  username: text("username").notNull(),
  wagered: decimal("wagered", { precision: 15, scale: 2 }).notNull(),
  prize: decimal("prize", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({
  id: true,
  createdAt: true,
});

export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;

// Leaderboard settings
export const leaderboardSettings = pgTable("leaderboard_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalPrizePool: decimal("total_prize_pool", { precision: 15, scale: 2 }).notNull(),
  endDate: timestamp("end_date").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeaderboardSettingsSchema = createInsertSchema(leaderboardSettings, {
  endDate: z.coerce.date(),
}).omit({
  id: true,
  updatedAt: true,
});

export type InsertLeaderboardSettings = z.infer<typeof insertLeaderboardSettingsSchema>;
export type LeaderboardSettings = typeof leaderboardSettings.$inferSelect;

// Level milestones
export const levelMilestones = pgTable("level_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // e.g., "Bronze 1", "Silver 2"
  tier: integer("tier").notNull(), // 1-24 for ordering
  imageUrl: text("image_url").notNull(),
  rewards: text("rewards").array().notNull(), // Array of reward descriptions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLevelMilestoneSchema = createInsertSchema(levelMilestones).omit({
  id: true,
  createdAt: true,
});

export type InsertLevelMilestone = z.infer<typeof insertLevelMilestoneSchema>;
export type LevelMilestone = typeof levelMilestones.$inferSelect;

// Challenges
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameName: text("game_name").notNull(),
  gameImage: text("game_image").notNull(),
  minMultiplier: decimal("min_multiplier", { precision: 10, scale: 2 }).notNull(),
  minBet: decimal("min_bet", { precision: 10, scale: 2 }).notNull(),
  prize: decimal("prize", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  claimedBy: text("claimed_by"),
  claimStatus: text("claim_status").default("unclaimed"), // unclaimed, pending, verified, declined
  discordUsername: text("discord_username"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
  claimedBy: true,
  claimStatus: true,
  discordUsername: true,
});

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

// Free spins offers
export const freeSpinsOffers = pgTable("free_spins_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull(),
  gameName: text("game_name").notNull(),
  gameProvider: text("game_provider").notNull(),
  gameImage: text("game_image").notNull(),
  spinsCount: integer("spins_count").notNull(),
  spinValue: decimal("spin_value", { precision: 5, scale: 2 }).notNull(),
  totalClaims: integer("total_claims").notNull(),
  claimsRemaining: integer("claims_remaining").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  requirements: text("requirements").array().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFreeSpinsOfferSchema = createInsertSchema(freeSpinsOffers, {
  expiresAt: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertFreeSpinsOffer = z.infer<typeof insertFreeSpinsOfferSchema>;
export type FreeSpinsOffer = typeof freeSpinsOffers.$inferSelect;

// Users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username"),
  points: integer("points").notNull().default(0),
  kickUsername: text("kick_username"),
  kickUserId: text("kick_user_id"),
  kickAccessToken: text("kick_access_token"),
  kickRefreshToken: text("kick_refresh_token"),
  discordUsername: text("discord_username"),
  discordUserId: text("discord_user_id"),
  discordAccessToken: text("discord_access_token"),
  discordRefreshToken: text("discord_refresh_token"),
  discordAvatar: text("discord_avatar"),
  gamdomUsername: text("gamdom_username"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Game History
export const gameHistory = pgTable("game_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  gameName: text("game_name").notNull(), // blackjack, dice, mines, limbo
  betAmount: integer("bet_amount").notNull(),
  payout: integer("payout").notNull(),
  result: text("result").notNull(), // win, loss
  gameData: text("game_data"), // JSON string with game-specific data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGameHistorySchema = createInsertSchema(gameHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertGameHistory = z.infer<typeof insertGameHistorySchema>;
export type GameHistory = typeof gameHistory.$inferSelect;

// Shop Items
export const shopItems = pgTable("shop_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pointsCost: integer("points_cost").notNull(),
  imageUrl: text("image_url"),
  stock: integer("stock").notNull().default(-1), // -1 means unlimited
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertShopItemSchema = createInsertSchema(shopItems).omit({
  id: true,
  createdAt: true,
});

export type InsertShopItem = z.infer<typeof insertShopItemSchema>;
export type ShopItem = typeof shopItems.$inferSelect;

// Redemptions
export const redemptions = pgTable("redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  shopItemId: varchar("shop_item_id").notNull(),
  pointsSpent: integer("points_spent").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRedemptionSchema = createInsertSchema(redemptions).omit({
  id: true,
  createdAt: true,
});

export type InsertRedemption = z.infer<typeof insertRedemptionSchema>;
export type Redemption = typeof redemptions.$inferSelect;

// Active Mines Game (not in database, stored in memory/Firebase)
export interface ActiveMinesGame {
  id: string;
  userId: string;
  betAmount: number;
  minesCount: number;
  minePositions: number[]; // array of positions (0-24) where mines are located
  revealedTiles: number[]; // array of positions (0-24) that have been revealed
  currentMultiplier: number;
  gameActive: boolean;
  createdAt: string;
}
