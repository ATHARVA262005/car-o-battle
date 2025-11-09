
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Infinite world - no size limit
const MAX_PLAYERS = 100;
const WORLD_SEED = 12345;

let players = new Map();
let projectiles = [];
let fuelTanks = [];
let seaMonsters = [];
let ruins = [];
let enemyCars = [];
let junk = [];
let powerups = [];

// Powerup types
const POWERUP_TYPES = {
  SPEED: { id: 'speed', color: '#fbbf24', duration: 10000 },
  HEALTH: { id: 'health', color: '#22c55e', duration: 0 },
  DAMAGE: { id: 'damage', color: '#ef4444', duration: 15000 },
  RAPID_FIRE: { id: 'rapid_fire', color: '#f97316', duration: 12000 },
  SHIELD: { id: 'shield', color: '#3b82f6', duration: 8000 },
  MULTI_SHOT: { id: 'multi_shot', color: '#8b5cf6', duration: 10000 },
  EXPLOSIVE: { id: 'explosive', color: '#dc2626', duration: 8000 },
  INVISIBILITY: { id: 'invisibility', color: '#6b7280', duration: 6000 }
};

// Generate fuel tanks
function generateFuelTank() {
  return {
    id: Math.random().toString(36),
    type: 'fuel',
    x: Math.random() * 2000,
    y: Math.random() * 2000,
    collected: false
  };
}

// Generate powerups
function generatePowerup() {
  const types = Object.values(POWERUP_TYPES);
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    id: Math.random().toString(36),
    type: type.id,
    x: Math.random() * 2000,
    y: Math.random() * 2000,
    collected: false
  };
}

// Generate sea monsters
function generateSeaMonster() {
  return {
    id: Math.random().toString(36),
    x: Math.random() * 1000 + 500,
    y: Math.random() * 1000 + 500,
    health: 100,
    lastAttack: 0,
    target: null
  };
}

// Generate enemy cars
function generateEnemyCar() {
  const types = ['green', 'slate'];
  return {
    id: Math.random().toString(36),
    type: types[Math.floor(Math.random() * types.length)],
    x: Math.random() * 1000 + 500,
    y: Math.random() * 1000 + 500,
    rotation: Math.random() * 360,
    speed: 0,
    health: 80,
    maxHealth: 80,
    lastShot: 0,
    target: null,
    patrolTarget: { x: 0, y: 0 }
  };
}

// Seeded random function
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate ruins with seed
function generateRuin(x, y, seed) {
  return {
    id: `ruin_${x}_${y}`,
    x: x,
    y: y,
    width: 32,
    height: 32,
    type: Math.floor(seededRandom(seed + 1000) * 8)
  };
}

// Initialize world
for (let i = 0; i < 30; i++) {
  fuelTanks.push(generateFuelTank());
}
for (let i = 0; i < 15; i++) {
  powerups.push(generatePowerup());
}
for (let i = 0; i < 8; i++) {
  enemyCars.push(generateEnemyCar());
}
console.log(`Initialized ${enemyCars.length} enemy cars`);

// Dynamic chunk-based world generation (generate on-demand)
function generateChunk(chunkX, chunkY) {
  const chunkSize = 200;
  const x = chunkX * chunkSize;
  const y = chunkY * chunkSize;
  const chunkSeed = WORLD_SEED + x * 73 + y * 97;
  const ruinChance = seededRandom(chunkSeed);
  const junkChance = seededRandom(chunkSeed + 500);
  
  const objects = [];
  
  // Generate ruin
  if (ruinChance < 0.25) {
    const offsetX = Math.floor(seededRandom(chunkSeed + 1) * 150);
    const offsetY = Math.floor(seededRandom(chunkSeed + 2) * 150);
    const ruinType = Math.floor(seededRandom(chunkSeed + 3) * 8);
    
    objects.push({
      type: 'ruin',
      data: {
        id: `ruin_${x}_${y}`,
        x: x + offsetX,
        y: y + offsetY,
        width: 32,
        height: 32,
        type: ruinType
      }
    });
  }
  
  // Generate junk
  if (junkChance < 0.3) {
    const offsetX = Math.floor(seededRandom(chunkSeed + 4) * 150);
    const offsetY = Math.floor(seededRandom(chunkSeed + 5) * 150);
    const junkType = Math.floor(seededRandom(chunkSeed + 6) * 6);
    
    objects.push({
      type: 'junk',
      data: {
        id: `junk_${x}_${y}`,
        x: x + offsetX,
        y: y + offsetY,
        width: 32,
        height: 32,
        type: junkType
      }
    });
  }
  
  return objects;
}

