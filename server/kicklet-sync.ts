import type { IStorage } from './storage';

export class KickletSyncService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 30000;

  constructor(private storage: IStorage) {}

  start() {
    if (this.intervalId) {
      console.log('Kicklet sync service is already running');
      return;
    }

    console.log(`Starting Kicklet sync service (interval: ${this.SYNC_INTERVAL_MS / 1000}s)`);
    
    this.sync();
    
    this.intervalId = setInterval(() => {
      this.sync();
    }, this.SYNC_INTERVAL_MS);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Kicklet sync service stopped');
    }
  }

  private async sync() {
    try {
      await this.storage.syncAllUsersFromKicklet();
    } catch (error) {
      console.error('Kicklet sync service error:', error);
    }
  }
}
