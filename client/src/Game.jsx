import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { FaPause } from 'react-icons/fa';
import grassTexture from './assets/grass_texture.png';
import redCar from './assets/red_car.png';
import grass1 from './assets/grass/1.png';
import grass2 from './assets/grass/2.png';
import grass3 from './assets/grass/3.png';
import grass4 from './assets/grass/4.png';
import grass5 from './assets/grass/5.png';
import grass6 from './assets/grass/6.png';
import grass7 from './assets/grass/7.png';
import strongGrass from './assets/grass/strong.png';
import ruin1 from './assets/ruins/1.png';
import ruin2 from './assets/ruins/2.png';
import ruin3 from './assets/ruins/3.png';
import ruin4 from './assets/ruins/4.png';
import ruin5 from './assets/ruins/5.png';
import ruin6 from './assets/ruins/6.png';
import ruin7 from './assets/ruins/7.png';
import ruin8 from './assets/ruins/8.png';
import bgGrass from './assets/bg-grass.png';
import greenCar from './assets/green_car.png';
import slateCar from './assets/slate_car.png';
import junk1 from './assets/junk/1.png';
import junk2 from './assets/junk/2.png';
import junk3 from './assets/junk/3.png';
import junk4 from './assets/junk/4.png';
import junk5 from './assets/junk/5.png';
import junk6 from './assets/junk/6.png';
import fuelTank from './assets/fuel_tank.png';
import filledHeart from './assets/heart/filled_heart.png';
import hollowHeart from './assets/heart/hollow_heart.png';