// Generate initial chunks around spawn
for (let x = -2000; x < 2000; x += 200) {
  for (let y = -2000; y < 2000; y += 200) {
    const objects = generateChunk(x / 200, y / 200);
    objects.forEach(obj => {
      if (obj.type === 'ruin') {
        ruins.push(obj.data);
      } else if (obj.type === 'junk') {
        junk.push(obj.data);
      }
    });
  }
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('join-game', (playerName) => {
    if (players.size >= MAX_PLAYERS) {
      socket.emit('game-full');
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      x: Math.random() * 1000,
      y: Math.random() * 1000,
      rotation: 0,
      speed: 0,
      health: 100,
      maxHealth: 100,
      score: 0,
      fuel: 100,
      maxFuel: 100,
      lives: 3,
      lastShot: 0,
      lastScoreUpdate: Date.now(),
      inventory: new Array(8).fill(null),
      activePowerups: new Map()
    };

    players.set(socket.id, player);
    
    socket.emit('game-joined', {
      playerId: socket.id
    });

    socket.emit('world-state', {
      players: Array.from(players.values()),
      fuelTanks: fuelTanks.filter(f => !f.collected),
      powerups: powerups.filter(p => !p.collected),
      ruins,
      enemyCars,
      junk
    });
  });

  socket.on('use-powerup', (slotIndex) => {
    const player = players.get(socket.id);
    if (!player || !player.inventory[slotIndex]) return;
    
    const powerupType = player.inventory[slotIndex];
    const powerup = POWERUP_TYPES[powerupType.toUpperCase()];
    
    if (powerup) {
      if (powerup.duration > 0) {
        player.activePowerups.set(powerup.id, Date.now() + powerup.duration);
      }
      if (powerup.id === 'health') {
        player.health = Math.min(player.health + 50, player.maxHealth);
      }
      player.inventory[slotIndex] = null;
    }
  });

  socket.on('player-input', (input) => {
    const player = players.get(socket.id);
    if (!player) return;
    
    // Check for number key presses (1-8) to use powerups
    for (let i = 1; i <= 8; i++) {
      if (input[`digit${i}`] && player.inventory[i-1]) {
        const powerupType = player.inventory[i-1];
        const powerup = POWERUP_TYPES[powerupType.toUpperCase()];
        
        if (powerup) {
          if (powerup.duration > 0) {
            player.activePowerups.set(powerup.id, Date.now() + powerup.duration);
          }
          if (powerup.id === 'health') {
            player.health = Math.min(player.health + 50, player.maxHealth);
          }
          player.inventory[i-1] = null;
        }
      }
    }

    // Player movement with sprint, handbrake, and speed powerup
    const baseSpeed = 3;
    const sprintMultiplier = input.sprint ? 1.5 : 1;
    const speedPowerup = player.activePowerups.has('speed') ? 1.8 : 1;
    const maxSpeed = baseSpeed * sprintMultiplier * speedPowerup;
    const acceleration = 0.3;
    const turnSpeed = input.handbrake ? 6 : 4;
    
    if (input.up) player.speed = Math.min(player.speed + acceleration, maxSpeed);
    if (input.down) player.speed = Math.max(player.speed - acceleration, -maxSpeed * 0.5);
    if (input.left) player.rotation -= turnSpeed;
    if (input.right) player.rotation += turnSpeed;
    
    // Apply movement with collision
    const radians = (player.rotation * Math.PI) / 180;
    const actualSpeed = player.speed * sprintMultiplier;
    const newX = player.x + Math.cos(radians) * actualSpeed;
    const newY = player.y + Math.sin(radians) * actualSpeed;
    
    // Check ruin and junk collision
    let canMove = true;
    for (const ruin of ruins) {
      const dx = newX - ruin.x;
      const dy = newY - ruin.y;
      if (Math.abs(dx) < 25 && Math.abs(dy) < 25) {
        canMove = false;
        break;
      }
    }
    for (const junkObj of junk) {
      const dx = newX - junkObj.x;
      const dy = newY - junkObj.y;
      if (Math.abs(dx) < 25 && Math.abs(dy) < 25) {
        canMove = false;
        break;
      }
    }
    
    // Apply movement only if no collision
    if (canMove) {
      player.x = newX;
      player.y = newY;
    } else {
      // Stop the player when hitting obstacle
      player.speed *= 0.3;
    }
    
    // Generate new chunks if player moves to unexplored areas
    const chunkX = Math.floor(player.x / 200);
    const chunkY = Math.floor(player.y / 200);
    
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const newChunkX = chunkX + dx;
        const newChunkY = chunkY + dy;
        const chunkId = `ruin_${newChunkX * 200}_${newChunkY * 200}`;
        
        if (!ruins.find(r => r.id === chunkId) && !junk.find(j => j.id.includes(`${newChunkX * 200}_${newChunkY * 200}`))) {
          const objects = generateChunk(newChunkX, newChunkY);
          objects.forEach(obj => {
            if (obj.type === 'ruin') {
              ruins.push(obj.data);
            } else if (obj.type === 'junk') {
              junk.push(obj.data);
            }
          });
        }
      }
    }
    

    
    // Apply friction (more with handbrake)
    const friction = input.handbrake ? 0.85 : 0.95;
    player.speed *= friction;
    
    // Consume fuel when moving
    if (Math.abs(player.speed) > 0.1) {
      player.fuel -= 0.1;
      if (player.fuel <= 0) {
        player.fuel = 0;
        player.speed = 0; // Can't move without fuel
      }
    }

    // Update active powerups
    const now = Date.now();
    for (const [powerupId, expireTime] of player.activePowerups) {
      if (now > expireTime) {
        player.activePowerups.delete(powerupId);
      }
    }
    
    // Shooting with powerup effects
    const rapidFire = player.activePowerups.has('rapid_fire');
    const multiShot = player.activePowerups.has('multi_shot');
    const explosive = player.activePowerups.has('explosive');
    const damage = player.activePowerups.has('damage');
    
    const shootCooldown = rapidFire ? 200 : 500;
    
    if (input.shoot && Date.now() - player.lastShot > shootCooldown) {
      const baseDamage = damage ? 35 : 20;
      
      if (multiShot) {
        for (let i = -1; i <= 1; i++) {
          const projectile = {
            id: Math.random().toString(36),
            x: player.x,
            y: player.y,
            rotation: player.rotation + (i * 15),
            speed: 8,
            ownerId: socket.id,
            damage: baseDamage,
            explosive: explosive
          };
          projectiles.push(projectile);
        }
      } else {
        const projectile = {
          id: Math.random().toString(36),
          x: player.x,
          y: player.y,
          rotation: player.rotation,
          speed: 8,
          ownerId: socket.id,
          damage: baseDamage,
          explosive: explosive
        };
        projectiles.push(projectile);
      }
      player.lastShot = Date.now();
    }
  });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    console.log('Player disconnected:', socket.id);
  });
});

