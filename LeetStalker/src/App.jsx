import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Login from './components/Login';
import FriendCard from './components/FriendCard';
import CompareWidget from './components/CompareWidget';
import DailyChallenge from './components/DailyChallenge';
function App() {
  // --- STATE MANAGEMENT ---
  const [myUsername, setMyUsername] = useState(localStorage.getItem('lc_user') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('lc_user'));
  
  // Data States
  const [friends, setFriends] = useState([]);
  const [myStats, setMyStats] = useState(null); // Store YOUR stats for comparison
  
  // UI States
  const [newFriend, setNewFriend] = useState('');
  const [loading, setLoading] = useState(false);

  // --- EFFECTS ---
  
  // When logged in, fetch both Friends List AND My Personal Stats
  useEffect(() => {
    if (isLoggedIn && myUsername) {
      refreshFriends();
      fetchMyStats();
    }
  }, [isLoggedIn, myUsername]);

  // --- API FUNCTIONS ---

  // 1. LOGIN (With Verification)
  const handleLogin = async (user) => {
    if (!user) return;
    try {
      // The backend checks if the user exists on LeetCode first
      await axios.post('http://localhost:3000/login', { username: user });
      
      localStorage.setItem('lc_user', user);
      setMyUsername(user);
      setIsLoggedIn(true);
    } catch (error) {
      // 1. Get the specific error message (e.g., "User not found")
      const msg = error.response?.data?.error || "Login failed. Is backend running?";
      
      // 2. CRITICAL: Throw the error so Login.jsx can catch it and stop the spinner
      throw new Error(msg); 
    }
  };

  // 2. FETCH MY STATS (For "Me vs Them" Chart)
  const fetchMyStats = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/stats/${myUsername}`);
      setMyStats(res.data);
    } catch (error) {
      console.error("Failed to fetch my stats");
    }
  };

  // 3. FETCH FRIENDS LIST
  const refreshFriends = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/friends/${myUsername}`);
      // Sort: Highest Rating First
      const sorted = response.data.sort((a, b) => 
        (b.contestStats?.rating || 0) - (a.contestStats?.rating || 0)
      );
      setFriends(sorted);
    } catch (error) {
      console.error("Failed to fetch friends");
    }
    setLoading(false);
  };

  // 4. ADD FRIEND
  const addFriend = async () => {
    if (!newFriend) return;
    // Don't add yourself as a friend
    if (newFriend.toLowerCase() === myUsername.toLowerCase()) {
      alert("You cannot add yourself!");
      return;
    }

    try {
      await axios.post('http://localhost:3000/add-friend', {
        username: myUsername,
        friendUsername: newFriend
      });
      setNewFriend('');
      refreshFriends(); // Refresh to show new card
    } catch (error) {
      alert("User not found on LeetCode!");
    }
  };

  // 5. REMOVE FRIEND
  const removeFriend = async (friendUsername) => {
    if (!confirm(`Remove ${friendUsername}?`)) return;

    // Optimistic UI Update (Remove instantly)
    setFriends(friends.filter(f => f.username !== friendUsername));

    try {
      await axios.post('http://localhost:3000/remove-friend', {
        username: myUsername,
        friendUsername: friendUsername
      });
    } catch (error) {
      alert("Failed to update database");
    }
  };

  // 6. LOGOUT
  const logout = () => {
    localStorage.removeItem('lc_user');
    setIsLoggedIn(false);
    setFriends([]);
    setMyStats(null);
  };

  // --- RENDER ---

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // src/App.jsx

 return (
    <div className="container">
      {/* Header */}
      <div className="header-row">
        <h2>Dashboard: <span style={{color:'#ffa116'}}>{myUsername}</span></h2>
        <button onClick={logout}>Logout</button>
      </div>

      {/* --- NEW FEATURE: DAILY CHALLENGE WIDGET --- */}
      {/* This sits right below the header for maximum visibility */}
      <DailyChallenge />
      {/* ------------------------------------------- */}

      {/* Input Group */}
      <div className="input-group">
        <input 
          placeholder="Enter username (e.g. neal_wu)..." 
          value={newFriend}
          onChange={(e) => setNewFriend(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addFriend()}
        />
        <button className="primary-btn" onClick={addFriend}>
          {loading ? '...' : '+ Add Friend'}
        </button>
      </div>

      {/* SECTION 1: BATTLE WIDGET */}
      {myStats && friends.length > 0 && (
        <CompareWidget myStats={myStats} friends={friends} />
      )}

      {/* SECTION 2: MY PROFILE CARD */}
      {myStats && (
        <div style={{marginBottom: '40px'}}>
           <h3 style={{color: '#888', borderBottom:'1px solid #333', paddingBottom:'10px'}}>My Stats</h3>
           <div className="grid">
             <FriendCard data={myStats} /> 
           </div>
        </div>
      )}

      {/* SECTION 3: FRIENDS GRID */}
      {friends.length > 0 && (
        <>
          <h3 style={{color: '#888', borderBottom:'1px solid #333', paddingBottom:'10px', marginTop:'30px'}}>
            Tracking ({friends.length})
          </h3>
          <div className="grid">
            {friends.map((friend) => (
              <FriendCard 
                key={friend.username} 
                data={friend} 
                onRemove={removeFriend} 
              />
            ))}
          </div>
        </>
      )}
      
      {/* Empty State */}
      {!loading && friends.length === 0 && !myStats && (
         <div style={{textAlign:'center', marginTop:'50px', color:'#666'}}>
           <h3>Welcome to LeetTracker</h3>
           <p>Enter your username above to get started.</p>
         </div>
      )}
    </div>
  );
}

export default App;