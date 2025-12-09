import React from 'react';

const Leaderboard = ({ friendsData, onClose }) => {
  
  // Sort Logic: Total Solved (Highest first)
  const sortedFriends = [...friendsData].sort((a, b) => {
    // Handle both data structures (your stats vs friend stats)
    const totalA = (a.totalSolved) || (a.easy + a.medium + a.hard) || 0;
    const totalB = (b.totalSolved) || (b.easy + b.medium + b.hard) || 0;
    return totalB - totalA; 
  });

  const getRankStyle = (index) => {
    if (index === 0) return { color: '#FFD700', fontSize: '1.3rem', textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' }; // 🥇 Gold
    if (index === 1) return { color: '#C0C0C0', fontSize: '1.2rem' }; // 🥈 Silver
    if (index === 2) return { color: '#CD7F32', fontSize: '1.2rem' }; // 🥉 Bronze
    return { color: '#888', fontSize: '1rem' };
  };

  const getMedalIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    // BACKDROP
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backdropFilter: 'blur(5px)'
    }} onClick={onClose}>
      
      {/* MODAL BOX */}
      <div style={{
        background: '#1a1a1a',
        width: '90%', maxWidth: '700px', maxHeight: '85vh',
        borderRadius: '16px',
        border: '1px solid #333',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.25s ease-out'
      }} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div style={{ padding: '20px', background:'#222', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
             <span style={{fontSize:'1.5rem'}}>🏆</span>
             <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Live Leaderboard</h2>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer', padding:'0 5px' }}
          >✕</button>
        </div>

        {/* TABLE WRAPPER */}
        <div style={{ overflowY: 'auto', padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ccc' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#1a1a1a', zIndex: 1 }}>
              <tr style={{ borderBottom: '1px solid #333', textAlign: 'left', color: '#666', fontSize: '0.8rem', textTransform:'uppercase' }}>
                <th style={{ padding: '15px' }}>Rank</th>
                <th style={{ padding: '15px' }}>Coder</th>
                <th style={{ padding: '15px' }}>Total Solved</th>
                <th style={{ padding: '15px' }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {sortedFriends.map((friend, index) => {
                const total = (friend.totalSolved) || (friend.easy + friend.medium + friend.hard) || 0;
                const rating = friend.contestStats?.rating ? Math.round(friend.contestStats.rating) : 'N/A';
                
                // AVATAR LOGIC
                const avatarUrl = friend.avatar || "https://assets.leetcode.com/users/default_avatar.jpg";

                return (
                  <tr key={friend.username} style={{ 
                      borderBottom: '1px solid #252525',
                      background: index === 0 ? 'rgba(255, 215, 0, 0.05)' : 'transparent' // Slight gold tint for #1
                  }}>
                    {/* Rank */}
                    <td style={{ padding: '15px', fontWeight: 'bold', ...getRankStyle(index) }}>
                      {getMedalIcon(index)}
                    </td>

                    {/* User Profile (Avatar + Name) */}
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* THE AVATAR IMAGE */}
                        <img 
                          src={avatarUrl} 
                          alt="DP" 
                          onError={(e) => {e.target.src="https://assets.leetcode.com/users/default_avatar.jpg"}} // Fallback if link breaks
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            objectFit: 'cover',
                            border: index === 0 ? '2px solid #FFD700' : '2px solid #333' // Gold border for winner
                          }} 
                        />
                        <span style={{ color: '#fff', fontWeight: 'bold', fontSize:'0.95rem' }}>
                            {friend.username}
                        </span>
                      </div>
                    </td>

                    {/* Stats */}
                    <td style={{ padding: '15px', color: '#fff', fontSize: '1rem' }}>
                       {total}
                    </td>
                    <td style={{ padding: '15px', color: '#888' }}>
                       {rating}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;