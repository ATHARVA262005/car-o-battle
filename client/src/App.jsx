import React, { useState } from 'react';
import Game from './Game';
import GameOver from './GameOver';
import welcomeScreen from './assets/welcome_screen.png';

const App = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [showNameInput, setShowNameInput] = useState(false);



  const handleGameOver = (score) => {
    setFinalScore(score);
    setGameOver(true);
    setGameStarted(false);
  };

  const handleRestart = () => {
    setGameOver(false);
    setGameStarted(true);
  };

  const handleMainMenu = () => {
    setGameOver(false);
    setGameStarted(false);
    setPlayerName('');
  };

  if (gameOver) {
    return (
      <GameOver 
        score={finalScore}
        onRestart={handleRestart}
        onMainMenu={handleMainMenu}
      />
    );
  }

  if (gameStarted) {
    return <Game playerName={playerName} onGameOver={handleGameOver} />;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundImage: `url(${welcomeScreen})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      
      {/* Buttons positioned in single column */}
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        zIndex: 10
      }}>
        <button
          className="pixelify-sans pixel-button"
          onClick={() => setShowNameInput(true)}
          style={{
            padding: '18px 50px',
            fontSize: '28px',
            backgroundColor: '#ea580c',
            color: '#ffffff',
            border: '4px solid #000000',
            borderRadius: '0px',
            cursor: 'pointer',
            textShadow: '3px 3px 0px #000000',
            boxShadow: '6px 6px 0px #000000, inset 2px 2px 0px #fb923c',
            position: 'relative',
            transition: 'all 0.1s ease',
            imageRendering: 'pixelated'
          }}
          onMouseDown={(e) => {
            e.target.style.transform = 'translate(3px, 3px)';
            e.target.style.boxShadow = '3px 3px 0px #000000, inset 2px 2px 0px #fb923c';
          }}
          onMouseUp={(e) => {
            e.target.style.transform = 'translate(0px, 0px)';
            e.target.style.boxShadow = '6px 6px 0px #000000, inset 2px 2px 0px #fb923c';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translate(0px, 0px)';
            e.target.style.boxShadow = '6px 6px 0px #000000, inset 2px 2px 0px #fb923c';
          }}
        >
          START MULTIPLAYER
        </button>
        
        <button
          className="pixelify-sans pixel-button"
          style={{
            padding: '18px 50px',
            fontSize: '28px',
            backgroundColor: '#6b7280',
            color: '#ffffff',
            border: '4px solid #000000',
            borderRadius: '0px',
            cursor: 'pointer',
            textShadow: '3px 3px 0px #000000',
            boxShadow: '6px 6px 0px #000000, inset 2px 2px 0px #9ca3af',
            position: 'relative',
            transition: 'all 0.1s ease',
            imageRendering: 'pixelated'
          }}
          onMouseDown={(e) => {
            e.target.style.transform = 'translate(3px, 3px)';
            e.target.style.boxShadow = '3px 3px 0px #000000, inset 2px 2px 0px #9ca3af';
          }}
          onMouseUp={(e) => {
            e.target.style.transform = 'translate(0px, 0px)';
            e.target.style.boxShadow = '6px 6px 0px #000000, inset 2px 2px 0px #9ca3af';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translate(0px, 0px)';
            e.target.style.boxShadow = '6px 6px 0px #000000, inset 2px 2px 0px #9ca3af';
          }}
        >
          ⚙️ SETTINGS
        </button>
      </div>
      
      {/* Name Input Modal */}
      {showNameInput && (
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
          zIndex: 20
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            border: '4px solid #000000',
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center'
          }}>
            <h2 className="pixelify-sans" style={{
              color: '#ffffff',
              fontSize: '24px',
              textShadow: '2px 2px 0px #000000',
              margin: 0
            }}>ENTER PLAYER NAME</h2>
            
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              className="pixelify-sans"
              style={{
                padding: '12px 20px',
                fontSize: '18px',
                border: '3px solid #000000',
                backgroundColor: '#ffffff',
                color: '#000000',
                outline: 'none',
                minWidth: '250px',
                textAlign: 'center'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && playerName.trim()) {
                  setGameStarted(true);
                  setShowNameInput(false);
                }
              }}
              autoFocus
            />
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                className="pixelify-sans pixel-button"
                onClick={() => {
                  if (playerName.trim()) {
                    setGameStarted(true);
                    setShowNameInput(false);
                  }
                }}
                disabled={!playerName.trim()}
                style={{
                  padding: '12px 25px',
                  fontSize: '18px',
                  backgroundColor: playerName.trim() ? '#22c55e' : '#6b7280',
                  color: '#ffffff',
                  border: '3px solid #000000',
                  cursor: playerName.trim() ? 'pointer' : 'not-allowed',
                  textShadow: '2px 2px 0px #000000',
                  boxShadow: '4px 4px 0px #000000'
                }}
              >
                JOIN GAME
              </button>
              
              <button
                className="pixelify-sans pixel-button"
                onClick={() => setShowNameInput(false)}
                style={{
                  padding: '12px 25px',
                  fontSize: '18px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: '3px solid #000000',
                  cursor: 'pointer',
                  textShadow: '2px 2px 0px #000000',
                  boxShadow: '4px 4px 0px #000000'
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Made with love credit */}
      <div style={{
        position: 'absolute',
        bottom: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5
      }}>
        <div className="pixelify-sans" style={{
          color: '#ffffff',
          fontSize: '14px',
          textShadow: '2px 2px 0px #000000',
          textAlign: 'center'
        }}>
          Made with ❤️ by{' '}
          <a 
            href="https://www.linkedin.com/in/atharvaralegankar" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Atharva Ralegankar
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;