import React from 'react';
import gameOverBg from './assets/game_over_bg.png';

const GameOver = ({ score, onRestart, onMainMenu }) => {

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundImage: `url(${gameOverBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      
      {/* Score and buttons positioned together in lower area */}
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 10
      }}>
        {/* Score above buttons */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <div className="pixelify-sans" style={{
            fontSize: '2.5rem',
            color: '#fbbf24',
            textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
            marginBottom: '0.5rem'
          }}>
            {score}
          </div>
          <div style={{
            fontSize: '1.2rem',
            color: '#ffffff',
            textShadow: '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000'
          }}>
            FINAL SCORE
          </div>
        </div>
        
        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center'
        }}>
        <button
          className="pixelify-sans"
          onClick={onRestart}
          style={{
            padding: '12px 30px',
            fontSize: '20px',
            backgroundColor: '#22c55e',
            color: 'white',
            border: '3px solid #000',
            borderRadius: '0px',
            cursor: 'pointer',
            textShadow: '2px 2px 0px #000',
            boxShadow: '4px 4px 0px #000'
          }}
        >
          RESTART
        </button>
        
        <button
          className="pixelify-sans"
          onClick={onMainMenu}
          style={{
            padding: '12px 30px',
            fontSize: '20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: '3px solid #000',
            borderRadius: '0px',
            cursor: 'pointer',
            textShadow: '2px 2px 0px #000',
            boxShadow: '4px 4px 0px #000'
          }}
        >
          QUIT
        </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;