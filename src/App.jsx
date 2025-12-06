// src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import FriendCard from '../LeetStalker/src/components/FriendCard';
import Login from '../LeetStalker/src/components/Login';

function App() {
  const [myUsername, setMyUsername] = useState(localStorage.getItem('lc_user') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('lc_user'));
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friendInput, setFriendInput] = useState('');

  // Auto-fetch on load if already logged in
  useEffect(() => {
    if (isLoggedIn && myUsername) {
      fetchFriends();
    }
  }, [isLoggedIn, myUsername]);

  const handleLogin = async (user) => {
    if (!user) return;
    try {
      await axios.post('http://localhost:3000/login', { username: user });
      localStorage.setItem('lc_user', user); // Save session
      setMyUsername(user);
      setIsLoggedIn(true);
    } catch (error) {
      alert("Login Error: Is backend running?");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lc_user');
    setIsLoggedIn(false);
    setFriends([]);
  };

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/friends/${myUsername}`);
      // Sort by Rating (descending) so highest rated friends appear first
      const sorted = res.data.sort((a, b) => (b.contestStats?.rating || 0) - (a.contestStats?.rating || 0));
      setFriends(sorted);
    } catch (error) {
      console.error("Fetch error", error);
    }
    setLoading(false);
  };

  const addFriend = async () => {
    if (!friendInput) return;
    try {
      // Optimistic Update: You could add a fake card here instantly, 
      // but we will wait for server verification to be safe.
      await axios.post('http://localhost:3000/add-friend', {
        username: myUsername,
        friendUsername: friendInput
      });
      setFriendInput('');
      fetchFriends(); // Refresh to show new friend
    } catch (error) {
      alert("User not found on LeetCode");
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="container">
      <header>
        <h1>Leet<span className="highlight">Tracker</span> / {myUsername}</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <div className="input-group">
        <input 
          placeholder="Add friend by LeetCode username..." 
          value={friendInput}
          onChange={(e) => setFriendInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addFriend()}
        />
        <button onClick={addFriend}>+ Track</button>
      </div>

      {loading && <div className="loading">Syncing latest data from LeetCode...</div>}

      <div className="grid">
        {friends.map((friend) => (
          <FriendCard key={friend.username} data={friend} />
        ))}
      </div>
      
      {!loading && friends.length === 0 && (
        <div className="loading">No friends tracked yet. Add one above!</div>
      )}
    </div>
  );
}

export default App;