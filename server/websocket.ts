import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { FirebaseStorage } from './storage';
import { z } from 'zod';
import { randomBytes } from 'crypto';

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

interface WebSocketMessage {
  type: string;
  data?: any;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const storage = new FirebaseStorage();
  
  // Heartbeat to detect broken connections
  const heartbeat = (ws: ExtendedWebSocket) => {
    ws.isAlive = true;
  };

  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      const extWs = ws as ExtendedWebSocket;
      if (extWs.isAlive === false) {
        return extWs.terminate();
      }
      extWs.isAlive = false;
      extWs.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.isAlive = true;
    ws.on('pong', () => heartbeat(ws));

    console.log('New WebSocket connection');

    ws.on('message', async (message: Buffer) => {
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(message.toString());
        console.log('Received WebSocket message:', parsedMessage.type);

        switch (parsedMessage.type) {
          case 'auth':
            await handleAuth(ws, parsedMessage.data);
            break;
          case 'dice:play':
            await handleDicePlay(ws, parsedMessage.data, storage);
            break;
          case 'limbo:play':
            await handleLimboPlay(ws, parsedMessage.data, storage);
            break;
          case 'mines:start':
            await handleMinesStart(ws, parsedMessage.data, storage);
            break;
          case 'mines:reveal':
            await handleMinesReveal(ws, parsedMessage.data, storage);
            break;
          case 'mines:cashout':
            await handleMinesCashout(ws, parsedMessage.data, storage);
            break;
          case 'blackjack:start':
            await handleBlackjackStart(ws, parsedMessage.data, storage);
            break;
          case 'blackjack:hit':
            await handleBlackjackHit(ws, parsedMessage.data, storage);
            break;
          case 'blackjack:stand':
            await handleBlackjackStand(ws, parsedMessage.data, storage);
            break;
          case 'blackjack:double':
            await handleBlackjackDouble(ws, parsedMessage.data, storage);
            break;
          case 'blackjack:split':
            await handleBlackjackSplit(ws, parsedMessage.data, storage);
            break;
          case 'keno:play':
            await handleKenoPlay(ws, parsedMessage.data, storage);
            break;
          default:
            sendError(ws, 'Unknown message type');
        }
      } catch (error) {
        console.error('WebSocket message handling error:', error);
        sendError(ws, error instanceof Error ? error.message : 'Unknown error');
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

function sendMessage(ws: WebSocket, type: string, data?: any) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, data }));
  }
}

function sendError(ws: WebSocket, error: string) {
  sendMessage(ws, 'error', { error });
}

async function handleAuth(ws: ExtendedWebSocket, data: any) {
  const schema = z.object({
    userId: z.string(),
  });

  const validation = schema.safeParse(data);
  if (!validation.success) {
    return sendError(ws, 'Invalid auth data');
  }

  ws.userId = validation.data.userId;
  sendMessage(ws, 'auth:success', { userId: ws.userId });
}

