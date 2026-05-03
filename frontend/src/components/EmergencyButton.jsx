import React from 'react';
import { Mic, Shield } from 'lucide-react';

const EmergencyButton = ({ onTrigger, isListening }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
      <button 
        onClick={onTrigger}
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: isListening ? 'var(--warning-yellow)' : 'var(--danger-red)',
          border: `8px solid ${isListening ? 'rgba(255, 204, 0, 0.3)' : 'rgba(255, 59, 48, 0.3)'}`,
          boxShadow: `0 0 40px ${isListening ? 'rgba(255, 204, 0, 0.5)' : 'rgba(255, 59, 48, 0.5)'}`,
          color: isListening ? '#000' : '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
      >
        {isListening ? <Mic size={64} /> : <Shield size={64} />}
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          {isListening ? 'LISTENING...' : 'TAP FOR SOS'}
        </span>
      </button>
    </div>
  );
};

export default EmergencyButton;
