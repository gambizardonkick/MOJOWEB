import {
  type LeaderboardEntry,
  type InsertLeaderboardEntry,
  type LeaderboardSettings,
  type InsertLeaderboardSettings,
  type LevelMilestone,
  type InsertLevelMilestone,
  type Challenge,
  type InsertChallenge,
  type FreeSpinsOffer,
  type InsertFreeSpinsOffer,
  type User,
  type InsertUser,
  type GameHistory,
  type InsertGameHistory,
  type ShopItem,
  type InsertShopItem,
  type Redemption,
  type InsertRedemption,
  type ActiveMinesGame,
  type ActiveBlackjackGame,
  type AdminLog,
  type InsertAdminLog,
  type Giveaway,
  type InsertGiveaway,
  type GiveawayEntry,
  type InsertGiveawayEntry,
} from "@shared/schema";
import { getDb } from "./firebase";
import { getKickletService } from "./kicklet";

export interface IStorage {
  getLeaderboardEntries(): Promise<LeaderboardEntry[]>;
  getLeaderboardEntry(id: string): Promise<LeaderboardEntry | undefined>;
  createLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
  updateLeaderboardEntry(id: string, data: Partial<InsertLeaderboardEntry>): Promise<LeaderboardEntry>;
  deleteLeaderboardEntry(id: string): Promise<void>;

  getLeaderboardSettings(): Promise<LeaderboardSettings | undefined>;
  upsertLeaderboardSettings(settings: InsertLeaderboardSettings): Promise<LeaderboardSettings>;

  getLevelMilestones(): Promise<LevelMilestone[]>;
  getLevelMilestone(id: string): Promise<LevelMilestone | undefined>;
  createLevelMilestone(milestone: InsertLevelMilestone): Promise<LevelMilestone>;
  updateLevelMilestone(id: string, data: Partial<InsertLevelMilestone>): Promise<LevelMilestone>;
  deleteLevelMilestone(id: string): Promise<void>;

  getChallenges(): Promise<Challenge[]>;
  getChallenge(id: string): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: string, data: Partial<InsertChallenge>): Promise<Challenge>;
  deleteChallenge(id: string): Promise<void>;
  claimChallenge(id: string, username: string, discordUsername: string): Promise<Challenge>;
  approveClaim(id: string): Promise<Challenge>;
  declineClaim(id: string): Promise<Challenge>;

  getFreeSpinsOffers(): Promise<FreeSpinsOffer[]>;
  getFreeSpinsOffer(id: string): Promise<FreeSpinsOffer | undefined>;
  createFreeSpinsOffer(offer: InsertFreeSpinsOffer): Promise<FreeSpinsOffer>;
  updateFreeSpinsOffer(id: string, data: Partial<InsertFreeSpinsOffer>): Promise<FreeSpinsOffer>;
  deleteFreeSpinsOffer(id: string): Promise<void>;

  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserBySessionId(sessionId: string): Promise<User | undefined>;
  getUserByDiscordId(discordUserId: string): Promise<User | undefined>;
  getUserByKickUsername(kickUsername: string): Promise<User | undefined>;
  getUserByGamdomUsername(gamdomUsername: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  addPoints(userId: string, points: number): Promise<User>;
  deductPoints(userId: string, points: number): Promise<User>;
  setPoints(userId: string, points: number): Promise<User>;
  syncPointsFromKicklet(userId: string): Promise<User>;
  syncAllUsersFromKicklet(): Promise<void>;

  getGameHistory(userId: string): Promise<GameHistory[]>;
  createGameHistory(history: InsertGameHistory): Promise<GameHistory>;

  getActiveMinesGame(userId: string): Promise<ActiveMinesGame | undefined>;
  createActiveMinesGame(game: Omit<ActiveMinesGame, 'id' | 'createdAt'>): Promise<ActiveMinesGame>;
  updateActiveMinesGame(gameId: string, data: Partial<ActiveMinesGame>): Promise<ActiveMinesGame>;
  deleteActiveMinesGame(gameId: string): Promise<void>;

  getActiveBlackjackGame(userId: string): Promise<ActiveBlackjackGame | undefined>;
  createActiveBlackjackGame(game: Omit<ActiveBlackjackGame, 'id' | 'createdAt'>): Promise<ActiveBlackjackGame>;
  updateActiveBlackjackGame(gameId: string, data: Partial<ActiveBlackjackGame>): Promise<ActiveBlackjackGame>;
  deleteActiveBlackjackGame(gameId: string): Promise<void>;

  getShopItems(): Promise<ShopItem[]>;
  getShopItem(id: string): Promise<ShopItem | undefined>;
  createShopItem(item: InsertShopItem): Promise<ShopItem>;
  updateShopItem(id: string, data: Partial<InsertShopItem>): Promise<ShopItem>;
  deleteShopItem(id: string): Promise<void>;

  getRedemptions(userId?: string): Promise<Redemption[]>;
  createRedemption(redemption: InsertRedemption): Promise<Redemption>;
  updateRedemption(id: string, data: Partial<InsertRedemption>): Promise<Redemption>;

  getAdminLogs(): Promise<AdminLog[]>;
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;

  getGiveaways(status?: string): Promise<Giveaway[]>;
  getGiveaway(id: string): Promise<Giveaway | undefined>;
  createGiveaway(giveaway: InsertGiveaway): Promise<Giveaway>;
  updateGiveaway(id: string, data: Partial<Giveaway>): Promise<Giveaway>;
  deleteGiveaway(id: string): Promise<void>;
  completeGiveaway(id: string, winnerId: string, winnerUsername: string, winnerDiscordUsername: string | null): Promise<Giveaway>;
  
  getGiveawayEntries(giveawayId: string): Promise<GiveawayEntry[]>;
  createGiveawayEntry(entry: InsertGiveawayEntry): Promise<GiveawayEntry>;
  getUserGiveawayEntry(giveawayId: string, userId: string): Promise<GiveawayEntry | undefined>;

  storeKickVerifier(sessionId: string, codeVerifier: string): Promise<void>;
  getKickVerifier(sessionId: string): Promise<string | undefined>;
  deleteKickVerifier(sessionId: string): Promise<void>;
}

