const KICKLET_API_BASE = 'https://kicklet.app/api';

interface KickletViewer {
  viewerKickUserID: number;
  viewerKickUsername: string;
  watchTime: number;
  lastActivity: string;
  points: number;
  messagesSent: number;
  rank: number;
}

interface KickletSearchResponse {
  count: number;
  ranking: KickletViewer[];
}

export class KickletService {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}, retryCount: number = 0): Promise<Response> {
    const url = `${KICKLET_API_BASE}${endpoint}`;
    const token = this.apiToken.trim();
    const maxRetries = 3;
    
    console.log(`Making Kicklet API request to: ${url}${retryCount > 0 ? ` (retry ${retryCount}/${maxRetries})` : ''}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `apitoken ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 403 && retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.warn(`Kicklet API returned 403, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(endpoint, options, retryCount + 1);
        }
        
        const errorText = await response.text();
        console.error(`Kicklet API error (${response.status}):`, errorText.substring(0, 200));
        throw new Error(`Kicklet API request failed: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.warn(`Kicklet API request failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries}):`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(endpoint, options, retryCount + 1);
      }
      throw error;
    }
  }

  async getViewerPoints(kickId: string, kickUsername: string): Promise<number> {
    try {
      const endpoint = `/stats/${kickId}/viewer/ranking?page=1&pageSize=50&orderBy=watchtime&order=desc&search=${encodeURIComponent(kickUsername)}`;
      const response = await this.makeRequest(endpoint);
      const data: KickletSearchResponse = await response.json();

      if (data.ranking && data.ranking.length > 0) {
        const viewer = data.ranking.find(v => 
          v.viewerKickUsername.toLowerCase() === kickUsername.toLowerCase()
        );
        return viewer?.points || 0;
      }

      return 0;
    } catch (error) {
      console.error(`Error fetching points for ${kickUsername}:`, error);
      return 0;
    }
  }

  async getAllViewers(kickId: string, pageSize: number = 1000): Promise<KickletViewer[]> {
    try {
      const endpoint = `/stats/${kickId}/viewer/ranking?page=1&pageSize=${pageSize}&orderBy=points&order=desc`;
      const response = await this.makeRequest(endpoint);
      const data: KickletSearchResponse = await response.json();
      return data.ranking || [];
    } catch (error) {
      console.error('Error fetching all viewers:', error);
      return [];
    }
  }

  async addPoints(kickId: string, kickUsername: string, points: number): Promise<void> {
    if (points <= 0) {
      throw new Error('Points must be greater than 0');
    }

    const endpoint = `/stats/${kickId}/points/${encodeURIComponent(kickUsername)}/add/${points}`;
    await this.makeRequest(endpoint, { method: 'PATCH' });
  }

  async removePoints(kickId: string, kickUsername: string, points: number): Promise<void> {
    if (points <= 0) {
      throw new Error('Points must be greater than 0');
    }

    const endpoint = `/stats/${kickId}/points/${encodeURIComponent(kickUsername)}/remove/${points}`;
    await this.makeRequest(endpoint, { method: 'PATCH' });
  }

  async setPoints(kickId: string, kickUsername: string, points: number): Promise<void> {
    if (points < 0) {
      throw new Error('Points cannot be negative');
    }

    const endpoint = `/stats/${kickId}/points/${encodeURIComponent(kickUsername)}/set/${points}`;
    await this.makeRequest(endpoint, { method: 'PATCH' });
  }
}

export function getKickletService(): KickletService {
  const apiToken = process.env.KICKLET_API_TOKEN;
  if (!apiToken) {
    throw new Error('KICKLET_API_TOKEN environment variable is not set');
  }
  return new KickletService(apiToken);
}