async function handleDicePlay(ws: ExtendedWebSocket, data: any, storage: FirebaseStorage) {
  try {
    if (!ws.userId) {
      return sendError(ws, 'Not authenticated');
    }

    const gameSchema = z.object({
      betAmount: z.number().positive(),
      targetNumber: z.number().min(0).max(100),
      direction: z.enum(['under', 'over']),
    });

    const validation = gameSchema.safeParse(data);
    if (!validation.success) {
      return sendError(ws, validation.error.errors[0].message);
    }

    const { betAmount, targetNumber, direction } = validation.data;
    const userId = ws.userId;

    const user = await storage.getUser(userId);
    if (!user) {
      return sendError(ws, 'User not found');
    }

    if (user.points < betAmount) {
      return sendError(ws, 'Insufficient points');
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

    sendMessage(ws, 'dice:result', {
      won,
      roll,
      result: won ? 'win' : 'lose',
      payout,
      newBalance: updatedUser?.points || 0,
      betDirection: direction,
      betTarget: targetNumber,
    });
  } catch (error) {
    console.error('Dice game error:', error);
    sendError(ws, 'Failed to play dice game');
  }
}

async function handleLimboPlay(ws: ExtendedWebSocket, data: any, storage: FirebaseStorage) {
  try {
    if (!ws.userId) {
      return sendError(ws, 'Not authenticated');
    }

    const gameSchema = z.object({
      betAmount: z.number().positive(),
      targetMultiplier: z.number().min(1.01).max(1000),
    });

    const validation = gameSchema.safeParse(data);
    if (!validation.success) {
      return sendError(ws, validation.error.errors[0].message);
    }

    const { betAmount, targetMultiplier } = validation.data;
    const userId = ws.userId;

    const user = await storage.getUser(userId);
    if (!user) {
      return sendError(ws, 'User not found');
    }

    if (user.points < betAmount) {
      return sendError(ws, 'Insufficient points');
    }

    await storage.deductPoints(userId, betAmount);

    const randomNumber = Math.random() * 100;
    let crashPoint = randomNumber > 0 ? 99 / randomNumber : 1;
    crashPoint = Math.round(crashPoint * 100) / 100;

    if (crashPoint < 1) {
      crashPoint = 1.00;
    }

    const won = crashPoint >= targetMultiplier;
    let payout = 0;

    if (won) {
      payout = Math.floor(betAmount * targetMultiplier);
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

    sendMessage(ws, 'limbo:result', {
      won,
      crashPoint,
      payout,
      newBalance: updatedUser?.points || 0,
    });
  } catch (error) {
    console.error('Limbo game error:', error);
    sendError(ws, 'Failed to play limbo game');
  }
}

async function handleMinesStart(ws: ExtendedWebSocket, data: any, storage: FirebaseStorage) {
  try {
    if (!ws.userId) {
      return sendError(ws, 'Not authenticated');
    }

    const gameSchema = z.object({
      betAmount: z.number().positive(),
      minesCount: z.number().min(1).max(24),
    });

    const validation = gameSchema.safeParse(data);
    if (!validation.success) {
      return sendError(ws, validation.error.errors[0].message);
    }

    const { betAmount, minesCount } = validation.data;
    const userId = ws.userId;

    const user = await storage.getUser(userId);
    if (!user) {
      return sendError(ws, 'User not found');
    }

    if (user.points < betAmount) {
      return sendError(ws, 'Insufficient points');
    }

    const existingGame = await storage.getActiveMinesGame(userId);
    if (existingGame) {
      return sendError(ws, 'You already have an active game. Please finish or cashout first.');
    }

    await storage.deductPoints(userId, betAmount);

    const totalTiles = 25;
    const minePositions: number[] = [];
    while (minePositions.length < minesCount) {
      const position = Math.floor(Math.random() * totalTiles);
      if (!minePositions.includes(position)) {
        minePositions.push(position);
      }
    }

    const game = await storage.createActiveMinesGame({
      userId,
      betAmount,
      minesCount,
      minePositions,
      revealedTiles: [],
      currentMultiplier: 1,
      gameActive: true,
    });

    const salt = randomBytes(16).toString('hex');
    const mineData = JSON.stringify({ mines: game.minePositions, salt });
    const encodedMines = Buffer.from(mineData).toString('base64');

    const updatedUser = await storage.getUser(userId);

    sendMessage(ws, 'mines:started', {
      gameId: game.id,
      betAmount: game.betAmount,
      minesCount: game.minesCount,
      encodedMines,
      revealedTiles: [],
      currentMultiplier: 1,
      newBalance: updatedUser?.points || 0,
    });
  } catch (error) {
    console.error('Mines start error:', error);
    sendError(ws, 'Failed to start mines game');
  }
}

async function handleMinesReveal(ws: ExtendedWebSocket, data: any, storage: FirebaseStorage) {
  try {
    if (!ws.userId) {
      return sendError(ws, 'Not authenticated');
    }

    const gameSchema = z.object({
      position: z.number().min(0).max(24),
    });

    const validation = gameSchema.safeParse(data);
    if (!validation.success) {
      return sendError(ws, validation.error.errors[0].message);
    }

    const { position } = validation.data;
    const userId = ws.userId;

    const game = await storage.getActiveMinesGame(userId);
    if (!game) {
      return sendError(ws, 'No active game found');
    }

    if (!game.gameActive) {
      return sendError(ws, 'Game is not active');
    }

    if (game.revealedTiles.includes(position)) {
      return sendError(ws, 'Tile already revealed');
    }

    const isMine = game.minePositions.includes(position);

    if (isMine) {
      await storage.deleteActiveMinesGame(game.id);
      await storage.createGameHistory({
        userId,
        gameName: 'mines',
        betAmount: game.betAmount,
        payout: 0,
        result: 'loss',
        gameData: JSON.stringify({
          minesCount: game.minesCount,
          revealedTiles: [...game.revealedTiles, position],
          hitMine: true,
        }),
      });

      const updatedUser = await storage.getUser(userId);

      sendMessage(ws, 'mines:revealed', {
        position,
        isMine: true,
        gameOver: true,
        result: 'loss',
        payout: 0,
        newBalance: updatedUser?.points || 0,
        minePositions: game.minePositions,
      });
    } else {
      const updatedRevealedTiles = [...game.revealedTiles, position];
      const safeTilesRevealed = updatedRevealedTiles.length;
      const totalSafeTiles = 25 - game.minesCount;

      const multiplier = calculateMinesMultiplier(game.minesCount, safeTilesRevealed);

      await storage.updateActiveMinesGame(game.id, {
        revealedTiles: updatedRevealedTiles,
        currentMultiplier: multiplier,
      });

      if (safeTilesRevealed === totalSafeTiles) {
        const payout = Math.floor(game.betAmount * multiplier);
        await storage.addPoints(userId, payout);
        await storage.deleteActiveMinesGame(game.id);

        await storage.createGameHistory({
          userId,
          gameName: 'mines',
          betAmount: game.betAmount,
          payout,
          result: 'win',
          gameData: JSON.stringify({
            minesCount: game.minesCount,
            revealedTiles: updatedRevealedTiles,
            multiplier,
          }),
        });

        const updatedUser = await storage.getUser(userId);

        sendMessage(ws, 'mines:revealed', {
          position,
          isMine: false,
          gameOver: true,
          result: 'win',
          payout,
          multiplier,
          newBalance: updatedUser?.points || 0,
          revealedTiles: updatedRevealedTiles,
        });
      } else {
        const updatedUser = await storage.getUser(userId);

        sendMessage(ws, 'mines:revealed', {
          position,
          isMine: false,
          gameOver: false,
          multiplier,
          newBalance: updatedUser?.points || 0,
          revealedTiles: updatedRevealedTiles,
        });
      }
    }
  } catch (error) {
    console.error('Mines reveal error:', error);
    sendError(ws, 'Failed to reveal tile');
  }
}

async function handleMinesCashout(ws: ExtendedWebSocket, data: any, storage: FirebaseStorage) {
  try {
    if (!ws.userId) {
      return sendError(ws, 'Not authenticated');
    }

    const userId = ws.userId;

    const game = await storage.getActiveMinesGame(userId);
    if (!game) {
      return sendError(ws, 'No active game found');
    }

    if (!game.gameActive) {
      return sendError(ws, 'Game is not active');
    }

    if (game.revealedTiles.length === 0) {
      return sendError(ws, 'Cannot cashout without revealing any tiles');
    }

    const payout = Math.floor(game.betAmount * game.currentMultiplier);
    await storage.addPoints(userId, payout);
    await storage.deleteActiveMinesGame(game.id);

    await storage.createGameHistory({
      userId,
      gameName: 'mines',
      betAmount: game.betAmount,
      payout,
      result: 'win',
      gameData: JSON.stringify({
        minesCount: game.minesCount,
        revealedTiles: game.revealedTiles,
        multiplier: game.currentMultiplier,
        cashedOut: true,
      }),
    });

    const updatedUser = await storage.getUser(userId);

    sendMessage(ws, 'mines:cashedout', {
      payout,
      multiplier: game.currentMultiplier,
      newBalance: updatedUser?.points || 0,
    });
  } catch (error) {
    console.error('Mines cashout error:', error);
    sendError(ws, 'Failed to cashout');
  }
}

function calculateMinesMultiplier(minesCount: number, revealedCount: number): number {
  const totalTiles = 25;
  const safeTiles = totalTiles - minesCount;
  
  let multiplier = 1;
  for (let i = 0; i < revealedCount; i++) {
    const remainingSafe = safeTiles - i;
    const remainingTotal = totalTiles - i;
    multiplier *= (remainingTotal / remainingSafe) * 0.99;
  }
  
  return Math.round(multiplier * 100) / 100;
}

// Blackjack helper functions
function createDeck() {
  const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Array<'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'> = 
    ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      let value = 0;
      if (rank === 'A') value = 11;
      else if (['J', 'Q', 'K'].includes(rank)) value = 10;
      else value = parseInt(rank);
      
      deck.push({ suit, rank, value });
    }
  }
  
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
}

