import { FirebaseStorage } from "./storage";
import { log } from "./vite";
import type { Giveaway } from "@shared/schema";

export class GiveawayCheckerService {
  private storage: FirebaseStorage;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 60000;

  constructor(storage: FirebaseStorage) {
    this.storage = storage;
  }

  start() {
    log('[GiveawayChecker] Starting automatic giveaway completion service');
    
    this.checkExpiredGiveaways();
    
    this.intervalId = setInterval(() => {
      this.checkExpiredGiveaways();
    }, this.CHECK_INTERVAL_MS);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      log('[GiveawayChecker] Stopped automatic giveaway completion service');
    }
  }

  private async checkExpiredGiveaways() {
    try {
      const giveaways = await this.storage.getGiveaways();
      const now = new Date();
      
      const expiredGiveaways = giveaways.filter(
        (g: Giveaway) => g.status === 'active' && new Date(g.endTime) < now
      );

      if (expiredGiveaways.length > 0) {
        log(`[GiveawayChecker] Found ${expiredGiveaways.length} expired giveaway(s), completing them...`);
        
        for (const giveaway of expiredGiveaways) {
          try {
            const entries = await this.storage.getGiveawayEntries(giveaway.id);
            
            if (entries.length > 0) {
              const randomIndex = Math.floor(Math.random() * entries.length);
              const winner = entries[randomIndex];
              const userId = winner.userId || '';
              
              if (userId) {
                const winnerUser = await this.storage.getUser(userId);
                
                if (winnerUser) {
                  await this.storage.completeGiveaway(giveaway.id, userId, winnerUser.username);
                  await this.storage.addPoints(userId, giveaway.points);
                  log(`[GiveawayChecker] Completed giveaway ${giveaway.id}, winner: ${winnerUser.username} (${giveaway.points} points)`);
                } else {
                  await this.storage.completeGiveaway(giveaway.id, '', 'Unknown');
                  log(`[GiveawayChecker] Completed giveaway ${giveaway.id}, winner user not found`);
                }
              } else {
                await this.storage.completeGiveaway(giveaway.id, '', 'Invalid entry');
                log(`[GiveawayChecker] Completed giveaway ${giveaway.id}, invalid entry`);
              }
            } else {
              await this.storage.completeGiveaway(giveaway.id, '', 'No entries');
              log(`[GiveawayChecker] Completed giveaway ${giveaway.id}, no entries`);
            }
          } catch (error) {
            console.error(`[GiveawayChecker] Error completing giveaway ${giveaway.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('[GiveawayChecker] Error checking expired giveaways:', error);
    }
  }
}
