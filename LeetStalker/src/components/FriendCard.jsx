import React, { useState } from 'react';
import SolvedCircle from './SolvedCircle';

const FriendCard = ({ data, onRemove, goal, onSetGoal }) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal || 0);

  // Safety check
  if (!data) return null;

  const easy = data.easy || 0;
  const medium = data.medium || 0;
  const hard = data.hard || 0;
  const total = data.totalSolved || 0;
  
  const displayBadges = data.badges ? data.badges.slice(0, 3) : [];

  // --- GOAL LOGIC ---
  const isOwner = !!onSetGoal; // If onSetGoal exists, this is YOUR card
  const progress = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;
  const isGoalMet = total >= goal && goal > 0;

  const handleSaveGoal = () => {
    onSetGoal(Number(tempGoal));
    setIsEditingGoal(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card" style={!onRemove ? {border: '1px solid #ffa116'} : {}}>
      
      {/* 1. Header */}
      <div className="card-header">
        <div style={{display:'flex', alignItems:'center'}}>
            <a href={`https://leetcode.com/${data.username}`} target="_blank" rel="noreferrer" className="username">
            {data.username}
            </a>
            {!onRemove && <span style={{fontSize:'0.8rem', color:'#ffa116', marginLeft:'6px', fontWeight: 'bold'}}>(You)</span>}
        </div>
        
        {onRemove && (
          <button className="delete-btn" onClick={() => onRemove(data.username)}>✕</button>
        )}
      </div>

      {/* 2. Main Content */}
      <div className="card-content" style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
        <SolvedCircle easy={easy} medium={medium} hard={hard} total={total} />

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
                 {data.contestStats?.rating ? Math.round(data.contestStats.rating) : 'N/A'}
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

      {/* --- 3. NEW: PERSONAL GOAL TRACKER (Only shows if it is YOU) --- */}
      {isOwner && (
        <div style={{marginTop: '15px', background: '#222', padding: '10px', borderRadius: '8px'}}>
          
          {/* Header Row: Title + Edit Button */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
             <span style={{fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
               Goal
             </span>
             <button 
               onClick={() => setIsEditingGoal(!isEditingGoal)}
               style={{background: 'none', border: 'none', color: '#666', fontSize: '0.7rem', cursor: 'pointer', padding: 0}}
             >
               {isEditingGoal ? 'Cancel' : 'Edit'}
             </button>
          </div>

          {/* Logic: Show Input if editing, otherwise show Progress Bar */}
          {isEditingGoal ? (
             <div style={{display: 'flex', gap: '5px'}}>
               <input 
                 type="number" 
                 value={tempGoal} 
                 onChange={(e) => setTempGoal(e.target.value)}
                 className="dark-select"
                 style={{padding: '4px 8px', fontSize: '0.9rem', width: '80px'}}
                 placeholder="Target"
               />
               <button onClick={handleSaveGoal} className="primary-btn" style={{padding: '4px 10px', fontSize: '0.8rem'}}>
                 Save
               </button>
             </div>
          ) : (
             <div>
               {/* Progress Bar Container */}
               <div style={{height: '8px', background: '#444', borderRadius: '4px', overflow: 'hidden', marginBottom: '5px'}}>
                  <div style={{
                    height: '100%', 
                    width: `${progress}%`, 
                    background: isGoalMet ? '#00b8a3' : '#ffa116', // Teal if done, Orange if working
                    transition: 'width 0.5s ease'
                  }}></div>
               </div>
               
               {/* Text Status */}
               <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem'}}>
                  <span style={{color: 'white'}}>
                    {total} <span style={{color:'#666'}}>/ {goal > 0 ? goal : '?'} Solved</span>
                  </span>
                  <span style={{color: isGoalMet ? '#00b8a3' : '#ffa116', fontWeight: 'bold'}}>
                    {goal > 0 ? Math.round(progress) + '%' : 'Set Target'}
                  </span>
               </div>
             </div>
          )}
        </div>
      )}

      {/* 4. Badges (Existing code) */}
      {displayBadges.length > 0 && (
        <div style={{display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #333', alignItems: 'center'}}>
          {displayBadges.map((badge, idx) => {
             let iconUrl = badge.icon;
             if (iconUrl && !iconUrl.startsWith('http')) {
                 if (!iconUrl.startsWith('/')) iconUrl = '/' + iconUrl;
                 iconUrl = `https://leetcode.com${iconUrl}`;
             }
             if (!iconUrl) return null;
             return (
                <img key={idx} src={iconUrl} alt="Badge" title={badge.displayName} style={{width: '35px', height: '35px', objectFit: 'contain'}} />
             );
          })}
        </div>
      )}

      {/* 5. Footer (Existing code) */}
      {data.lastSolved && (
        <div style={{marginTop: '15px', paddingTop: '8px', borderTop: '1px solid #333', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
           <div style={{display:'flex', gap:'5px', overflow:'hidden', maxWidth: '75%'}}>
             <span style={{color: '#888'}}>Last:</span>
             <a href={`https://leetcode.com/problems/${data.lastSolved.titleSlug}`} target="_blank" rel="noreferrer" className="problem-link" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
               {data.lastSolved.title}
             </a>
           </div>
           <span style={{color: '#666', fontSize: '0.75rem'}}>{formatTime(data.lastSolved.timestamp)}</span>
        </div>
      )}
    </div>
  );
};

export default FriendCard;