function createHand(cards: any[]) {
  const hand = {
    cards,
    total: 0,
    isBusted: false,
    isBlackjack: false,
  };
  
  calculateHandValue(hand);
  return hand;
}

function calculateHandValue(hand: any) {
  let total = 0;
  let aces = 0;
  
  for (const card of hand.cards) {
    if (card.rank === 'A') {
      aces++;
      total += 11;
    } else {
      total += card.value;
    }
  }
  
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  
  hand.total = total;
  hand.isBusted = total > 21;
  hand.isBlackjack = hand.cards.length === 2 && total === 21;
}

async function handleBlackjackStart(ws: ExtendedWebSocket, data: any, storage: FirebaseStorage) {
  try {
    if (!ws.userId) {
      return sendError(ws, 'Not authenticated');
    }

    const gameSchema = z.object({
      betAmount: z.number().positive(),
    });

    const validation = gameSchema.safeParse(data);
    if (!validation.success) {
      return sendError(ws, validation.error.errors[0].message);
    }

    const { betAmount } = validation.data;
    const userId = ws.userId;

    const user = await storage.getUser(userId);
    if (!user) {
      return sendError(ws, 'User not found');
    }

    if (user.points < betAmount) {
      return sendError(ws, 'Insufficient points');
    }

    const existingGame = await storage.getActiveBlackjackGame(userId);
    if (existingGame) {
      return sendError(ws, 'You already have an active game. Please finish it first.');
    }

    await storage.deductPoints(userId, betAmount);

    const deck = createDeck();
    const playerCards = [deck.pop()!, deck.pop()!];
    const dealerCards = [deck.pop()!, deck.pop()!];

    const playerHand = createHand(playerCards);
    const dealerHand = createHand(dealerCards);
    const dealerHoleCard = dealerCards[1];

    const canSplit = playerCards[0].rank === playerCards[1].rank;

    const game = await storage.createActiveBlackjackGame({
      userId,
      betAmount,
      deck,
      playerHands: [playerHand],
      dealerHand,
      currentHandIndex: 0,
      dealerHoleCard,
      gameStatus: playerHand.isBlackjack ? 'dealer_turn' : 'playing',
      canDouble: true,
      canSplit,
      hasSplit: false,
      gameActive: true,
    });

    const updatedUser = await storage.getUser(userId);

    if (playerHand.isBlackjack) {
      const finishedGame = await finishBlackjackGame(game, storage);
      sendMessage(ws, 'blackjack:started', {
        game: finishedGame.game,
        results: finishedGame.results,
        totalPayout: finishedGame.totalPayout,
        newBalance: updatedUser?.points || 0,
        gameOver: true,
      });
    } else {
      sendMessage(ws, 'blackjack:started', {
        game: {
          ...game,
          dealerHand: {
            ...game.dealerHand,
            cards: [game.dealerHand.cards[0]],
          },
        },
        newBalance: updatedUser?.points || 0,
        gameOver: false,
      });
    }
  } catch (error) {
    console.error('Blackjack start error:', error);
    sendError(ws, 'Failed to start blackjack game');
  }
}