// Game loop
setInterval(() => {
  // Update projectiles
  projectiles = projectiles.filter(projectile => {
    const radians = (projectile.rotation * Math.PI) / 180;
    projectile.x += Math.cos(radians) * projectile.speed;
    projectile.y += Math.sin(radians) * projectile.speed;

    // Check collision with players
    for (const [playerId, player] of players) {
      if (playerId === projectile.ownerId || player.lives <= 0) continue;
      
      const dx = player.x - projectile.x;
      const dy = player.y - projectile.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 30) {
        player.health -= projectile.damage;
        if (player.health <= 0) {
          const shooter = players.get(projectile.ownerId);
          if (shooter) shooter.score += 100;
          
          // Lose a life
          player.lives = Math.max(0, player.lives - 1);
          
          if (player.lives > 0) {
            // Respawn player
            player.health = player.maxHealth;
            player.fuel = player.maxFuel;
            player.x = Math.random() * 1000;
            player.y = Math.random() * 1000;
          } else {
            // Game over
            const socket = [...io.sockets.sockets.values()].find(s => s.id === player.id);
            if (socket) socket.emit('game-over', { score: player.score });
          }
        }
        return false;
      }
    }
    
    // Check collision with enemy cars
    for (let i = 0; i < enemyCars.length; i++) {
      const enemy = enemyCars[i];
      if (projectile.ownerId === enemy.id) continue;
      
      const dx = enemy.x - projectile.x;
      const dy = enemy.y - projectile.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 30) {
        enemy.health -= projectile.damage;
        if (enemy.health <= 0) {
          const shooter = players.get(projectile.ownerId);
          if (shooter) shooter.score += 150;
          
          // Respawn enemy car
          enemyCars[i] = generateEnemyCar();
        }
        return false;
      }
    }

    // Keep projectiles (no bounds in endless world)
    return true;
  });

  // Check fuel tank collection
  for (const fuelTank of fuelTanks) {
    if (fuelTank.collected) continue;
    
    for (const player of players.values()) {
      const dx = player.x - fuelTank.x;
      const dy = player.y - fuelTank.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 25) {
        fuelTank.collected = true;
        player.fuel = Math.min(player.fuel + 30, player.maxFuel);
        
        setTimeout(() => {
          const newFuelTank = generateFuelTank();
          fuelTanks.push(newFuelTank);
        }, 3000);
      }
    }
  }
  
  // Check powerup collection
  for (const powerup of powerups) {
    if (powerup.collected) continue;
    
    for (const player of players.values()) {
      const dx = player.x - powerup.x;
      const dy = player.y - powerup.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 25) {
        // Find empty inventory slot
        const emptySlot = player.inventory.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
          player.inventory[emptySlot] = powerup.type;
          powerup.collected = true;
          
          setTimeout(() => {
            const newPowerup = generatePowerup();
            powerups.push(newPowerup);
          }, 5000);
        }
      }
    }
  }
  
  // Update player scores and check fuel
  for (const player of players.values()) {
    if (player.lives <= 0) continue;
    
    // Add 2 points every 5 seconds
    if (Date.now() - player.lastScoreUpdate > 5000) {
      player.score += 2;
      player.lastScoreUpdate = Date.now();
    }
    
    // Check if out of fuel
    if (player.fuel <= 0) {
      player.lives = Math.max(0, player.lives - 1);
      if (player.lives > 0) {
        player.fuel = player.maxFuel;
        player.health = player.maxHealth;
        player.x = Math.random() * 1000;
        player.y = Math.random() * 1000;
      } else {
        // Game over
        const socket = [...io.sockets.sockets.values()].find(s => s.id === player.id);
        if (socket) socket.emit('game-over', { score: player.score });
      }
    }
  }

  // Check car-to-car collisions
  for (const player of players.values()) {
    if (player.lives <= 0) continue;
    
    for (let i = 0; i < enemyCars.length; i++) {
      const enemy = enemyCars[i];
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 35) { // Car collision distance
        // Damage both cars
        player.health -= 25;
        enemy.health -= 25;
        
        // Push cars apart
        const pushForce = 10;
        const angle = Math.atan2(dy, dx);
        player.x += Math.cos(angle) * pushForce;
        player.y += Math.sin(angle) * pushForce;
        enemy.x -= Math.cos(angle) * pushForce;
        enemy.y -= Math.sin(angle) * pushForce;
        
        // Check if player died
        if (player.health <= 0) {
          player.lives = Math.max(0, player.lives - 1);
          
          if (player.lives > 0) {
            player.health = player.maxHealth;
            player.fuel = player.maxFuel;
            player.x = Math.random() * 1000;
            player.y = Math.random() * 1000;
          } else {
            // Game over
            const socket = [...io.sockets.sockets.values()].find(s => s.id === player.id);
            if (socket) socket.emit('game-over', { score: player.score });
          }
        }
        
        // Check if enemy died
        if (enemy.health <= 0) {
          player.score += 100;
          enemyCars[i] = generateEnemyCar();
        }
      }
    }
  }
  
  // Enemy car to enemy car collisions
  for (let i = 0; i < enemyCars.length; i++) {
    for (let j = i + 1; j < enemyCars.length; j++) {
      const enemy1 = enemyCars[i];
      const enemy2 = enemyCars[j];
      const dx = enemy1.x - enemy2.x;
      const dy = enemy1.y - enemy2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 35) {
        // Push enemy cars apart
        const pushForce = 5;
        const angle = Math.atan2(dy, dx);
        enemy1.x += Math.cos(angle) * pushForce;
        enemy1.y += Math.sin(angle) * pushForce;
        enemy2.x -= Math.cos(angle) * pushForce;
        enemy2.y -= Math.sin(angle) * pushForce;
      }
    }
  }

  // Update enemy cars AI
  enemyCars.forEach(enemy => {
    // Find nearest player
    let nearestPlayer = null;
    let nearestDistance = Infinity;
    
    for (const player of players.values()) {
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPlayer = player;
      }
    }
    
    if (nearestPlayer && nearestDistance < 300) {
      // Chase and shoot at player
      const dx = nearestPlayer.x - enemy.x;
      const dy = nearestPlayer.y - enemy.y;
      const targetRotation = Math.atan2(dy, dx) * 180 / Math.PI;
      
      // Smooth rotation towards target
      let rotDiff = targetRotation - enemy.rotation;
      if (rotDiff > 180) rotDiff -= 360;
      if (rotDiff < -180) rotDiff += 360;
      enemy.rotation += rotDiff * 0.05;
      
      // Move towards player
      enemy.speed = Math.min(enemy.speed + 0.2, 2);
      
      // Shoot at player
      if (nearestDistance < 200 && Date.now() - enemy.lastShot > 1500) {
        const projectile = {
          id: Math.random().toString(36),
          x: enemy.x,
          y: enemy.y,
          rotation: enemy.rotation,
          speed: 6,
          ownerId: enemy.id,
          damage: 15
        };
        projectiles.push(projectile);
        enemy.lastShot = Date.now();
      }
    } else {
      // Patrol behavior
      enemy.speed *= 0.95;
    }
    
    // Apply movement
    const radians = (enemy.rotation * Math.PI) / 180;
    enemy.x += Math.cos(radians) * enemy.speed;
    enemy.y += Math.sin(radians) * enemy.speed;
  });

  // Broadcast game state
  io.emit('game-update', {
    players: Array.from(players.values()),
    projectiles,
    fuelTanks: fuelTanks.filter(f => !f.collected),
    powerups: powerups.filter(p => !p.collected),
    ruins,
    enemyCars,
    junk
  });
}, 1000 / 60); // 60 FPS

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});