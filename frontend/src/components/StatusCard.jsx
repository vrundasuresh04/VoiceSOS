import React from 'react';

const StatusCard = ({ title, status, icon: Icon, colorClass }) => {
  return (
    <div className="glass-card flex items-center gap-4">
      <div style={{ padding: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}>
        {Icon && <Icon size={24} className={colorClass} />}
      </div>
      <div className="flex-1">
        <p style={{ fontSize: '0.8rem', marginBottom: '2px' }}>{title}</p>
        <h4 style={{ margin: 0 }}>{status}</h4>
      </div>
    </div>
  );
};

export default StatusCard;