async function handleBlackjackHit(ws: ExtendedWebSocket, data: any, storage: FirebaseStorage) {
  try {
    if (!ws.userId) {
      return sendError(ws, 'Not authenticated');
    }

    const userId = ws.userId;

    const game = await storage.getActiveBlackjackGame(userId);
    if (!game) {
      return sendError(ws, 'No active game found');
    }

    if (game.gameStatus !== 'playing') {
      return sendError(ws, 'Cannot hit in current game state');
    }

    const currentHand = game.playerHands[game.currentHandIndex];
    const newCard = game.deck.pop()!;
    currentHand.cards.push(newCard);
    calculateHandValue(currentHand);

    game.canDouble = false;

    if (currentHand.isBusted) {
      if (game.currentHandIndex < game.playerHands.length - 1) {
        game.currentHandIndex++;
      } else {
        game.gameStatus = 'dealer_turn';
        const finishedGame = await finishBlackjackGame(game, storage);
        const updatedUser = await storage.getUser(userId);
        
        return sendMessage(ws, 'blackjack:hit', {
          game: finishedGame.game,
          results: finishedGame.results,
          totalPayout: finishedGame.totalPayout,
          newBalance: updatedUser?.points || 0,
          gameOver: true,
        });
      }
    }

    await storage.updateActiveBlackjackGame(game.id, game);
    const updatedUser = await storage.getUser(userId);

    sendMessage(ws, 'blackjack:hit', {
      game: {
        ...game,
        dealerHand: {
          ...game.dealerHand,
          cards: [game.dealerHand.cards[0]],
        },
      },
      newBalance: updatedUser?.points || 0,
      gameOver: false,
    });
  } catch (error) {
    console.error('Blackjack hit error:', error);
    sendError(ws, 'Failed to hit');
  }
}