const Game = ({ playerName, onGameOver }) => {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const [gameState, setGameState] = useState({
    players: [],
    projectiles: [],
    fuelTanks: [],
    powerups: [],
    seaMonsters: [],
    ruins: [],
    enemyCars: [],
    junk: []
  });
  const [playerId, setPlayerId] = useState(null);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [smoothPlayers, setSmoothPlayers] = useState([]);
  const imageCache = useRef({});
  const [animFrame, setAnimFrame] = useState(0);
  const keysRef = useRef({});
  const inventorySlots = useRef([]);
  const [isPaused, setIsPaused] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [showSettings, setShowSettings] = useState(false);
  const backgroundMusicRef = useRef(null);
  const shootSoundRef = useRef(null);
  const currentTrackRef = useRef(0);
  
  const backgroundTracks = [
    'https://github.com/ATHARVA262005/songs-to-use-by-suno/raw/main/Highway%20Skirmish.mp3',
    'https://github.com/ATHARVA262005/songs-to-use-by-suno/raw/main/Highway%20Skirmish%20(1).mp3',
    'https://github.com/ATHARVA262005/songs-to-use-by-suno/raw/main/Highway%20Duel.mp3',
    'https://github.com/ATHARVA262005/songs-to-use-by-suno/raw/main/Highway%20Duel%20(1).mp3'
  ];

  useEffect(() => {
    // Initialize audio
    backgroundMusicRef.current = new Audio();
    backgroundMusicRef.current.loop = false;
    backgroundMusicRef.current.volume = musicVolume;
    
    shootSoundRef.current = new Audio('https://github.com/ATHARVA262005/songs-to-use-by-suno/raw/main/bubble-pop-06-351337.mp3');
    shootSoundRef.current.volume = musicVolume;
    
    // Start random background music
    playRandomTrack();
    
    backgroundMusicRef.current.addEventListener('ended', playRandomTrack);
    
    socketRef.current = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001');
    
    socketRef.current.emit('join-game', playerName);
    
    socketRef.current.on('game-joined', (data) => {
      setPlayerId(data.playerId);
    });
    
    socketRef.current.on('game-update', (state) => {
      setGameState(state);
      
      // Check if player is out of lives or fuel
      const currentPlayer = state.players.find(p => p.id === playerId);
      if (currentPlayer && onGameOver) {
        if (currentPlayer.lives <= 0 || (currentPlayer.fuel <= 0 && currentPlayer.lives <= 0)) {
          onGameOver(currentPlayer.score || 0);
        }
      }
    });
    
    // Also listen for game over event from server
    socketRef.current.on('game-over', (data) => {
      if (onGameOver) {
        onGameOver(data.score || 0);
      }
    });

    return () => {
      socketRef.current.disconnect();
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.removeEventListener('ended', playRandomTrack);
      }
    };
  }, [playerName]);
  
  const playRandomTrack = () => {
    const availableTracks = backgroundTracks.filter((_, index) => index !== currentTrackRef.current);
    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    const selectedTrack = availableTracks[randomIndex];
    currentTrackRef.current = backgroundTracks.indexOf(selectedTrack);
    
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.src = selectedTrack;
      backgroundMusicRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };
  
  const playShootSound = () => {
    if (shootSoundRef.current) {
      shootSoundRef.current.currentTime = 0;
      shootSoundRef.current.play().catch(e => console.log('Shoot sound failed:', e));
    }
  };
  
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = musicVolume;
    }
    if (shootSoundRef.current) {
      shootSoundRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPaused(prev => !prev);
        return;
      }
      keysRef.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    const handleClick = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Check if click is on any inventory slot
      inventorySlots.current.forEach((slot, index) => {
        if (clickX >= slot.x && clickX <= slot.x + slot.width &&
            clickY >= slot.y && clickY <= slot.y + slot.height) {
          console.log(`Clicked inventory slot ${index}:`, slot.item);
          // Handle slot click here
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    const gameLoop = () => {
      if (isPaused) return;
      
      const keys = keysRef.current;
      const input = {
        up: keys['w'] || keys['arrowup'],
        down: keys['s'] || keys['arrowdown'],
        left: keys['a'] || keys['arrowleft'],
        right: keys['d'] || keys['arrowright'],
        shoot: keys[' '],
        sprint: keys['shift'],
        handbrake: keys['control'],
        digit1: keys['1'],
        digit2: keys['2'],
        digit3: keys['3'],
        digit4: keys['4'],
        digit5: keys['5'],
        digit6: keys['6'],
        digit7: keys['7'],
        digit8: keys['8']
      };
      
      // Play shoot sound when shooting
      if (input.shoot) {
        playShootSound();
      }

      if (socketRef.current) {
        socketRef.current.emit('player-input', input);
      }

      // Smooth player interpolation
      setSmoothPlayers(prev => {
        const newSmooth = [...gameState.players];
        return newSmooth.map(player => {
          const existing = prev.find(p => p.id === player.id);
          if (existing) {
            return {
              ...player,
              x: existing.x + (player.x - existing.x) * 0.3,
              y: existing.y + (player.y - existing.y) * 0.3,
              rotation: existing.rotation + (player.rotation - existing.rotation) * 0.3
            };
          }
          return player;
        });
      });

      // Smooth camera following
      const player = smoothPlayers.find(p => p.id === playerId);
      if (player) {
        setCamera(prev => ({
          x: prev.x + (player.x - window.innerWidth/2 - prev.x) * 0.15,
          y: prev.y + (player.y - window.innerHeight/2 - prev.y) * 0.15
        }));
      }
    };

    const interval = setInterval(gameLoop, 1000 / 60);
    return () => clearInterval(interval);
  }, [gameState, playerId, isPaused]);

  useEffect(() => {
    let animationId;
    const animate = () => {
      setAnimFrame(prev => (prev + 0.1) % 16);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grass texture background with caching
    if (!imageCache.current.grassTexture) {
      imageCache.current.grassTexture = new Image();
      imageCache.current.grassTexture.src = grassTexture;
    }
    
    const grassImg = imageCache.current.grassTexture;
    if (grassImg.complete) {
      const pattern = ctx.createPattern(grassImg, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#228B22';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Seeded grass generation (client-side) with proper caching
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    const grassTextures = [grass1, grass2, grass3, grass4, grass5, grass6, grass7];
    const WORLD_SEED = 12345;
    
    // Cache grass images once
    if (!imageCache.current.grassImages) {
      imageCache.current.grassImages = grassTextures.map((src, index) => {
        const img = new Image();
        img.src = src;
        return img;
      });
    }
    
    for (let x = Math.floor(camera.x / 200) * 200; x < camera.x + canvas.width + 200; x += 200) {
      for (let y = Math.floor(camera.y / 200) * 200; y < camera.y + canvas.height + 200; y += 200) {
        const chunkSeed = WORLD_SEED + x * 73 + y * 97;
        
        if (seededRandom(chunkSeed + 100) < 0.3) {
          const grassCount = Math.floor(seededRandom(chunkSeed + 101) * 3) + 1;
          
          for (let i = 0; i < grassCount; i++) {
            const grassSeed = chunkSeed + 200 + i;
            const grassX = x + Math.floor(seededRandom(grassSeed) * 180);
            const grassY = y + Math.floor(seededRandom(grassSeed + 1) * 180);
            const grassType = Math.floor(seededRandom(grassSeed + 2) * 7);
            
            const screenX = grassX - camera.x;
            const screenY = grassY - camera.y;
            
            if (screenX > -20 && screenX < canvas.width + 20 && 
                screenY > -16 && screenY < canvas.height + 16) {
              
              const grassImg = imageCache.current.grassImages[grassType];
              
              if (grassImg && grassImg.complete) {
                ctx.drawImage(grassImg, screenX, screenY, 20, 16);
              }
            }
          }
        }
      }
    }
    
    // Draw server-synced ruins with caching
    const ruinTextures = [ruin1, ruin2, ruin3, ruin4, ruin5, ruin6, ruin7, ruin8];
    
    // Draw server-synced junk with caching
    const junkTextures = [junk1, junk2, junk3, junk4, junk5, junk6];
    
    (gameState.ruins || []).forEach(ruin => {
      const screenX = ruin.x - camera.x;
      const screenY = ruin.y - camera.y;
      
      if (screenX > -64 && screenX < canvas.width + 64 && 
          screenY > -64 && screenY < canvas.height + 64) {
        
        if (!imageCache.current[`ruin${ruin.type}`]) {
          imageCache.current[`ruin${ruin.type}`] = new Image();
          imageCache.current[`ruin${ruin.type}`].src = ruinTextures[ruin.type];
        }
        
        const ruinImg = imageCache.current[`ruin${ruin.type}`];
        if (ruinImg.complete) {
          ctx.drawImage(ruinImg, screenX, screenY, ruinImg.width/2, ruinImg.height/2);
        } else {
          // Fallback rectangle while loading
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(screenX, screenY, 32, 32);
        }
      }
    });
    
    // Draw junk objects
    (gameState.junk || []).forEach(junkObj => {
      const screenX = junkObj.x - camera.x;
      const screenY = junkObj.y - camera.y;
      
      if (screenX > -64 && screenX < canvas.width + 64 && 
          screenY > -64 && screenY < canvas.height + 64) {
        
        if (!imageCache.current[`junk${junkObj.type}`]) {
          imageCache.current[`junk${junkObj.type}`] = new Image();
          imageCache.current[`junk${junkObj.type}`].src = junkTextures[junkObj.type];
        }
        
        const junkImg = imageCache.current[`junk${junkObj.type}`];
        if (junkImg.complete) {
          ctx.drawImage(junkImg, screenX, screenY, junkImg.width/2, junkImg.height/2);
        } else {
          // Fallback rectangle while loading
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(screenX, screenY, 32, 32);
        }
      }
    });
    
    // Draw fuel tanks
    (gameState.fuelTanks || []).forEach(fuel => {
      const screenX = fuel.x - camera.x;
      const screenY = fuel.y - camera.y;
      
      if (screenX > -50 && screenX < canvas.width + 50 && 
          screenY > -50 && screenY < canvas.height + 50) {
        
        if (!imageCache.current.fuelTank) {
          imageCache.current.fuelTank = new Image();
          imageCache.current.fuelTank.src = fuelTank;
        }
        
        const fuelImg = imageCache.current.fuelTank;
        if (fuelImg.complete) {
          ctx.drawImage(fuelImg, screenX - 16, screenY - 16, 32, 32);
        } else {
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(screenX - 8, screenY - 8, 16, 16);
        }
      }
    });
    
    // Draw powerups
    const powerupColors = {
      speed: '#fbbf24',
      health: '#22c55e',
      damage: '#ef4444',
      rapid_fire: '#f97316',
      shield: '#3b82f6',
      multi_shot: '#8b5cf6',
      explosive: '#dc2626',
      invisibility: '#6b7280'
    };
    
    (gameState.powerups || []).forEach(powerup => {
      const screenX = powerup.x - camera.x;
      const screenY = powerup.y - camera.y;
      
      if (screenX > -50 && screenX < canvas.width + 50 && 
          screenY > -50 && screenY < canvas.height + 50) {
        
        ctx.fillStyle = powerupColors[powerup.type] || '#ffffff';
        ctx.fillRect(screenX - 12, screenY - 12, 24, 24);
        
        // Powerup border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX - 12, screenY - 12, 24, 24);
        
        // Powerup icon (simple letter)
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px "UnifrakturCook", cursive';
        ctx.textAlign = 'center';
        const icon = powerup.type.charAt(0).toUpperCase();
        ctx.fillText(icon, screenX, screenY + 4);
      }
    });



    // Draw projectiles
    gameState.projectiles.forEach(projectile => {
      const screenX = projectile.x - camera.x;
      const screenY = projectile.y - camera.y;
      
      if (screenX > -10 && screenX < canvas.width + 10 && 
          screenY > -10 && screenY < canvas.height + 10) {
        
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw enemy cars
    (gameState.enemyCars || []).forEach(enemy => {
      const screenX = enemy.x - camera.x;
      const screenY = enemy.y - camera.y;
      
      if (screenX > -50 && screenX < canvas.width + 50 && 
          screenY > -50 && screenY < canvas.height + 50) {
        
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(((enemy.rotation - 90) * Math.PI) / 180);
        
        // Draw enemy car
        const carType = enemy.type === 'green' ? 'greenCar' : 'slateCar';
        if (!imageCache.current[carType]) {
          imageCache.current[carType] = new Image();
          imageCache.current[carType].src = enemy.type === 'green' ? greenCar : slateCar;
        }
        
        const carImg = imageCache.current[carType];
        if (carImg.complete) {
          const scale = 0.15;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(carImg, -carImg.width*scale/2, -carImg.height*scale/2, carImg.width*scale, carImg.height*scale);
        } else {
          ctx.fillStyle = enemy.type === 'green' ? '#22c55e' : '#64748b';
          ctx.fillRect(-30, -15, 60, 30);
        }
        
        ctx.restore();
        
        // Enemy health bar
        const healthWidth = 32;
        const healthHeight = 4;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        // Black border
        ctx.fillStyle = '#000000';
        ctx.fillRect(screenX - healthWidth/2 - 1, screenY - 40 - 1, healthWidth + 2, healthHeight + 2);
        
        // Red background
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(screenX - healthWidth/2, screenY - 40, healthWidth, healthHeight);
        
        // Health fill
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(screenX - healthWidth/2, screenY - 40, healthWidth * healthPercent, healthHeight);
      }
    });

    // Draw players
    smoothPlayers.forEach(player => {
      const screenX = player.x - camera.x;
      const screenY = player.y - camera.y;
      
      if (screenX > -50 && screenX < canvas.width + 50 && 
          screenY > -50 && screenY < canvas.height + 50) {
        
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(((player.rotation - 90) * Math.PI) / 180);
        
        // Draw red car
        if (!imageCache.current.redCar) {
          imageCache.current.redCar = new Image();
          imageCache.current.redCar.src = redCar;
        }
        
        const carImg = imageCache.current.redCar;
        if (carImg.complete) {
          const scale = 0.1;
          ctx.drawImage(carImg, -carImg.width*scale/2, -carImg.height*scale/2, carImg.width*scale, carImg.height*scale);
        } else {
          ctx.fillStyle = player.id === playerId ? '#ef4444' : '#3b82f6';
          ctx.fillRect(-20, -10, 40, 20);
        }
        
        ctx.restore();
        
        // Simple pixelated health bar above player
        const healthWidth = 32;
        const healthHeight = 6;
        const healthPercent = player.health / player.maxHealth;
        const miniBorder = 2;
        
        // Black border
        ctx.fillStyle = '#000000';
        ctx.fillRect(screenX - healthWidth/2 - miniBorder, screenY - 35 - miniBorder, healthWidth + miniBorder * 2, healthHeight + miniBorder * 2);
        
        // Gray background
        ctx.fillStyle = '#333333';
        ctx.fillRect(screenX - healthWidth/2, screenY - 35, healthWidth, healthHeight);
        
        // Red health fill
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(screenX - healthWidth/2, screenY - 35, healthWidth * healthPercent, healthHeight);
        
        // Player name (above health bar)
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px "UnifrakturCook", cursive';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, screenX, screenY - 45);
      }
    });


    
    // Draw minimap
    const minimapSize = 150;
    const minimapX = 10;
    const minimapY = canvas.height - minimapSize - 10;
    
    // Minimap background with gradient
    const gradient = ctx.createRadialGradient(
      minimapX + minimapSize/2, minimapY + minimapSize/2, 0,
      minimapX + minimapSize/2, minimapY + minimapSize/2, minimapSize/2
    );
    gradient.addColorStop(0, '#32CD32');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Add terrain texture to minimap
    for (let x = 0; x < minimapSize; x += 10) {
      for (let y = 0; y < minimapSize; y += 10) {
        const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.3;
        if (noise > 0.1) {
          ctx.fillStyle = '#90EE90';
          ctx.fillRect(minimapX + x, minimapY + y, 3, 3);
        }
      }
    }
    
    // Minimap border with glow
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 5;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    ctx.shadowBlur = 0;
    
    // Draw world border on minimap
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.strokeRect(minimapX + 2, minimapY + 2, minimapSize - 4, minimapSize - 4);
    
    // Draw players on minimap with glow (centered on current player)
    const currentPlayer = smoothPlayers.find(p => p.id === playerId);
    const centerX = currentPlayer ? currentPlayer.x : 0;
    const centerY = currentPlayer ? currentPlayer.y : 0;
    
    smoothPlayers.forEach(p => {
      const relativeX = p.x - centerX;
      const relativeY = p.y - centerY;
      const mapX = minimapX + minimapSize/2 + (relativeX / 1000) * minimapSize/2;
      const mapY = minimapY + minimapSize/2 + (relativeY / 1000) * minimapSize/2;
      
      // Player glow
      ctx.shadowColor = p.id === playerId ? '#ff0000' : '#0000ff';
      ctx.shadowBlur = 8;
      ctx.fillStyle = p.id === playerId ? '#ff0000' : '#0000ff';
      ctx.beginPath();
      ctx.arc(mapX, mapY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Player name on minimap
      if (p.id === playerId) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px "UnifrakturCook", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('YOU', mapX, mapY - 8);
      }
    });
    
    // Draw ruins on minimap (relative to player)
    (gameState.ruins || []).forEach(ruin => {
      const relativeX = ruin.x - centerX;
      const relativeY = ruin.y - centerY;
      const mapX = minimapX + minimapSize/2 + (relativeX / 1000) * minimapSize/2;
      const mapY = minimapY + minimapSize/2 + (relativeY / 1000) * minimapSize/2;
      
      // Only draw if within minimap range
      if (mapX >= minimapX && mapX <= minimapX + minimapSize && 
          mapY >= minimapY && mapY <= minimapY + minimapSize) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(mapX - 1, mapY - 1, 2, 2);
      }
    });
    
    // Minimap title
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px "UnifrakturCook", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('MAP', minimapX + minimapSize/2, minimapY - 5);
    
    // Draw UI
    const player = smoothPlayers.find(p => p.id === playerId);
    if (player) {

      
      // Big Pixelated Health bar (bottom center)
      const healthBarWidth = 400;
      const healthBarHeight = 32;
      const healthBarX = (canvas.width - healthBarWidth) / 2;
      const healthBarY = canvas.height - 60;
      const borderSize = 4;
      
      // Health bar pixelated black border
      ctx.fillStyle = '#000000';
      ctx.fillRect(healthBarX - borderSize, healthBarY - borderSize, healthBarWidth + borderSize * 2, healthBarHeight + borderSize * 2);
      
      // Health bar gray background
      ctx.fillStyle = '#333333';
      ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
      
      // Red health fill
      const healthPercent = player.health / player.maxHealth;
      const healthFillWidth = healthBarWidth * healthPercent;
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(healthBarX, healthBarY, healthFillWidth, healthBarHeight);
      
      // Health text
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px "UnifrakturCook", cursive';
      ctx.textAlign = 'center';
      ctx.fillText(`${player.health}/${player.maxHealth}`, healthBarX + healthBarWidth/2, healthBarY + 22);
      
      // Controls below health bar with black border
      const controlsText = 'WASD: Move | Space: Shoot | Shift: Sprint | Ctrl: Handbrake';
      const controlsX = healthBarX + healthBarWidth/2;
      const controlsY = healthBarY + healthBarHeight + 20;
      
      ctx.font = '14px "UnifrakturCook", cursive';
      ctx.textAlign = 'center';
      
      // Black border (stroke)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(controlsText, controlsX, controlsY);
      
      // White text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(controlsText, controlsX, controlsY);
      
      // Power-ups Info Card (top right)
      const infoCardWidth = 300;
      const infoCardHeight = 140;
      const infoCardX = canvas.width - infoCardWidth - 20;
      const infoCardY = 20;
      
      // Info card background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(infoCardX, infoCardY, infoCardWidth, infoCardHeight);
      
      // Info card border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(infoCardX, infoCardY, infoCardWidth, infoCardHeight);
      
      // Info card title
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px "UnifrakturCook", cursive';
      ctx.textAlign = 'center';
      ctx.fillText('POWER-UPS', infoCardX + infoCardWidth/2, infoCardY + 25);
      
      // Power-up info list
      const powerupInfo = [
        { type: 'speed', name: 'Speed Boost', color: '#fbbf24', duration: '10s' },
        { type: 'health', name: 'Health Pack', color: '#22c55e', duration: 'Instant' },
        { type: 'damage', name: 'Damage Boost', color: '#ef4444', duration: '15s' },
        { type: 'rapid_fire', name: 'Rapid Fire', color: '#f97316', duration: '12s' },
        { type: 'shield', name: 'Shield', color: '#3b82f6', duration: '8s' },
        { type: 'multi_shot', name: 'Multi-Shot', color: '#8b5cf6', duration: '10s' },
        { type: 'explosive', name: 'Explosive', color: '#dc2626', duration: '8s' },
        { type: 'invisibility', name: 'Invisibility', color: '#6b7280', duration: '6s' }
      ];
      
      ctx.font = '12px "UnifrakturCook", cursive';
      ctx.textAlign = 'left';
      
      powerupInfo.forEach((info, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const itemX = infoCardX + 10 + col * 140;
        const itemY = infoCardY + 45 + row * 22;
        
        // Power-up icon
        ctx.fillStyle = info.color;
        ctx.fillRect(itemX, itemY - 10, 16, 16);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(itemX, itemY - 10, 16, 16);
        
        // Power-up letter
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "UnifrakturCook", cursive';
        ctx.textAlign = 'center';
        ctx.fillText(info.type.charAt(0).toUpperCase(), itemX + 8, itemY - 2);
        
        // Power-up name and duration
        ctx.font = '11px "UnifrakturCook", cursive';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(info.name, itemX + 20, itemY - 4);
        ctx.fillStyle = '#cccccc';
        ctx.fillText(info.duration, itemX + 20, itemY + 8);
      });
      
      // Inventory slots (bottom right)
      const slotSize = 40;
      const slotSpacing = 8;
      const startX = canvas.width - (5 * slotSize + 4 * slotSpacing) - 20;
      const startY = canvas.height - (2 * slotSize + slotSpacing) - 20;
      
      // Clear and rebuild inventory slots positions
      inventorySlots.current = [];
      
      // Draw inventory slots (5x2 grid)
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 5; col++) {
          const slotX = startX + col * (slotSize + slotSpacing);
          const slotY = startY + row * (slotSize + slotSpacing);
          const slotIndex = row * 5 + col;
          
          // Store slot position for click detection
          const playerInventory = player.inventory || [];
          inventorySlots.current[slotIndex] = {
            x: slotX,
            y: slotY,
            width: slotSize,
            height: slotSize,
            item: playerInventory[slotIndex] || null
          };
          
          // Slot black border
          ctx.fillStyle = '#000000';
          ctx.fillRect(slotX - 2, slotY - 2, slotSize + 4, slotSize + 4);
          
          // Slot grass background
          if (!imageCache.current.bgGrass) {
            imageCache.current.bgGrass = new Image();
            imageCache.current.bgGrass.src = bgGrass;
          }
          
          const grassImg = imageCache.current.bgGrass;
          if (grassImg.complete) {
            ctx.drawImage(grassImg, slotX, slotY, slotSize, slotSize);
          } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(slotX, slotY, slotSize, slotSize);
          }
          
          // Draw powerup in slot
          const powerupType = playerInventory[slotIndex];
          
          if (powerupType) {
            ctx.fillStyle = powerupColors[powerupType] || '#ffffff';
            ctx.fillRect(slotX + 8, slotY + 8, 24, 24);
            
            // Powerup border
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(slotX + 8, slotY + 8, 24, 24);
            
            // Powerup icon
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px "UnifrakturCook", cursive';
            ctx.textAlign = 'center';
            const icon = powerupType.charAt(0).toUpperCase();
            ctx.fillText(icon, slotX + 20, slotY + 22);
          }
          
          // Slot number
          ctx.fillStyle = '#ffffff';
          ctx.font = '8px "UnifrakturCook", cursive';
          ctx.textAlign = 'left';
          ctx.fillText((slotIndex + 1).toString(), slotX + 2, slotY + 10);
        }
      }
      
      // Big Pixelated Power-up bar (above health bar)
      const powerBarY = healthBarY - 35;
      const powerBarHeight = 24;
      
      // Power bar pixelated black border
      ctx.fillStyle = '#000000';
      ctx.fillRect(healthBarX - borderSize, powerBarY - borderSize, healthBarWidth + borderSize * 2, powerBarHeight + borderSize * 2);
      
      // Power bar gray background
      ctx.fillStyle = '#333333';
      ctx.fillRect(healthBarX, powerBarY, healthBarWidth, powerBarHeight);
      
      // Fuel fill (yellow)
      const fuelPercent = player.fuel / player.maxFuel;
      const fuelFillWidth = healthBarWidth * fuelPercent;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(healthBarX, powerBarY, fuelFillWidth, powerBarHeight);
      
      // Fuel text
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px "UnifrakturCook", cursive';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeText(`Fuel: ${Math.ceil(player.fuel)}%`, healthBarX + healthBarWidth/2, powerBarY + 16);
      ctx.fillText(`Fuel: ${Math.ceil(player.fuel)}%`, healthBarX + healthBarWidth/2, powerBarY + 16);
      
      // Score above power bar (left side) with black border
      const scoreText = `Score: ${player.score}`;
      ctx.font = '20px "UnifrakturCook", cursive';
      ctx.textAlign = 'left';
      
      // Black border (stroke)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(scoreText, healthBarX, powerBarY - 10);
      
      // White text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(scoreText, healthBarX, powerBarY - 10);
      
      // Hearts (lives) above power bar (right side)
      const heartSize = 24;
      const heartSpacing = 8;
      const heartsStartX = healthBarX + healthBarWidth - (3 * heartSize + 2 * heartSpacing);
      const heartsY = powerBarY - 30;
      
      // Cache heart images
      if (!imageCache.current.filledHeart) {
        imageCache.current.filledHeart = new Image();
        imageCache.current.filledHeart.src = filledHeart;
      }
      if (!imageCache.current.hollowHeart) {
        imageCache.current.hollowHeart = new Image();
        imageCache.current.hollowHeart.src = hollowHeart;
      }
      
      // Draw 3 hearts
      for (let i = 0; i < 3; i++) {
        const heartX = heartsStartX + i * (heartSize + heartSpacing);
        const isFilled = i < player.lives;
        const heartImg = isFilled ? imageCache.current.filledHeart : imageCache.current.hollowHeart;
        
        if (heartImg && heartImg.complete) {
          ctx.drawImage(heartImg, heartX, heartsY, heartSize, heartSize);
        } else {
          // Fallback
          ctx.fillStyle = isFilled ? '#dc2626' : '#666666';
          ctx.fillRect(heartX, heartsY, heartSize, heartSize);
        }
      }
      

    }

  }, [gameState, camera, playerId]);

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      overflow: 'hidden'
    }}>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ display: 'block' }}
      />
      
      {/* Pause Button */}
      {!isPaused && (
        <button
          className="pixelify-sans pixel-button"
          onClick={() => setIsPaused(true)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '12px 20px',
            fontSize: '16px',
            backgroundColor: '#6b7280',
            color: '#ffffff',
            border: '3px solid #000000',
            cursor: 'pointer',
            textShadow: '2px 2px 0px #000000',
            boxShadow: '4px 4px 0px #000000',
            zIndex: 10
          }}
        >
          <FaPause />
        </button>
      )}
      
      {/* Pause Menu */}
      {isPaused && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            border: '4px solid #000000',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '25px',
            alignItems: 'center',
            minWidth: '400px'
          }}>
            <h1 className="pixelify-sans" style={{
              color: '#ffffff',
              fontSize: '32px',
              textShadow: '3px 3px 0px #000000',
              margin: 0
            }}>GAME PAUSED</h1>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              width: '100%'
            }}>
              <button
                className="pixelify-sans pixel-button"
                onClick={() => setIsPaused(false)}
                style={{
                  padding: '15px 30px',
                  fontSize: '20px',
                  backgroundColor: '#22c55e',
                  color: '#ffffff',
                  border: '3px solid #000000',
                  cursor: 'pointer',
                  textShadow: '2px 2px 0px #000000',
                  boxShadow: '4px 4px 0px #000000'
                }}
              >
                RESUME
              </button>
              
              <button
                className="pixelify-sans pixel-button"
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  padding: '15px 30px',
                  fontSize: '20px',
                  backgroundColor: '#6b7280',
                  color: '#ffffff',
                  border: '3px solid #000000',
                  cursor: 'pointer',
                  textShadow: '2px 2px 0px #000000',
                  boxShadow: '4px 4px 0px #000000'
                }}
              >
                {showSettings ? 'HIDE SETTINGS' : 'SETTINGS'}
              </button>
              
              {showSettings && (
                <div style={{
                  backgroundColor: '#374151',
                  border: '3px solid #000000',
                  padding: '20px',
                  width: '100%'
                }}>
                  <h3 className="pixelify-sans" style={{
                    color: '#ffffff',
                    fontSize: '18px',
                    textShadow: '2px 2px 0px #000000',
                    margin: '0 0 15px 0'
                  }}>AUDIO SETTINGS</h3>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label className="pixelify-sans" style={{
                      color: '#ffffff',
                      fontSize: '14px',
                      display: 'block',
                      marginBottom: '8px'
                    }}>Music Volume: {Math.round(musicVolume * 100)}%</label>
                    
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                      style={{
                        width: '100%',
                        height: '20px',
                        background: '#1f2937',
                        border: '2px solid #000000'
                      }}
                    />
                  </div>
                  
                  <button
                    className="pixelify-sans pixel-button"
                    onClick={playRandomTrack}
                    style={{
                      padding: '10px 20px',
                      fontSize: '14px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: '2px solid #000000',
                      cursor: 'pointer',
                      textShadow: '1px 1px 0px #000000',
                      boxShadow: '2px 2px 0px #000000'
                    }}
                  >
                    SKIP TRACK
                  </button>
                </div>
              )}
              
              <div style={{
                backgroundColor: '#374151',
                border: '3px solid #000000',
                padding: '20px',
                marginTop: '10px'
              }}>
                <h3 className="pixelify-sans" style={{
                  color: '#ffffff',
                  fontSize: '18px',
                  textShadow: '2px 2px 0px #000000',
                  margin: '0 0 15px 0'
                }}>CONTROLS</h3>
                
                <div className="pixelify-sans" style={{
                  color: '#ffffff',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  <div><strong>WASD / Arrow Keys:</strong> Move car</div>
                  <div><strong>SPACE:</strong> Shoot</div>
                  <div><strong>SHIFT:</strong> Sprint (faster movement)</div>
                  <div><strong>CTRL:</strong> Handbrake (sharp turns)</div>
                  <div><strong>ESC:</strong> Pause/Resume game</div>
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#374151',
                border: '3px solid #000000',
                padding: '20px'
              }}>
                <h3 className="pixelify-sans" style={{
                  color: '#ffffff',
                  fontSize: '18px',
                  textShadow: '2px 2px 0px #000000',
                  margin: '0 0 15px 0'
                }}>OBJECTIVE</h3>
                
                <div className="pixelify-sans" style={{
                  color: '#ffffff',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  <div>• Survive and eliminate other players</div>
                  <div>• Collect fuel tanks to keep moving</div>
                  <div>• Avoid obstacles and enemy cars</div>
                  <div>• Score points by eliminating enemies</div>
                  <div>• You have 3 lives - don't waste them!</div>
                </div>
              </div>
              
              <button
                className="pixelify-sans pixel-button"
                onClick={() => {
                  if (socketRef.current) {
                    socketRef.current.disconnect();
                  }
                  window.location.reload();
                }}
                style={{
                  padding: '15px 30px',
                  fontSize: '20px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: '3px solid #000000',
                  cursor: 'pointer',
                  textShadow: '2px 2px 0px #000000',
                  boxShadow: '4px 4px 0px #000000'
                }}
              >
                QUIT TO MENU
              </button>
            </div>
            
            <div className="pixelify-sans" style={{
              color: '#9ca3af',
              fontSize: '12px',
              textAlign: 'center'
            }}>
              Press ESC to resume
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;