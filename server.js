/**
 * ============================================================================
 * GUESS THE WORD - MULTIPLAYER REAL-TIME WEB GAME
 * Single-file Express + Socket.IO + Vanilla JS Application
 * Deployment Ready for Render / Heroku / Node.js Host
 * ============================================================================
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  pingInterval: 10000,
  pingTimeout: 5000
});

const PORT = process.env.PORT || 3000;

// ============================================================================
// 1. WORD DATABASE (Categorized & Difficulty Classified)
// ============================================================================
const WORD_DATABASE = [
  // --- GENERAL ---
  { word: "CLOCKS", category: "General", difficulty: "Easy", hints: ["Keeps track of time", "Has hands and a face", "Found on walls or wrists"] },
  { word: "PUZZLE", category: "General", difficulty: "Easy", hints: ["A game of problem solving", "Contains fitting pieces", "Jigsaw is a famous type"] },
  { word: "MIRROR", category: "General", difficulty: "Easy", hints: ["Reflects your image", "Made of silvered glass", "Vampires don't show up here"] },
  { word: "UMBRELLA", category: "General", difficulty: "Medium", hints: ["Used during bad weather", "Protects you from getting wet", "Furls into a compact cylinder"] },
  { word: "CALENDAR", category: "General", difficulty: "Medium", hints: ["Tracks days and months", "Hangs on wall or in phones", "Has 365 days charted"] },
  { word: "LABYRINTH", category: "General", difficulty: "Hard", hints: ["A complex maze", "Mythological home of the Minotaur", "Hard to navigate out of"] },
  { word: "PARADOX", category: "General", difficulty: "Hard", hints: ["A self-contradictory statement", "Grandfather concept in time travel", "Seems impossible yet true"] },

  // --- SCIENCE ---
  { word: "ATOM", category: "Science", difficulty: "Easy", hints: ["Basic unit of matter", "Contains protons and neutrons", "Combines to form molecules"] },
  { word: "GRAVITY", category: "Science", difficulty: "Easy", hints: ["Pulls objects toward Earth", "Discovered by Isaac Newton", "Keeps planets in orbit"] },
  { word: "OXYGEN", category: "Science", difficulty: "Easy", hints: ["Gas required for human breathing", "Atomic number 8", "Makes up 21% of atmosphere"] },
  { word: "PHOTOSYNTHESIS", category: "Science", difficulty: "Medium", hints: ["Plant energy production", "Uses sunlight and CO2", "Produces oxygen as byproduct"] },
  { word: "MOLECULE", category: "Science", difficulty: "Medium", hints: ["Group of bonded atoms", "Water is H2O", "Smallest unit of chemical compound"] },
  { word: "QUANTUM", category: "Science", difficulty: "Hard", hints: ["Subatomic physics realm", "Describes discrete units of energy", "Associated with Schrödinger's cat"] },
  { word: "ENTROPY", category: "Science", difficulty: "Hard", hints: ["Measure of disorder in a system", "Second Law of Thermodynamics", "Always increases in universe"] },

  // --- TECHNOLOGY ---
  { word: "ROBOT", category: "Technology", difficulty: "Easy", hints: ["Programmable machine", "Performs automated tasks", "Often depicted as metal humans"] },
  { word: "LAPTOP", category: "Technology", difficulty: "Easy", hints: ["Portable personal computer", "Folds open with screen and keys", "Runs on rechargeable battery"] },
  { word: "INTERNET", category: "Technology", difficulty: "Easy", hints: ["Global network of computers", "Hosts the World Wide Web", "Connects billions of devices"] },
  { word: "ALGORITHM", category: "Technology", difficulty: "Medium", hints: ["Step-by-step instructions", "Basis of software programs", "Used for sorting and searching"] },
  { word: "DATABASE", category: "Technology", difficulty: "Medium", hints: ["Structured collection of data", "Queried using SQL", "Stores backend information"] },
  { word: "BLOCKCHAIN", category: "Technology", difficulty: "Hard", hints: ["Decentralized digital ledger", "Underlies cryptocurrencies", "Immutable chain of cryptographic blocks"] },
  { word: "CYBERSECURITY", category: "Technology", difficulty: "Hard", hints: ["Protection of computer systems", "Guards against hackers and malware", "Involves firewalls and encryption"] },

  // --- GEOGRAPHY ---
  { word: "ISLAND", category: "Geography", difficulty: "Easy", hints: ["Land surrounded by water", "Hawaii and Iceland are examples", "Reached by boat or plane"] },
  { word: "MOUNTAIN", category: "Geography", difficulty: "Easy", hints: ["Large natural elevation of earth", "Everest is the tallest", "Has peaks and valleys"] },
  { word: "CANAL", category: "Geography", difficulty: "Medium", hints: ["Man-made waterway", "Suez and Panama are famous", "Used for boat navigation"] },
  { word: "ARCHIPELAGO", category: "Geography", difficulty: "Hard", hints: ["Group or chain of islands", "Indonesia is the world's largest", "Formed by volcanic activity"] },
  { word: "PENINSULA", category: "Geography", difficulty: "Medium", hints: ["Land surrounded by water on 3 sides", "Florida and Italy are examples", "Connected to larger mainland"] },

  // --- HISTORY ---
  { word: "PYRAMID", category: "History", difficulty: "Easy", hints: ["Ancient Egyptian tombs", "Triangular stone structures", "Giza hosts the famous ones"] },
  { word: "SAMURAI", category: "History", difficulty: "Medium", hints: ["Ancient Japanese warrior", "Followed Bushido code", "Wielded Katana swords"] },
  { word: "RENAISSANCE", category: "History", difficulty: "Hard", hints: ["Cultural rebirth in Europe", "14th to 17th centuries", "Leonardo da Vinci period"] },
  { word: "GLADIATOR", category: "History", difficulty: "Medium", hints: ["Roman combatant", "Fought in the Colosseum", "Entertained ancient crowds"] },

  // --- SPORTS ---
  { word: "SOCCER", category: "Sports", difficulty: "Easy", hints: ["World's most popular sport", "Played with a black and white ball", "Cannot use hands except goalie"] },
  { word: "MARATHON", category: "Sports", difficulty: "Medium", hints: ["Long distance running race", "Exactly 26.2 miles long", "Named after ancient Greek city"] },
  { word: "BASKETBALL", category: "Sports", difficulty: "Easy", hints: ["Dribble and shoot into a hoop", "Invented by James Naismith", "NBA is top professional league"] },

  // --- MOVIES ---
  { word: "CINEMA", category: "Movies", difficulty: "Easy", hints: ["Place to watch movies", "Has a massive screen and popcorn", "Also called movie theater"] },
  { word: "DIRECTOR", category: "Movies", difficulty: "Medium", hints: ["Person in charge of movie set", "Yells 'Action!' and 'Cut!'", "Spielberg and Nolan are famous"] },
  { word: "BLOCKBUSTER", category: "Movies", difficulty: "Hard", hints: ["Huge box office hit movie", "Named after explosive power", "Also a defunct video rental chain"] },

  // --- SPACE ---
  { word: "GALAXY", category: "Space", difficulty: "Easy", hints: ["System of millions of stars", "The Milky Way is ours", "Contains solar systems and dust"] },
  { word: "SUPERNOVA", category: "Space", difficulty: "Medium", hints: ["Explosion of a dying star", "Creates heavy elements", "Extremely bright astronomical event"] },
  { word: "BLACKHOLE", category: "Space", difficulty: "Hard", hints: ["Gravitational pull so strong light can't escape", "Center has a singularity", "Bounded by event horizon"] },

  // --- FOOD ---
  { word: "PIZZA", category: "Food", difficulty: "Easy", hints: ["Italian flatbread with toppings", "Crust, sauce, and cheese", "Delivered in square cardboard boxes"] },
  { word: "AVOCADO", category: "Food", difficulty: "Medium", hints: ["Green fruit with large seed", "Main ingredient in guacamole", "Popular on toast"] },
  { word: "CROISSANT", category: "Food", difficulty: "Hard", hints: ["Flaky buttery French pastry", "Crescent moon shaped", "Baked to golden perfection"] },

  // --- ANIMALS ---
  { word: "DOLPHIN", category: "Animals", difficulty: "Easy", hints: ["Intelligent marine mammal", "Uses echolocation", "Known for acrobatic leaps"] },
  { word: "CHAMELEON", category: "Animals", difficulty: "Medium", hints: ["Reptile that changes color", "Has independently moving eyes", "Long sticky tongue for insects"] },
  { word: "PLATYPUS", category: "Animals", difficulty: "Hard", hints: ["Egg-laying mammal", "Duck bill and beaver tail", "Native to eastern Australia"] }
];

// Helper to expand database dynamically if needed
function getRandomWord(category, difficulty, usedWords) {
  let filtered = WORD_DATABASE.filter(item => {
    const catMatch = (category === 'Mixed') ? true : item.category === category;
    const diffMatch = (difficulty === 'Mixed') ? true : item.difficulty === difficulty;
    const notUsed = !usedWords.has(item.word);
    return catMatch && diffMatch && notUsed;
  });

  // Fallback if exhausted in specific sub-criteria
  if (filtered.length === 0) {
    filtered = WORD_DATABASE.filter(item => !usedWords.has(item.word));
  }
  // Ultimate fallback if all words used
  if (filtered.length === 0) {
    usedWords.clear();
    filtered = WORD_DATABASE;
  }

  const selected = filtered[Math.floor(Math.random() * filtered.length)];
  usedWords.add(selected.word);
  return selected;
}

// ============================================================================
// 2. IN-MEMORY GAME STATE MANAGEMENT
// ============================================================================
const rooms = new Map();

class Room {
  constructor(code, hostId, settings) {
    this.code = code;
    this.hostId = hostId;
    this.settings = {
      rounds: parseInt(settings.rounds) || 5,
      timePerRound: parseInt(settings.timePerRound) || 45,
      maxPlayers: parseInt(settings.maxPlayers) || 8,
      difficulty: settings.difficulty || 'Mixed',
      category: settings.category || 'Mixed'
    };
    this.players = new Map(); // socketId -> Player
    this.state = 'LOBBY'; // LOBBY, PLAYING, ROUND_OVER, GAME_OVER
    this.currentRound = 0;
    this.currentWordData = null;
    this.usedWords = new Set();
    this.timer = null;
    this.timeLeft = 0;
    this.roundStartTime = 0;
  }

  addPlayer(socketId, name) {
    const isHost = this.players.size === 0;
    const player = {
      id: socketId,
      name: name,
      isHost: isHost,
      score: 0,
      lives: 3,
      hintsUnlocked: 1, // 1, 2, or 3
      correctLetters: 0,
      correctWords: 0,
      totalGuesses: 0,
      wrongGuesses: 0,
      roundsWon: 0,
      guessedLetters: new Set(),
      hasGuessedWord: false,
      lastGuessTime: 0, // Anti-spam rate limiting
      fastestGuess: null
    };
    this.players.set(socketId, player);
    return player;
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
    if (this.players.size > 0 && this.hostId === socketId) {
      // Migrate host to first remaining player
      const nextHost = this.players.values().next().value;
      nextHost.isHost = true;
      this.hostId = nextHost.id;
    }
  }

  isNameTaken(name) {
    for (let p of this.players.values()) {
      if (p.name.toLowerCase() === name.toLowerCase()) return true;
    }
    return false;
  }

  getPublicPlayerList() {
    return Array.from(this.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      score: p.score,
      lives: p.lives,
      hasGuessedWord: p.hasGuessedWord,
      correctLetters: p.correctLetters,
      correctWords: p.correctWords,
      roundsWon: p.roundsWon,
      accuracy: p.totalGuesses > 0 ? Math.round(((p.totalGuesses - p.wrongGuesses) / p.totalGuesses) * 100) : 100
    })).sort((a,b) => b.score - a.score);
  }

  startNewRound() {
    this.currentRound++;
    this.state = 'PLAYING';
    this.currentWordData = getRandomWord(this.settings.category, this.settings.difficulty, this.usedWords);
    this.timeLeft = this.settings.timePerRound;
    this.roundStartTime = Date.now();

    // Reset round-specific player state
    for (let p of this.players.values()) {
      p.lives = 3;
      p.hintsUnlocked = 1;
      p.guessedLetters.clear();
      p.hasGuessedWord = false;
    }
  }

  getMaskedWord() {
    if (!this.currentWordData) return "";
    const word = this.currentWordData.word;
    let masked = "";
    // Reveal letters if ANY active player guessed it or if round over
    for (let char of word) {
      let isRevealed = false;
      if (this.state === 'ROUND_OVER' || this.state === 'GAME_OVER') {
        isRevealed = true;
      } else {
        for (let p of this.players.values()) {
          if (p.guessedLetters.has(char)) {
            isRevealed = true;
            break;
          }
        }
      }
      masked += isRevealed ? char : "_";
    }
    return masked;
  }

  checkAllPlayersDone() {
    let activePlayers = 0;
    let finishedPlayers = 0;

    for (let p of this.players.values()) {
      activePlayers++;
      if (p.lives <= 0 || p.hasGuessedWord) {
        finishedPlayers++;
      }
    }
    return activePlayers > 0 && finishedPlayers === activePlayers;
  }
}

// Helper to generate 6-character room codes
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================================================
// 3. SERVER CONTROLLER & SOCKET.IO EVENTS
// ============================================================================

io.on('connection', (socket) => {

  // Create Room
  socket.on('create_room', ({ name, settings }, callback) => {
    if (!name || name.trim().length === 0) {
      return callback({ success: false, error: "Display name is required" });
    }
    let code = generateRoomCode();
    while (rooms.has(code)) code = generateRoomCode();

    const room = new Room(code, socket.id, settings);
    const player = room.addPlayer(socket.id, name.trim());
    rooms.set(code, room);

    socket.join(code);
    socket.roomCode = code;

    callback({
      success: true,
      code: code,
      player: player,
      settings: room.settings
    });

    io.to(code).emit('lobby_update', {
      players: room.getPublicPlayerList(),
      settings: room.settings,
      hostId: room.hostId
    });
  });

  // Join Room
  socket.on('join_room', ({ name, code }, callback) => {
    code = code.toUpperCase().trim();
    const room = rooms.get(code);

    if (!room) {
      return callback({ success: false, error: "Room not found. Check your code." });
    }
    if (room.state !== 'LOBBY') {
      return callback({ success: false, error: "Game is already in progress." });
    }
    if (room.players.size >= room.settings.maxPlayers) {
      return callback({ success: false, error: "Room is full." });
    }
    if (room.isNameTaken(name.trim())) {
      return callback({ success: false, error: "This name is already taken in this room." });
    }

    const player = room.addPlayer(socket.id, name.trim());
    socket.join(code);
    socket.roomCode = code;

    callback({
      success: true,
      code: code,
      player: player,
      settings: room.settings
    });

    io.to(code).emit('lobby_update', {
      players: room.getPublicPlayerList(),
      settings: room.settings,
      hostId: room.hostId
    });
  });

  // Start Game (Host only)
  socket.on('start_game', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.hostId !== socket.id || room.state !== 'LOBBY') return;

    runGameRoundLoop(room);
  });

  // Handle Guesses (Anti-Cheat & Rate Limited)
  socket.on('submit_guess', ({ guess }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.state !== 'PLAYING') return;

    const player = room.players.get(socket.id);
    if (!player || player.lives <= 0 || player.hasGuessedWord) return;

    // Rate limiting: 300ms between inputs
    const now = Date.now();
    if (now - player.lastGuessTime < 300) return;
    player.lastGuessTime = now;

    guess = guess.toUpperCase().trim();
    if (!guess || !/^[A-Z]+$/.test(guess)) return;

    const targetWord = room.currentWordData.word;
    player.totalGuesses++;

    // SINGLE LETTER GUESS
    if (guess.length === 1) {
      if (player.guessedLetters.has(guess)) {
        socket.emit('guess_result', { status: 'DUPLICATE', message: 'Letter already guessed!' });
        return;
      }

      player.guessedLetters.add(guess);

      if (targetWord.includes(guess)) {
        // CORRECT LETTER
        let occurences = 0;
        for (let char of targetWord) if (char === guess) occurences++;
        
        player.score += 1 * occurences;
        player.correctLetters += occurences;

        io.to(room.code).emit('letter_revealed', {
          maskedWord: room.getMaskedWord(),
          guessedBy: player.name,
          letter: guess,
          players: room.getPublicPlayerList()
        });

        // Check if this letter completes the word for everyone
        if (!room.getMaskedWord().includes('_')) {
          handleRoundEnd(room, player, "WORD_COMPLETED");
        }

      } else {
        // WRONG LETTER
        player.wrongGuesses++;
        player.lives--;

        if (player.lives === 2) {
          player.hintsUnlocked = 2;
          socket.emit('private_hint', { hintIndex: 2, hint: room.currentWordData.hints[1] });
        } else if (player.lives === 1) {
          player.hintsUnlocked = 3;
          socket.emit('private_hint', { hintIndex: 3, hint: room.currentWordData.hints[2] });
        }

        socket.emit('guess_result', {
          status: 'WRONG_LETTER',
          lives: player.lives,
          message: `Letter '${guess}' is incorrect!`
        });

        io.to(room.code).emit('player_status_update', { players: room.getPublicPlayerList() });

        if (room.checkAllPlayersDone()) {
          handleRoundEnd(room, null, "ALL_DEAD");
        }
      }
    } 
    // FULL WORD GUESS
    else {
      if (guess === targetWord) {
        // CORRECT FULL WORD
        const timeTaken = Math.round((Date.now() - room.roundStartTime) / 1000);
        
        // Dynamic scoring calculation
        let basePoints = 10;
        if (player.hintsUnlocked === 2) basePoints = 8;
        if (player.hintsUnlocked === 3) basePoints = 6;
        
        let speedBonus = Math.max(0, 5 - Math.floor(timeTaken / 5)); // Bonus for fast guess
        let totalGain = basePoints + speedBonus;

        player.score += totalGain;
        player.correctWords++;
        player.hasGuessedWord = true;
        player.roundsWon++;

        if (!player.fastestGuess || timeTaken < player.fastestGuess) {
          player.fastestGuess = timeTaken;
        }

        // Reveal all letters
        for (let char of targetWord) player.guessedLetters.add(char);

        handleRoundEnd(room, player, "WORD_GUESSED");
      } else {
        // WRONG WORD GUESS
        player.wrongGuesses++;
        player.lives--;

        if (player.lives === 2) {
          player.hintsUnlocked = 2;
          socket.emit('private_hint', { hintIndex: 2, hint: room.currentWordData.hints[1] });
        } else if (player.lives === 1) {
          player.hintsUnlocked = 3;
          socket.emit('private_hint', { hintIndex: 3, hint: room.currentWordData.hints[2] });
        }

        socket.emit('guess_result', {
          status: 'WRONG_WORD',
          lives: player.lives,
          message: `"${guess}" is incorrect!`
        });

        io.to(room.code).emit('player_status_update', { players: room.getPublicPlayerList() });

        if (room.checkAllPlayersDone()) {
          handleRoundEnd(room, null, "ALL_DEAD");
        }
      }
    }
  });

  // Return to Lobby / Play Again
  socket.on('restart_game', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.hostId !== socket.id) return;

 