async function handleBlackjackStand(ws: ExtendedWebSocket, data: any, storage: FirebaseStorage) {
  try {
    if (!ws.userId) {
      return sendError(ws, 'Not authenticated');
    }

    const userId = ws.userId;

    const game = await storage.getActiveBlackjackGame(userId);
    if (!game) {
      return sendError(ws, 'No active game found');
    }

    if (game.gameStatus !== 'playing') {
      return sendError(ws, 'Cannot stand in current game state');
    }

    if (game.currentHandIndex < game.playerHands.length - 1) {
      game.currentHandIndex++;
      await storage.updateActiveBlackjackGame(game.id, game);
      const updatedUser = await storage.getUser(userId);

      sendMessage(ws, 'blackjack:stand', {
        game: {
          ...game,
          dealerHand: {
            ...game.dealerHand,
            cards: [game.dealerHand.cards[0]],
          },
        },
        newBalance: updatedUser?.points || 0,
        gameOver: false,
      });
    } else {
      game.gameStatus = 'dealer_turn';
      const finishedGame = await finishBlackjackGame(game, storage);
      const updatedUser = await storage.getUser(userId);

      sendMessage(ws, 'blackjack:stand', {
        game: finishedGame.game,
        results: finishedGame.results,
        totalPayout: finishedGame.totalPayout,
        newBalance: updatedUser?.points || 0,
        gameOver: true,
      });
    }
  } catch (error) {
    console.error('Blackjack stand error:', error);
    sendError(ws, 'Failed to stand');
  }
}

async function handleBlackjackDouble(ws: ExtendedWebSocket, data: any, storage: FirebaseStorage) {
  try {
    if (!ws.userId) {
      return sendError(ws, 'Not authenticated');
    }

    const userId = ws.userId;

    const game = await storage.getActiveBlackjackGame(userId);
    if (!game) {
      return sendError(ws, 'No active game found');
    }

    if (game.gameStatus !== 'playing') {
      return sendError(ws, 'Cannot double in current game state');
    }

    if (!game.canDouble) {
      return sendError(ws, 'Cannot double down at this time');
    }

    const user = await storage.getUser(userId);
    if (!user || user.points < game.betAmount) {
      return sendError(ws, 'Insufficient points to double down');
    }

    await storage.deductPoints(userId, game.betAmount);
    game.betAmount *= 2;

    const currentHand = game.playerHands[game.currentHandIndex];
    const newCard = game.deck.pop()!;
    currentHand.cards.push(newCard);
    calculateHandValue(currentHand);

    if (game.currentHandIndex < game.playerHands.length - 1) {
      game.currentHandIndex++;
      await storage.updateActiveBlackjackGame(game.id, game);
      const updatedUser = await storage.getUser(userId);

      sendMessage(ws, 'blackjack:double', {
        game: {
          ...game,
          dealerHand: {
            ...game.dealerHand,
            cards: [game.dealerHand.cards[0]],
          },
        },
        newBalance: updatedUser?.points || 0,
        gameOver: false,
      });
    } else {
      game.gameStatus = 'dealer_turn';
      const finishedGame = await finishBlackjackGame(game, storage);
      const updatedUser = await storage.getUser(userId);

      sendMessage(ws, 'blackjack:double', {
        game: finishedGame.game,
        results: finishedGame.results,
        totalPayout: finishedGame.totalPayout,
        newBalance: updatedUser?.points || 0,
        gameOver: true,
      });
    }
  } catch (error) {
    console.error('Blackjack double error:', error);
    sendError(ws, 'Failed to double down');
  }
}

