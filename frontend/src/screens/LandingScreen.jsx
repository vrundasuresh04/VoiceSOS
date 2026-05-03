import React, { useEffect, useState } from 'react';
import { Shield, ChevronRight } from 'lucide-react';
import { checkHealth } from '../services/api';

const LandingScreen = ({ onNext, classifyDistress, datasetInfo }) => {
  const [health, setHealth] = useState('Checking backend...');
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const checkBackend = async () => {
      const res = await checkHealth();
      if (res && res.status === 'ok') {
        setHealth('Backend Connected ✅');
      } else {
        setHealth('Backend Disconnected ❌');
      }
    };
    checkBackend();
  }, []);

  const handleTest = () => {
    if (classifyDistress) {
      const result = classifyDistress(testInput);
      setTestResult(result);
    }
  };

  return (
    <div className="screen justify-center items-center text-center">
      <div style={{ marginBottom: '3rem' }}>
        <Shield size={100} className="text-neon" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 20px var(--neon-blue-glow))' }} />
        <h1 className="text-neon mt-4" style={{ fontSize: '2.5rem' }}>VoiceSOS</h1>
        <p className="mt-1">AI-Powered Women's Safety</p>
      </div>
      
      <div className="glass-card mb-4" style={{ padding: '0.75rem 1.5rem', borderRadius: '30px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: health.includes('✅') ? 'var(--success-green)' : 'var(--warning-yellow)' }}>
          {health}
        </p>
      </div>

      <button className="btn btn-primary" onClick={onNext} style={{ marginTop: '2rem' }}>
        Get Started <ChevronRight size={20} />
      </button>

      {datasetInfo && (
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #333', borderRadius: '10px', textAlign: 'left', fontSize: '0.8rem', width: '100%', maxWidth: '300px' }}>
          <p style={{ margin: '0.2rem 0' }}><strong>AI Engine:</strong> Custom Distress Classifier</p>
          <p style={{ margin: '0.2rem 0' }}><strong>Dataset:</strong> {datasetInfo.totalSamples} samples (custom-built, no Kaggle)</p>
          <p style={{ margin: '0.2rem 0' }}><strong>Method:</strong> Fuzzy matching + weighted scoring</p>
        </div>
      )}

      {classifyDistress && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed #555', borderRadius: '10px', textAlign: 'left', fontSize: '0.85rem', width: '100%', maxWidth: '300px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Test AI</h4>
          <input 
            type="text" 
            value={testInput} 
            onChange={(e) => setTestInput(e.target.value)} 
            placeholder="Type a phrase..."
            style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem', borderRadius: '5px', background: '#1a1a1a', color: '#fff', border: '1px solid #333' }}
          />
          <button onClick={handleTest} style={{ padding: '0.5rem 1rem', background: '#00f0ff', color: '#000', borderRadius: '5px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}>
            Test AI
          </button>
          
          {testResult && (
            <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '5px' }}>
              <p style={{ margin: '0.2rem 0' }}><strong>Confidence:</strong> {testResult.confidence}%</p>
              <p style={{ margin: '0.2rem 0' }}><strong>Label:</strong> {testResult.label}</p>
              <p style={{ margin: '0.2rem 0' }}><strong>Reasons:</strong></p>
              <ul style={{ paddingLeft: '1.2rem', margin: '0.2rem 0 0 0' }}>
                {testResult.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LandingScreen;
