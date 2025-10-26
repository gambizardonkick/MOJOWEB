import { storage } from "./storage";

const milestoneData = [
  { name: "Bronze 1", tier: 1, imageUrl: "https://i.ibb.co/WrGGFCs/image.png" },
  { name: "Bronze 2", tier: 2, imageUrl: "https://i.ibb.co/7Jvm8n5z/image.png" },
  { name: "Bronze 3", tier: 3, imageUrl: "https://i.ibb.co/DP42gVsL/image.png" },
  { name: "Silver 1", tier: 4, imageUrl: "https://i.ibb.co/Fq5M3ntC/image.png" },
  { name: "Silver 2", tier: 5, imageUrl: "https://i.ibb.co/v4k46MxT/image.png" },
  { name: "Silver 3", tier: 6, imageUrl: "https://i.ibb.co/xtn9Lnrf/image.png" },
  { name: "Gold 1", tier: 7, imageUrl: "https://i.ibb.co/Cp7XGNBV/image.png" },
  { name: "Gold 2", tier: 8, imageUrl: "https://i.ibb.co/xPZ1Lbb/image.png" },
  { name: "Gold 3", tier: 9, imageUrl: "https://i.ibb.co/qL4Yd8bJ/image.png" },
  { name: "Emerald 1", tier: 10, imageUrl: "https://i.ibb.co/nMVnvr90/image.png" },
  { name: "Emerald 2", tier: 11, imageUrl: "https://i.ibb.co/pjm8MMpN/image.png" },
  { name: "Emerald 3", tier: 12, imageUrl: "https://i.ibb.co/7t7KzMgB/image.png" },
  { name: "Sapphire 1", tier: 13, imageUrl: "https://i.ibb.co/MyWLsVz0/image.png" },
  { name: "Sapphire 2", tier: 14, imageUrl: "https://i.ibb.co/G4kkMMSV/image.png" },
  { name: "Sapphire 3", tier: 15, imageUrl: "https://i.ibb.co/NnpFXLdJ/image.png" },
  { name: "Ruby 1", tier: 16, imageUrl: "https://i.ibb.co/pBCG4Kkh/image.png" },
  { name: "Ruby 2", tier: 17, imageUrl: "https://i.ibb.co/Q3hNWJk1/image.png" },
  { name: "Ruby 3", tier: 18, imageUrl: "https://i.ibb.co/dwbkdM13/image.png" },
  { name: "Diamond 1", tier: 19, imageUrl: "https://i.ibb.co/K1nKf0n/image.png" },
  { name: "Diamond 2", tier: 20, imageUrl: "https://i.ibb.co/WvQZdcL1/image.png" },
  { name: "Diamond 3", tier: 21, imageUrl: "https://i.ibb.co/DfDr5b59/image.png" },
  { name: "Opal 1", tier: 22, imageUrl: "https://i.ibb.co/zV4bDX5V/image.png" },
  { name: "Opal 2", tier: 23, imageUrl: "https://i.ibb.co/BK3LJ3Pd/image.png" },
  { name: "Opal 3", tier: 24, imageUrl: "https://i.ibb.co/rfGMN0jZ/image.png" },
];

export async function seedDatabase() {
  try {
    console.log("Checking seed data...");

    // Check if already seeded by checking multiple tables with timeout
    const checkPromise = Promise.all([
      storage.getLevelMilestones(),
      storage.getLeaderboardEntries(),
      storage.getLeaderboardSettings(),
    ]);
    
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Firebase connection timeout')), 5000)
    );
    
    const [existingMilestones, existingEntries, existingSettings] = await Promise.race([
      checkPromise,
      timeoutPromise
    ]);

    if (existingMilestones.length > 0 || existingEntries.length > 0 || existingSettings) {
      console.log("Database already contains data, skipping seed...");
      return;
    }

    console.log("Seeding database...");

    // Seed leaderboard settings
    await storage.upsertLeaderboardSettings({
      totalPrizePool: "10000.00",
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    // Seed sample leaderboard entries
    const sampleEntries = [
      { rank: 1, username: "ProGambler420", wagered: "125000.00", prize: "3000.00" },
      { rank: 2, username: "LuckyStreamer", wagered: "98500.50", prize: "2000.00" },
      { rank: 3, username: "HighRoller88", wagered: "87300.25", prize: "1500.00" },
      { rank: 4, username: "CasinoKing", wagered: "76200.00", prize: "1000.00" },
      { rank: 5, username: "BetMaster", wagered: "65800.75", prize: "750.00" },
      { rank: 6, username: "SlotsFan", wagered: "54300.50", prize: "500.00" },
      { rank: 7, username: "WagerWarrior", wagered: "45600.00", prize: "400.00" },
      { rank: 8, username: "SpinDoctor", wagered: "38900.25", prize: "300.00" },
      { rank: 9, username: "JackpotJoe", wagered: "32100.00", prize: "250.00" },
      { rank: 10, username: "DiceDealer", wagered: "28500.50", prize: "200.00" },
    ];

    for (const entry of sampleEntries) {
      await storage.createLeaderboardEntry(entry);
    }

    // Seed all 24 level milestones
    for (const milestone of milestoneData) {
      await storage.createLevelMilestone({
        ...milestone,
        rewards: [
          `$${milestone.tier * 50} bonus cash`,
          `${milestone.tier * 10} free spins`,
          `${milestone.tier}% rakeback boost`,
          "Exclusive Discord role",
        ],
      });
    }

    // Seed sample challenges
    await storage.createChallenge({
      gameName: "Sweet Bonanza",
      gameImage: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&h=450&fit=crop",
      minMultiplier: "100.00",
      minBet: "1.00",
      prize: "500.00",
      isActive: true,
    });

    await storage.createChallenge({
      gameName: "Gates of Olympus",
      gameImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop",
      minMultiplier: "50.00",
      minBet: "2.00",
      prize: "250.00",
      isActive: true,
    });

    await storage.createChallenge({
      gameName: "Wanted Dead or a Wild",
      gameImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=450&fit=crop",
      minMultiplier: "200.00",
      minBet: "0.50",
      prize: "1000.00",
      isActive: true,
    });

    // Seed free spins offer
    await storage.createFreeSpinsOffer({
      code: "MOJOROTTEN10",
      gameName: "Rotten",
      gameProvider: "Hacksaw Gaming",
      gameImage: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&h=450&fit=crop",
      spinsCount: 100,
      spinValue: "0.20",
      totalClaims: 10,
      claimsRemaining: 10,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      requirements: [
        "Deposit $25, or have $25 deposited in last 48 hours",
        "Valid for both new and existing users",
        "Must be claimed within 30 days",
        "Wagering requirement: 40x",
      ],
      isActive: true,
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    console.warn("⚠️  Skipping database seed due to connection issues. The app will continue to run.");
    console.warn("To fix this, set up Firebase credentials in Replit Secrets.");
  }
}