async function handleBlackjackSplit(ws: ExtendedWebSocket, data: any, storage: FirebaseStorage) {
  try {
    if (!ws.userId) {
      return sendError(ws, 'Not authenticated');
    }

    const userId = ws.userId;

    const game = await storage.getActiveBlackjackGame(userId);
    if (!game) {
      return sendError(ws, 'No active game found');
    }

    if (game.gameStatus !== 'playing') {
      return sendError(ws, 'Cannot split in current game state');
    }

    if (!game.canSplit || game.hasSplit) {
      return sendError(ws, 'Cannot split at this time');
    }

    const user = await storage.getUser(userId);
    if (!user || user.points < game.betAmount) {
      return sendError(ws, 'Insufficient points to split');
    }

    await storage.deductPoints(userId, game.betAmount);

    const currentHand = game.playerHands[0];
    const card1 = currentHand.cards[0];
    const card2 = currentHand.cards[1];

    const newCard1 = game.deck.pop()!;
    const newCard2 = game.deck.pop()!;

    const hand1 = createHand([card1, newCard1]);
    const hand2 = createHand([card2, newCard2]);

    game.playerHands = [hand1, hand2];
    game.hasSplit = true;
    game.canSplit = false;
    game.currentHandIndex = 0;

    await storage.updateActiveBlackjackGame(game.id, game);
    const updatedUser = await storage.getUser(userId);

    sendMessage(ws, 'blackjack:split', {
      game: {
        ...game,
        dealerHand: {
          ...game.dealerHand,
          cards: [game.dealerHand.cards[0]],
        },
      },
      newBalance: updatedUser?.points || 0,
      gameOver: false,
    });
  } catch (error) {
    console.error('Blackjack split error:', error);
    sendError(ws, 'Failed to split');
  }
}

async function finishBlackjackGame(game: any, storage: FirebaseStorage) {
  while (game.dealerHand.total < 17) {
    const newCard = game.deck.pop()!;
    game.dealerHand.cards.push(newCard);
    calculateHandValue(game.dealerHand);
  }

  const results = [];
  let totalPayout = 0;

  for (const playerHand of game.playerHands) {
    let result = 'loss';
    let payout = 0;

    if (playerHand.isBusted) {
      result = 'loss';
    } else if (game.dealerHand.isBusted) {
      result = 'win';
      payout = playerHand.isBlackjack ? Math.floor(game.betAmount * 2.5) : game.betAmount * 2;
    } else if (playerHand.total > game.dealerHand.total) {
      result = 'win';
      payout = playerHand.isBlackjack ? Math.floor(game.betAmount * 2.5) : game.betAmount * 2;
    } else if (playerHand.total === game.dealerHand.total) {
      result = 'push';
      payout = game.betAmount;
    }

    totalPayout += payout;
    results.push({ hand: playerHand, result, payout });
  }

  if (totalPayout > 0) {
    await storage.addPoints(game.userId, totalPayout);
  }

  const finalResult = results.every(r => r.result === 'loss') ? 'loss' : 
                     results.some(r => r.result === 'win') ? 'win' : 'push';

  await storage.createGameHistory({
    userId: game.userId,
    gameName: 'blackjack',
    betAmount: game.betAmount,
    payout: totalPayout,
    result: finalResult,
    gameData: JSON.stringify({
      playerHands: game.playerHands,
      dealerHand: game.dealerHand,
      results,
    }),
  });

  await storage.deleteActiveBlackjackGame(game.id);

  game.gameStatus = 'finished';
  
  return {
    game,
    results,
    totalPayout,
  };
}

