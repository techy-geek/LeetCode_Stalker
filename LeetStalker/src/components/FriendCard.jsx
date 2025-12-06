import React from 'react';
import SolvedCircle from './SolvedCircle';

const FriendCard = ({ data, onRemove }) => {
  const easy = data.easy || 0;
  const medium = data.medium || 0;
  const hard = data.hard || 0;
  const total = data.totalSolved || 0;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    // CHANGE 1: Add Gold Border if it's YOUR card (when onRemove is undefined)
    <div className="card" style={!onRemove ? {border: '1px solid #ffa116'} : {}}>
      
      {/* 1. Header */}
      <div className="card-header">
        <a href={`https://leetcode.com/${data.username}`} target="_blank" rel="noreferrer" className="username">
          {data.username} 
          {/* CHANGE 2: Add "(You)" label */}
          {!onRemove && <span style={{fontSize:'0.8rem', color:'#ffa116', marginLeft:'6px'}}>(You)</span>}
        </a>
        
        {/* CHANGE 3: Only show Delete button if onRemove exists */}
        {onRemove && (
          <button className="delete-btn" onClick={() => onRemove(data.username)}>✕</button>
        )}
      </div>

      {/* 2. Main Content */}
      <div className="card-content" style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
        
        {/* LEFT: Circular Counter */}
        <SolvedCircle easy={easy} medium={medium} hard={hard} total={total} />

        {/* RIGHT: Stats */}
        <div style={{flexGrow: 1}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '8px'}}>
            <div style={{textAlign: 'center'}}>
               <div style={{color: '#888', fontSize: '0.7rem'}}>Rank</div>
               <div style={{color: 'white', fontWeight: '600'}}>
                 #{data.contestStats?.globalRank?.toLocaleString() || 'N/A'}
               </div>
            </div>
            <div style={{textAlign: 'center'}}>
               <div style={{color: '#888', fontSize: '0.7rem'}}>Rating</div>
               <div style={{color: 'white', fontWeight: '600'}}>
                 {data.contestStats?.rating || 'N/A'}
               </div>
            </div>
          </div>

          <div className="difficulty-stack" style={{gap: '5px'}}>
             <div className="diff-box" style={{padding: '4px 8px', fontSize: '0.75rem'}}>
               <span className="easy-txt">Easy : </span><span className="count-val">{easy}</span>
             </div>
             <div className="diff-box" style={{padding: '4px 8px', fontSize: '0.75rem'}}>
               <span className="med-txt">Medium : </span><span className="count-val">{medium}</span>
             </div>
             <div className="diff-box" style={{padding: '4px 8px', fontSize: '0.75rem'}}>
               <span className="hard-txt">Hard : </span><span className="count-val">{hard}</span>
             </div>
          </div>
        </div>
      </div>

      {/* 3. Footer: Last Activity (Clickable) */}
      {data.lastSolved && (
        <div style={{marginTop: '15px', paddingTop: '8px', borderTop: '1px solid #333', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
           <div style={{display:'flex', gap:'5px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
             <span style={{color: '#888'}}>Last:</span>
             <a 
               href={`https://leetcode.com/problems/${data.lastSolved.titleSlug}`} 
               target="_blank" 
               rel="noreferrer"
               className="problem-link"
               title={data.lastSolved.title}
             >
               {data.lastSolved.title}
             </a>
           </div>
           <span style={{color: '#666', minWidth:'50px', textAlign:'right'}}>
             {formatTime(data.lastSolved.timestamp)}
           </span>
        </div>
      )}
    </div>
  );
};

export default FriendCard;