export class FirebaseStorage implements IStorage {
  private db = getDb();

  async getLeaderboardEntries(): Promise<LeaderboardEntry[]> {
    const snapshot = await this.db.ref('leaderboardEntries').get();
    if (!snapshot.exists()) return [];
    
    const entries: LeaderboardEntry[] = [];
    snapshot.forEach((child) => {
      entries.push({ id: child.key!, ...child.val() } as LeaderboardEntry);
    });
    
    return entries.sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }

  async getLeaderboardEntry(id: string): Promise<LeaderboardEntry | undefined> {
    const snapshot = await this.db.ref(`leaderboardEntries/${id}`).get();
    if (!snapshot.exists()) return undefined;
    return { id: snapshot.key!, ...snapshot.val() } as LeaderboardEntry;
  }

  async createLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    const newRef = this.db.ref('leaderboardEntries').push();
    await newRef.set({
      ...entry,
      createdAt: new Date().toISOString(),
    });
    const snapshot = await newRef.get();
    return { id: snapshot.key!, ...snapshot.val() } as LeaderboardEntry;
  }

  async updateLeaderboardEntry(id: string, data: Partial<InsertLeaderboardEntry>): Promise<LeaderboardEntry> {
    await this.db.ref(`leaderboardEntries/${id}`).update(data);
    const snapshot = await this.db.ref(`leaderboardEntries/${id}`).get();
    return { id: snapshot.key!, ...snapshot.val() } as LeaderboardEntry;
  }

  async deleteLeaderboardEntry(id: string): Promise<void> {
    await this.db.ref(`leaderboardEntries/${id}`).remove();
  }

  async getLeaderboardSettings(): Promise<LeaderboardSettings | undefined> {
    const snapshot = await this.db.ref('leaderboardSettings').get();
    if (!snapshot.exists()) return undefined;
    
    let settings: LeaderboardSettings | undefined;
    snapshot.forEach((child) => {
      settings = { id: child.key!, ...child.val() } as LeaderboardSettings;
      return true;
    });
    
    return settings;
  }

  async upsertLeaderboardSettings(settings: InsertLeaderboardSettings): Promise<LeaderboardSettings> {
    const existing = await this.getLeaderboardSettings();
    
    const dataToSave = {
      totalPrizePool: settings.totalPrizePool,
      endDate: settings.endDate instanceof Date ? settings.endDate.toISOString() : settings.endDate,
    };
    
    if (existing) {
      await this.db.ref(`leaderboardSettings/${existing.id}`).update({
        ...dataToSave,
        updatedAt: new Date().toISOString(),
      });
      const snapshot = await this.db.ref(`leaderboardSettings/${existing.id}`).get();
      return { id: snapshot.key!, ...snapshot.val() } as LeaderboardSettings;
    } else {
      const newRef = this.db.ref('leaderboardSettings').push();
      await newRef.set({
        ...dataToSave,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const snapshot = await newRef.get();
      return { id: snapshot.key!, ...snapshot.val() } as LeaderboardSettings;
    }
  }

  async getLevelMilestones(): Promise<LevelMilestone[]> {
    const snapshot = await this.db.ref('levelMilestones').get();
    if (!snapshot.exists()) return [];
    
    const milestones: LevelMilestone[] = [];
    snapshot.forEach((child) => {
      milestones.push({ id: child.key!, ...child.val() } as LevelMilestone);
    });
    
    return milestones.sort((a, b) => (a.tier || 0) - (b.tier || 0));
  }

  async getLevelMilestone(id: string): Promise<LevelMilestone | undefined> {
    const snapshot = await this.db.ref(`levelMilestones/${id}`).get();
    if (!snapshot.exists()) return undefined;
    return { id: snapshot.key!, ...snapshot.val() } as LevelMilestone;
  }

  async createLevelMilestone(milestone: InsertLevelMilestone): Promise<LevelMilestone> {
    const newRef = this.db.ref('levelMilestones').push();
    await newRef.set({
      ...milestone,
      createdAt: new Date().toISOString(),
    });
    const snapshot = await newRef.get();
    return { id: snapshot.key!, ...snapshot.val() } as LevelMilestone;
  }

  async updateLevelMilestone(id: string, data: Partial<InsertLevelMilestone>): Promise<LevelMilestone> {
    await this.db.ref(`levelMilestones/${id}`).update(data);
    const snapshot = await this.db.ref(`levelMilestones/${id}`).get();
    return { id: snapshot.key!, ...snapshot.val() } as LevelMilestone;
  }

  async deleteLevelMilestone(id: string): Promise<void> {
    await this.db.ref(`levelMilestones/${id}`).remove();
  }

  async getChallenges(): Promise<Challenge[]> {
    const snapshot = await this.db.ref('challenges').get();
    if (!snapshot.exists()) return [];
    
    const challenges: Challenge[] = [];
    snapshot.forEach((child) => {
      challenges.push({ id: child.key!, ...child.val() } as Challenge);
    });
    
    return challenges.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    const snapshot = await this.db.ref(`challenges/${id}`).get();
    if (!snapshot.exists()) return undefined;
    return { id: snapshot.key!, ...snapshot.val() } as Challenge;
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const newRef = this.db.ref('challenges').push();
    await newRef.set({
      ...challenge,
      createdAt: new Date().toISOString(),
      claimStatus: 'unclaimed',
    });
    const snapshot = await newRef.get();
    return { id: snapshot.key!, ...snapshot.val() } as Challenge;
  }

  async updateChallenge(id: string, data: Partial<InsertChallenge>): Promise<Challenge> {
    await this.db.ref(`challenges/${id}`).update(data);
    const snapshot = await this.db.ref(`challenges/${id}`).get();
    return { id: snapshot.key!, ...snapshot.val() } as Challenge;
  }

  async deleteChallenge(id: string): Promise<void> {
    await this.db.ref(`challenges/${id}`).remove();
  }

  async claimChallenge(id: string, username: string, discordUsername: string): Promise<Challenge> {
    await this.db.ref(`challenges/${id}`).update({
      claimedBy: username,
      claimStatus: 'pending',
      discordUsername: discordUsername,
    });
    const snapshot = await this.db.ref(`challenges/${id}`).get();
    return { id: snapshot.key!, ...snapshot.val() } as Challenge;
  }

  async approveClaim(id: string): Promise<Challenge> {
    await this.db.ref(`challenges/${id}`).update({
      claimStatus: 'verified',
    });
    const snapshot = await this.db.ref(`challenges/${id}`).get();
    return { id: snapshot.key!, ...snapshot.val() } as Challenge;
  }

  async declineClaim(id: string): Promise<Challenge> {
    await this.db.ref(`challenges/${id}`).update({
      claimedBy: null,
      claimStatus: 'unclaimed',
      discordUsername: null,
    });
    const snapshot = await this.db.ref(`challenges/${id}`).get();
    return { id: snapshot.key!, ...snapshot.val() } as Challenge;
  }

  async getFreeSpinsOffers(): Promise<FreeSpinsOffer[]> {
    const snapshot = await this.db.ref('freeSpinsOffers').get();
    if (!snapshot.exists()) return [];
    
    const offers: FreeSpinsOffer[] = [];
    snapshot.forEach((child) => {
      offers.push({ id: child.key!, ...child.val() } as FreeSpinsOffer);
    });
    
    return offers.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

  async getFreeSpinsOffer(id: string): Promise<FreeSpinsOffer | undefined> {
    const snapshot = await this.db.ref(`freeSpinsOffers/${id}`).get();
    if (!snapshot.exists()) return undefined;
    return { id: snapshot.key!, ...snapshot.val() } as FreeSpinsOffer;
  }

  async createFreeSpinsOffer(offer: InsertFreeSpinsOffer): Promise<FreeSpinsOffer> {
    const newRef = this.db.ref('freeSpinsOffers').push();
    await newRef.set({
      ...offer,
      expiresAt: offer.expiresAt instanceof Date ? offer.expiresAt.toISOString() : offer.expiresAt,
      createdAt: new Date().toISOString(),
    });
    const snapshot = await newRef.get();
    return { id: snapshot.key!, ...snapshot.val() } as FreeSpinsOffer;
  }

  async updateFreeSpinsOffer(id: string, data: Partial<InsertFreeSpinsOffer>): Promise<FreeSpinsOffer> {
    const updateData = {
      ...data,
      expiresAt: data.expiresAt instanceof Date ? data.expiresAt.toISOString() : data.expiresAt,
    };
    await this.db.ref(`freeSpinsOffers/${id}`).update(updateData);
    const snapshot = await this.db.ref(`freeSpinsOffers/${id}`).get();
    return { id: snapshot.key!, ...snapshot.val() } as FreeSpinsOffer;
  }

  async deleteFreeSpinsOffer(id: string): Promise<void> {
    await this.db.ref(`freeSpinsOffers/${id}`).remove();
  }

  async getUsers(): Promise<User[]> {
    const snapshot = await this.db.ref('users').get();
    if (!snapshot.exists()) return [];
    
    const users: User[] = [];
    snapshot.forEach((child) => {
      users.push({ id: child.key!, ...child.val() } as User);
    });
    
    return users.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const snapshot = await this.db.ref(`users/${id}`).get();
    if (!snapshot.exists()) return undefined;
    const user = { id: snapshot.key!, ...snapshot.val() } as User;
    return user;
  }

  async getUserBySessionId(sessionId: string): Promise<User | undefined> {
    const mappingSnapshot = await this.db.ref(`sessionMappings/${sessionId}`).get();
    if (!mappingSnapshot.exists()) return undefined;
    
    const userId = mappingSnapshot.val();
    return await this.getUser(userId);
  }

  async getUserByDiscordId(discordUserId: string): Promise<User | undefined> {
    const snapshot = await this.db.ref('users').get();
    if (!snapshot.exists()) return undefined;
    
    let foundUser: User | undefined;
    snapshot.forEach((child) => {
      const user = { id: child.key!, ...child.val() } as User;
      if (user.discordUserId === discordUserId) {
        foundUser = user;
        return true;
      }
    });
    
    return foundUser;
  }

  async getUserByKickUsername(kickUsername: string): Promise<User | undefined> {
    const snapshot = await this.db.ref('users').get();
    if (!snapshot.exists()) return undefined;
    
    let foundUser: User | undefined;
    snapshot.forEach((child) => {
      const user = { id: child.key!, ...child.val() } as User;
      if (user.kickUsername && user.kickUsername.toLowerCase() === kickUsername.toLowerCase()) {
        foundUser = user;
        return true;
      }
    });
    
    return foundUser;
  }

  async getUserByGamdomUsername(gamdomUsername: string): Promise<User | undefined> {
    const snapshot = await this.db.ref('users').get();
    if (!snapshot.exists()) return undefined;
    
    let foundUser: User | undefined;
    snapshot.forEach((child) => {
      const user = { id: child.key!, ...child.val() } as User;
      if (user.gamdomUsername && user.gamdomUsername.toLowerCase() === gamdomUsername.toLowerCase()) {
        foundUser = user;
        return true;
      }
    });
    
    return foundUser;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newRef = this.db.ref('users').push();
    await newRef.set({
      ...user,
      points: user.points || 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });
    
    if (user.sessionId) {
      await this.db.ref(`sessionMappings/${user.sessionId}`).set(newRef.key);
    }
    
    const snapshot = await newRef.get();
    return { id: snapshot.key!, ...snapshot.val() } as User;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    await this.db.ref(`users/${id}`).update({
      ...data,
      lastLogin: new Date().toISOString(),
    });
    const snapshot = await this.db.ref(`users/${id}`).get();
    return { id: snapshot.key!, ...snapshot.val() } as User;
  }

  async deleteUser(id: string): Promise<void> {
    await this.db.ref(`users/${id}`).remove();
  }

  async addPoints(userId: string, points: number): Promise<User> {
    const snapshot = await this.db.ref(`users/${userId}`).get();
    if (!snapshot.exists()) throw new Error('User not found');
    const user = { id: snapshot.key!, ...snapshot.val() } as User;
    
    if (user.kickUsername && user.kickUserId) {
      try {
        const channelId = process.env.KICK_CHANNEL_ID;
        if (!channelId) {
          throw new Error('KICK_CHANNEL_ID environment variable is not set');
        }
        const kicklet = getKickletService();
        await kicklet.addPoints(channelId, user.kickUsername, points);
        const kickletPoints = await kicklet.getViewerPoints(channelId, user.kickUsername);
        await this.db.ref(`users/${userId}`).update({ points: kickletPoints });
        user.points = kickletPoints;
      } catch (error) {
        console.error(`Error syncing Kicklet points for user ${userId}, falling back to local update:`, error);
        const newPoints = (user.points || 0) + points;
        await this.db.ref(`users/${userId}`).update({ points: newPoints });
        user.points = newPoints;
      }
    } else {
      const newPoints = (user.points || 0) + points;
      await this.db.ref(`users/${userId}`).update({ points: newPoints });
      user.points = newPoints;
    }
    
    return user;
  }

  async deductPoints(userId: string, points: number): Promise<User> {
    const snapshot = await this.db.ref(`users/${userId}`).get();
    if (!snapshot.exists()) throw new Error('User not found');
    const user = { id: snapshot.key!, ...snapshot.val() } as User;
    
    if (user.kickUsername && user.kickUserId) {
      try {
        const channelId = process.env.KICK_CHANNEL_ID;
        if (!channelId) {
          throw new Error('KICK_CHANNEL_ID environment variable is not set');
        }
        const kicklet = getKickletService();
        await kicklet.removePoints(channelId, user.kickUsername, points);
        const kickletPoints = await kicklet.getViewerPoints(channelId, user.kickUsername);
        await this.db.ref(`users/${userId}`).update({ points: kickletPoints });
        user.points = kickletPoints;
      } catch (error) {
        console.error(`Error syncing Kicklet points for user ${userId}, falling back to local update:`, error);
        const newPoints = Math.max(0, (user.points || 0) - points);
        await this.db.ref(`users/${userId}`).update({ points: newPoints });
        user.points = newPoints;
      }
    } else {
      const newPoints = Math.max(0, (user.points || 0) - points);
      await this.db.ref(`users/${userId}`).update({ points: newPoints });
      user.points = newPoints;
    }
    
    return user;
  }

  async setPoints(userId: string, points: number): Promise<User> {
    const snapshot = await this.db.ref(`users/${userId}`).get();
    if (!snapshot.exists()) throw new Error('User not found');
    const user = { id: snapshot.key!, ...snapshot.val() } as User;
    
    if (user.kickUsername && user.kickUserId) {
      try {
        const channelId = process.env.KICK_CHANNEL_ID;
        if (!channelId) {
          throw new Error('KICK_CHANNEL_ID environment variable is not set');
        }
        const kicklet = getKickletService();
        await kicklet.setPoints(channelId, user.kickUsername, points);
        const kickletPoints = await kicklet.getViewerPoints(channelId, user.kickUsername);
        await this.db.ref(`users/${userId}`).update({ points: kickletPoints });
        user.points = kickletPoints;
      } catch (error) {
        console.error(`Error syncing Kicklet points for user ${userId}, falling back to local update:`, error);
        const newPoints = Math.max(0, points);
        await this.db.ref(`users/${userId}`).update({ points: newPoints });
        user.points = newPoints;
      }
    } else {
      const newPoints = Math.max(0, points);
      await this.db.ref(`users/${userId}`).update({ points: newPoints });
      user.points = newPoints;
    }
    
    return user;
  }

  async syncPointsFromKicklet(userId: string): Promise<User> {
    const snapshot = await this.db.ref(`users/${userId}`).get();
    if (!snapshot.exists()) throw new Error('User not found');
    const user = { id: snapshot.key!, ...snapshot.val() } as User;
    
    if (user.kickUsername && user.kickUserId) {
      try {
        const channelId = process.env.KICK_CHANNEL_ID;
        if (!channelId) {
          return user;
        }
        const kicklet = getKickletService();
        const kickletPoints = await kicklet.getViewerPoints(channelId, user.kickUsername);
        
        if (user.points !== kickletPoints) {
          await this.db.ref(`users/${userId}`).update({ 
            points: kickletPoints,
            lastKickletSync: new Date().toISOString(),
          });
          user.points = kickletPoints;
          user.lastKickletSync = new Date().toISOString() as any;
        }
      } catch (error) {
        console.warn(`Warning: Could not sync Kicklet points for user ${userId}, will retry on next sync`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    return user;
  }

  async syncAllUsersFromKicklet(): Promise<void> {
    try {
      const channelId = process.env.KICK_CHANNEL_ID;
      if (!channelId) {
        return;
      }

      const users = await this.getUsers();
      const kickUsers = users.filter(u => u.kickUsername && u.kickUserId);
      
      if (kickUsers.length === 0) {
        return;
      }

      console.log(`Syncing points for ${kickUsers.length} Kick users from Kicklet...`);
      
      try {
        const kicklet = getKickletService();
        const allViewers = await kicklet.getAllViewers(channelId);
        
        if (allViewers.length === 0) {
          console.log('No viewers found in Kicklet');
          return;
        }

        console.log(`Fetched ${allViewers.length} viewers from Kicklet in single request`);
        
        const viewerMap = new Map(
          allViewers.map(v => [v.viewerKickUsername.toLowerCase(), v.points])
        );

        let updatedCount = 0;
        const updatePromises = kickUsers.map(async (user) => {
          try {
            const kickletPoints = viewerMap.get(user.kickUsername!.toLowerCase());
            
            if (kickletPoints === undefined) {
              console.log(`  User ${user.kickUsername} not found in Kicklet, skipping`);
              return;
            }
            
            if (user.points !== kickletPoints) {
              console.log(`  User ${user.kickUsername}: ${user.points} -> ${kickletPoints}`);
              await this.db.ref(`users/${user.id}`).update({ 
                points: kickletPoints,
                lastKickletSync: new Date().toISOString(),
              });
              updatedCount++;
            }
          } catch (error) {
            console.warn(`  Warning: Could not sync points for ${user.kickUsername}:`, error instanceof Error ? error.message : 'Unknown error');
          }
        });

        await Promise.all(updatePromises);
        console.log(`Kicklet sync completed - ${updatedCount} users updated`);
      } catch (error) {
        console.warn(`Kicklet API request failed, will retry on next sync (${error instanceof Error ? error.message : 'Unknown error'})`);
      }
    } catch (error) {
      console.warn('Unexpected error in syncAllUsersFromKicklet, will retry on next sync:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async getGameHistory(userId: string): Promise<GameHistory[]> {
    const snapshot = await this.db.ref('gameHistory').get();
    if (!snapshot.exists()) return [];
    
    const history: GameHistory[] = [];
    snapshot.forEach((child) => {
      const data = child.val();
      if (data.userId === userId) {
        history.push({ id: child.key!, ...data } as GameHistory);
      }
    });
    
    return history.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

  async createGameHistory(history: InsertGameHistory): Promise<GameHistory> {
    const newRef = this.db.ref('gameHistory').push();
    await newRef.set({
      ...history,
      createdAt: new Date().toISOString(),
    });
    const snapshot = await newRef.get();
    return { id: snapshot.key!, ...snapshot.val() } as GameHistory;
  }

  async getActiveMinesGame(userId: string): Promise<ActiveMinesGame | undefined> {
    const snapshot = await this.db.ref('activeMinesGames').get();
    if (!snapshot.exists()) return undefined;
    
    let game: ActiveMinesGame | undefined;
    snapshot.forEach((child) => {
      const data = child.val();
      if (data.userId === userId && data.gameActive) {
        game = {
          id: child.key!,
          ...data,
          minePositions: typeof data.minePositions === 'string' ? JSON.parse(data.minePositions) : (data.minePositions || []),
          revealedTiles: typeof data.revealedTiles === 'string' ? JSON.parse(data.revealedTiles) : (data.revealedTiles || []),
        } as ActiveMinesGame;
      }
    });
    return game;
  }

  async createActiveMinesGame(game: Omit<ActiveMinesGame, 'id' | 'createdAt'>): Promise<ActiveMinesGame> {
    const newRef = this.db.ref('activeMinesGames').push();
    const gameData = {
      ...game,
      minePositions: JSON.stringify(game.minePositions),
      revealedTiles: JSON.stringify(game.revealedTiles),
      createdAt: new Date().toISOString(),
    };
    await newRef.set(gameData);
    const snapshot = await newRef.get();
    const data = snapshot.val();
    return {
      id: snapshot.key!,
      ...data,
      minePositions: JSON.parse(data.minePositions),
      revealedTiles: JSON.parse(data.revealedTiles),
    } as ActiveMinesGame;
  }

  async updateActiveMinesGame(gameId: string, data: Partial<ActiveMinesGame>): Promise<ActiveMinesGame> {
    const updateData: any = { ...data };
    if (data.revealedTiles) {
      updateData.revealedTiles = JSON.stringify(data.revealedTiles);
    }
    if (data.minePositions) {
      updateData.minePositions = JSON.stringify(data.minePositions);
    }
    await this.db.ref(`activeMinesGames/${gameId}`).update(updateData);
    const snapshot = await this.db.ref(`activeMinesGames/${gameId}`).get();
    const savedData = snapshot.val();
    return {
      id: snapshot.key!,
      ...savedData,
      minePositions: typeof savedData.minePositions === 'string' ? JSON.parse(savedData.minePositions) : (savedData.minePositions || []),
      revealedTiles: typeof savedData.revealedTiles === 'string' ? JSON.parse(savedData.revealedTiles) : (savedData.revealedTiles || []),
    } as ActiveMinesGame;
  }

  async deleteActiveMinesGame(gameId: string): Promise<void> {
    await this.db.ref(`activeMinesGames/${gameId}`).remove();
  }

  async getActiveBlackjackGame(userId: string): Promise<ActiveBlackjackGame | undefined> {
    const snapshot = await this.db.ref('activeBlackjackGames').get();
    if (!snapshot.exists()) return undefined;
    
    let game: ActiveBlackjackGame | undefined;
    snapshot.forEach((child) => {
      const data = child.val();
      if (data.userId === userId && data.gameActive) {
        game = {
          id: child.key!,
          ...data,
          deck: typeof data.deck === 'string' ? JSON.parse(data.deck) : (data.deck || []),
          playerHands: typeof data.playerHands === 'string' ? JSON.parse(data.playerHands) : (data.playerHands || []),
          dealerHand: typeof data.dealerHand === 'string' ? JSON.parse(data.dealerHand) : data.dealerHand,
          dealerHoleCard: typeof data.dealerHoleCard === 'string' ? JSON.parse(data.dealerHoleCard) : data.dealerHoleCard,
        } as ActiveBlackjackGame;
      }
    });
    return game;
  }

  async createActiveBlackjackGame(game: Omit<ActiveBlackjackGame, 'id' | 'createdAt'>): Promise<ActiveBlackjackGame> {
    const newRef = this.db.ref('activeBlackjackGames').push();
    const gameData = {
      ...game,
      deck: JSON.stringify(game.deck),
      playerHands: JSON.stringify(game.playerHands),
      dealerHand: JSON.stringify(game.dealerHand),
      dealerHoleCard: JSON.stringify(game.dealerHoleCard),
      createdAt: new Date().toISOString(),
    };
    await newRef.set(gameData);
    const snapshot = await newRef.get();
    const data = snapshot.val();
    return {
      id: snapshot.key!,
      ...data,
      deck: JSON.parse(data.deck),
      playerHands: JSON.parse(data.playerHands),
      dealerHand: JSON.parse(data.dealerHand),
      dealerHoleCard: JSON.parse(data.dealerHoleCard),
    } as ActiveBlackjackGame;
  }

  async updateActiveBlackjackGame(gameId: string, data: Partial<ActiveBlackjackGame>): Promise<ActiveBlackjackGame> {
    const updateData: any = { ...data };
    if (data.deck) {
      updateData.deck = JSON.stringify(data.deck);
    }
    if (data.playerHands) {
      updateData.playerHands = JSON.stringify(data.playerHands);
    }
    if (data.dealerHand) {
      updateData.dealerHand = JSON.stringify(data.dealerHand);
    }
    if (data.dealerHoleCard !== undefined) {
      updateData.dealerHoleCard = JSON.stringify(data.dealerHoleCard);
    }
    await this.db.ref(`activeBlackjackGames/${gameId}`).update(updateData);
    const snapshot = await this.db.ref(`activeBlackjackGames/${gameId}`).get();
    const savedData = snapshot.val();
    return {
      id: snapshot.key!,
      ...savedData,
      deck: typeof savedData.deck === 'string' ? JSON.parse(savedData.deck) : (savedData.deck || []),
      playerHands: typeof savedData.playerHands === 'string' ? JSON.parse(savedData.playerHands) : (savedData.playerHands || []),
      dealerHand: typeof savedData.dealerHand === 'string' ? JSON.parse(savedData.dealerHand) : savedData.dealerHand,
      dealerHoleCard: typeof savedData.dealerHoleCard === 'string' ? JSON.parse(savedData.dealerHoleCard) : savedData.dealerHoleCard,
    } as ActiveBlackjackGame;
  }

  async deleteActiveBlackjackGame(gameId: string): Promise<void> {
    await this.db.ref(`activeBlackjackGames/${gameId}`).remove();
  }

  async getShopItems(): Promise<ShopItem[]> {
    const snapshot = await this.db.ref('shopItems').get();
    if (!snapshot.exists()) return [];
    
    const items: ShopItem[] = [];
    snapshot.forEach((child) => {
      items.push({ id: child.key!, ...child.val() } as ShopItem);
    });
    
    return items.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

  async getShopItem(id: string): Promise<ShopItem | undefined> {
    const snapshot = await this.db.ref(`shopItems/${id}`).get();
    if (!snapshot.exists()) return undefined;
    return { id: snapshot.key!, ...snapshot.val() } as ShopItem;
  }

  async createShopItem(item: InsertShopItem): Promise<ShopItem> {
    const newRef = this.db.ref('shopItems').push();
    await newRef.set({
      ...item,
      createdAt: new Date().toISOString(),
    });
    const snapshot = await newRef.get();
    return { id: snapshot.key!, ...snapshot.val() } as ShopItem;
  }

  async updateShopItem(id: string, data: Partial<InsertShopItem>): Promise<ShopItem> {
    await this.db.ref(`shopItems/${id}`).update(data);
    const snapshot = await this.db.ref(`shopItems/${id}`).get();
    return { id: snapshot.key!, ...snapshot.val() } as ShopItem;
  }

  async deleteShopItem(id: string): Promise<void> {
    await this.db.ref(`shopItems/${id}`).remove();
  }

  async getRedemptions(userId?: string): Promise<Redemption[]> {
    const snapshot = await this.db.ref('redemptions').get();
    
    if (!snapshot.exists()) return [];
    
    const redemptions: Redemption[] = [];
    snapshot.forEach((child) => {
      const data = child.val();
      if (!userId || data.userId === userId) {
        redemptions.push({ id: child.key!, ...data } as Redemption);
      }
    });
    
    return redemptions.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

  async createRedemption(redemption: InsertRedemption): Promise<Redemption> {
    const newRef = this.db.ref('redemptions').push();
    await newRef.set({
      ...redemption,
      createdAt: new Date().toISOString(),
    });
    const snapshot = await newRef.get();
    return { id: snapshot.key!, ...snapshot.val() } as Redemption;
  }

  async updateRedemption(id: string, data: Partial<InsertRedemption>): Promise<Redemption> {
    await this.db.ref(`redemptions/${id}`).update(data);
    const snapshot = await this.db.ref(`redemptions/${id}`).get();
    return { id: snapshot.key!, ...snapshot.val() } as Redemption;
  }

  async getAdminLogs(): Promise<AdminLog[]> {
    const snapshot = await this.db.ref('adminLogs').get();
    if (!snapshot.exists()) return [];
    
    const logs: AdminLog[] = [];
    snapshot.forEach((child) => {
      logs.push({ id: child.key!, ...child.val() } as AdminLog);
    });
    
    return logs.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
    const newRef = this.db.ref('adminLogs').push();
    await newRef.set({
      ...log,
      createdAt: new Date().toISOString(),
    });
    const snapshot = await newRef.get();
    return { id: snapshot.key!, ...snapshot.val() } as AdminLog;
  }

  async getGiveaways(status?: string): Promise<Giveaway[]> {
    const snapshot = await this.db.ref('giveaways').get();
    if (!snapshot.exists()) return [];
    
    const giveaways: Giveaway[] = [];
    snapshot.forEach((child) => {
      const giveaway = { id: child.key!, ...child.val() } as Giveaway;
      if (!status || giveaway.status === status) {
        giveaways.push(giveaway);
      }
    });
    
    return giveaways.sort((a, b) => {
      const dateA = new Date(a.startTime || 0).getTime();
      const dateB = new Date(b.startTime || 0).getTime();
      return dateB - dateA;
    });
  }

  async getGiveaway(id: string): Promise<Giveaway | undefined> {
    const snapshot = await this.db.ref(`giveaways/${id}`).get();
    if (!snapshot.exists()) return undefined;
    return { id: snapshot.key!, ...snapshot.val() } as Giveaway;
  }

  async createGiveaway(giveaway: InsertGiveaway): Promise<Giveaway> {
    const newRef = this.db.ref('giveaways').push();
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + giveaway.durationMinutes * 60000);
    
    await newRef.set({
      ...giveaway,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: 'active',
      createdAt: startTime.toISOString(),
    });
    const snapshot = await newRef.get();
    return { id: snapshot.key!, ...snapshot.val() } as Giveaway;
  }

  async updateGiveaway(id: string, data: Partial<Giveaway>): Promise<Giveaway> {
    await this.db.ref(`giveaways/${id}`).update(data);
    const snapshot = await this.db.ref(`giveaways/${id}`).get();
    return { id: snapshot.key!, ...snapshot.val() } as Giveaway;
  }

  async deleteGiveaway(id: string): Promise<void> {
    await this.db.ref(`giveaways/${id}`).remove();
    await this.db.ref(`giveawayEntries/${id}`).remove();
  }

  async completeGiveaway(id: string, winnerId: string, winnerUsername: string, winnerDiscordUsername: string | null): Promise<Giveaway> {
    await this.db.ref(`giveaways/${id}`).update({
      status: 'completed',
      winnerId,
      winnerUsername,
      winnerDiscordUsername,
    });
    const snapshot = await this.db.ref(`giveaways/${id}`).get();
    return { id: snapshot.key!, ...snapshot.val() } as Giveaway;
  }

  async getGiveawayEntries(giveawayId: string): Promise<GiveawayEntry[]> {
    const snapshot = await this.db.ref(`giveawayEntries/${giveawayId}`).get();
    if (!snapshot.exists()) return [];
    
    const entries: GiveawayEntry[] = [];
    snapshot.forEach((child) => {
      entries.push({ id: child.key!, ...child.val() } as GiveawayEntry);
    });
    
    return entries;
  }

  async createGiveawayEntry(entry: InsertGiveawayEntry): Promise<GiveawayEntry> {
    const newRef = this.db.ref(`giveawayEntries/${entry.giveawayId}`).push();
    await newRef.set({
      ...entry,
      createdAt: new Date().toISOString(),
    });
    const snapshot = await newRef.get();
    return { id: snapshot.key!, ...snapshot.val() } as GiveawayEntry;
  }

  async getUserGiveawayEntry(giveawayId: string, userId: string): Promise<GiveawayEntry | undefined> {
    const snapshot = await this.db.ref(`giveawayEntries/${giveawayId}`).get();
    if (!snapshot.exists()) return undefined;
    
    let userEntry: GiveawayEntry | undefined;
    snapshot.forEach((child) => {
      const entry = { id: child.key!, ...child.val() } as GiveawayEntry;
      if (entry.userId === userId) {
        userEntry = entry;
        return true;
      }
    });
    
    return userEntry;
  }

  async storeKickVerifier(sessionId: string, codeVerifier: string): Promise<void> {
    await this.db.ref(`kickVerifiers/${sessionId}`).set({
      codeVerifier,
      createdAt: new Date().toISOString(),
    });
  }

  async getKickVerifier(sessionId: string): Promise<string | undefined> {
    const snapshot = await this.db.ref(`kickVerifiers/${sessionId}`).get();
    if (!snapshot.exists()) return undefined;
    return snapshot.val().codeVerifier;
  }

  async deleteKickVerifier(sessionId: string): Promise<void> {
    await this.db.ref(`kickVerifiers/${sessionId}`).remove();
  }
}

export const storage = new FirebaseStorage();