async function handleKenoPlay(ws: ExtendedWebSocket, data: any, storage: FirebaseStorage) {
  try {
    if (!ws.userId) {
      return sendError(ws, 'Not authenticated');
    }

    const gameSchema = z.object({
      betAmount: z.number().positive(),
      selectedNumbers: z.array(z.number().min(1).max(40)).min(1).max(10),
      risk: z.enum(['low', 'medium', 'high']),
    });

    const validation = gameSchema.safeParse(data);
    if (!validation.success) {
      return sendError(ws, validation.error.errors[0].message);
    }

    const { betAmount, selectedNumbers, risk } = validation.data;
    const userId = ws.userId;

    const user = await storage.getUser(userId);
    if (!user) {
      return sendError(ws, 'User not found');
    }

    if (user.points < betAmount) {
      return sendError(ws, 'Insufficient points');
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

    const payoutTables: Record<string, Record<number, number[]>> = {
      low: {
        1: [0.70, 1.85],
        2: [0.00, 2.00, 3.80],
        3: [0.00, 1.10, 1.38, 26.00],
        4: [0.00, 0.00, 2.20, 7.90, 90.00],
        5: [0.00, 0.00, 1.50, 4.20, 13.00, 300.0],
        6: [0.00, 0.00, 1.10, 2.00, 6.20, 100.0, 700.0],
        7: [0.00, 0.00, 1.10, 1.60, 3.50, 15.00, 225.0, 700.0],
        8: [0.00, 0.00, 1.10, 1.50, 2.00, 5.50, 39.00, 100.0, 800.0],
        9: [0.00, 0.00, 1.10, 1.30, 1.70, 2.50, 7.50, 50.00, 250.0, 1000],
        10: [0.00, 0.00, 1.10, 1.20, 1.30, 1.80, 3.50, 13.00, 50.00, 250.0, 1000],
      },
      medium: {
        1: [0.40, 2.75],
        2: [0.00, 1.80, 5.10],
        3: [0.00, 0.00, 2.80, 50.00],
        4: [0.00, 0.00, 1.70, 10.00, 100.0],
        5: [0.00, 0.00, 1.40, 4.00, 14.00, 390.0],
        6: [0.00, 0.00, 0.00, 3.00, 9.00, 180.0, 710.0],
        7: [0.00, 0.00, 0.00, 2.00, 7.00, 30.00, 400.0, 800.0],
        8: [0.00, 0.00, 0.00, 2.00, 4.00, 11.00, 67.00, 400.0, 900.0],
        9: [0.00, 0.00, 0.00, 2.00, 2.50, 5.00, 15.00, 100.0, 500.0, 1000],
        10: [0.00, 0.00, 0.00, 1.60, 2.00, 4.00, 7.00, 26.00, 100.0, 500.0, 1000],
      },
      high: {
        1: [0.00, 3.96],
        2: [0.00, 0.00, 17.10],
        3: [0.00, 0.00, 0.00, 81.50],
        4: [0.00, 0.00, 0.00, 10.00, 259.0],
        5: [0.00, 0.00, 0.00, 4.50, 48.00, 450.0],
        6: [0.00, 0.00, 0.00, 0.00, 11.00, 350.0, 710.0],
        7: [0.00, 0.00, 0.00, 0.00, 7.00, 90.00, 400.0, 800.0],
        8: [0.00, 0.00, 0.00, 0.00, 5.00, 20.00, 270.0, 600.0, 900.0],
        9: [0.00, 0.00, 0.00, 0.00, 4.00, 11.00, 56.00, 500.0, 800.0, 1000],
        10: [0.00, 0.00, 0.00, 0.00, 3.50, 8.00, 13.00, 63.00, 500.0, 800.0, 1000],
      },
    };

    const multiplierTable = payoutTables[risk][selectedNumbers.length];
    const multiplier = multiplierTable?.[hits] || 0;

    let payout = 0;
    if (multiplier > 0) {
      payout = Math.floor(betAmount * multiplier);
      await storage.addPoints(userId, payout);
    }

    const gameData = JSON.stringify({
      selectedNumbers,
      drawnNumbers,
      hits,
      risk,
      multiplier,
    });

    await storage.createGameHistory({
      userId,
      gameName: 'keno',
      betAmount,
      payout,
      result: payout > 0 ? 'win' : 'loss',
      gameData,
    });

    const updatedUser = await storage.getUser(userId);

    sendMessage(ws, 'keno:result', {
      drawnNumbers,
      hits,
      multiplier,
      payout,
      newBalance: updatedUser?.points || 0,
    });
  } catch (error) {
    console.error('Keno game error:', error);
    sendError(ws, 'Failed to play keno game');
  }
}
