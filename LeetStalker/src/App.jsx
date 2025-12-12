import { useState, useEffect } from "react";
import axios from "axios";
const API_URL = "http//localhost:3000"
import "./App.css";
import Login from "./components/Login";
import FriendCard from "./components/FriendCard";
import CompareWidget from "./components/CompareWidget";
import DailyChallenge from "./components/DailyChallenge";
import Leaderboard from "./components/LeaderBoard";
import Notifications from './components/Notifications';



function App() {
  // --- STATE MANAGEMENT ---
  const [myUsername, setMyUsername] = useState(
    localStorage.getItem("lc_user") || ""
  );
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("lc_user")
  );

  // Notification State
  const [notifications, setNotifications] = useState([]);

  // 1. Sort Options (For the Grid)
  const [sortOption, setSortOption] = useState("rank");

  // 2. Modal State
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // 3. Notification Dropdown State
  const [showNotifications, setShowNotifications] = useState(false);

  // Data States
  const [friends, setFriends] = useState([]);
  const [myStats, setMyStats] = useState(null);

  // Load saved goal from local storage
  const [userGoal, setUserGoal] = useState(
    Number(localStorage.getItem("lc_goal")) || 0
  );

  // UI States
  const [newFriend, setNewFriend] = useState("");
  const [loading, setLoading] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    if (isLoggedIn && myUsername) {
      refreshFriends();
      refreshFriends();
      fetchMyStats();
      fetchNotifications();
    }
  }, [isLoggedIn, myUsername]);

  // --- API FUNCTIONS ---

  // 1. LOGIN
  const handleLogin = async (user) => {
    if (!user) return;
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username: user,
      });

      // Save User
      localStorage.setItem("lc_user", user);
      setMyUsername(user);
      setIsLoggedIn(true);

      // Set Notifications from login response
      setNotifications(response.data.notifications || []);

    } catch (error) {
      const msg = error.response?.data?.error || "Login failed. Is backend running?";
      throw new Error(msg);
    }
  };

  // 2. CLEAR NOTIFICATIONS (This was missing)
  const handleClearNotifications = async () => {
    try {
      await axios.post(`${API_URL}/clear-notifications`, { username: myUsername });
      setNotifications([]); // Clear UI immediately
    } catch (error) {
      console.error("Could not clear notifications");
    }
  };

  const handleUpdateGoal = (newGoal) => {
    setUserGoal(newGoal);
    localStorage.setItem("lc_goal", newGoal);
  };

  const fetchMyStats = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/stats/${myUsername}`
      );
      setMyStats(res.data);
    } catch (error) {
      console.error("Failed to fetch my stats");
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications/${myUsername}`);
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  const refreshFriends = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/friends/${myUsername}`
      );
      setFriends(response.data);
    } catch (error) {
      console.error("Failed to fetch friends");
    }
    setLoading(false);
  };

  const addFriend = async () => {
    if (!newFriend) return;
    if (newFriend.toLowerCase() === myUsername.toLowerCase()) {
      alert("You cannot add yourself!");
      return;
    }
    try {
      await axios.post(`${API_URL}/add-friend`, {
        username: myUsername,
        friendUsername: newFriend,
      });
      setNewFriend("");
      refreshFriends();
    } catch (error) {
      alert("User not found on LeetCode!");
    }
  };

  const removeFriend = async (friendUsername) => {
    if (!confirm(`Remove ${friendUsername}?`)) return;

    try {
      await axios.post(`${API_URL}/remove-friend`, {
        username: myUsername,
        friendUsername: friendUsername,
      });
      refreshFriends(); // Refresh list after deleting
    } catch (error) {
      alert("Failed to update database");
    }
  };

  const logout = () => {
    localStorage.removeItem("lc_user");
    setIsLoggedIn(false);
    setFriends([]);
    setMyStats(null);
  };

  // --- SORTING LOGIC (For Grid View) ---
  const getSortedFriends = () => {
    let list = [...friends];
    return list.sort((a, b) => {
      switch (sortOption) {
        case 'rank':
          const rankA = (a.contestStats?.globalRank) || Infinity;
          const rankB = (b.contestStats?.globalRank) || Infinity;
          const safeA = rankA === 0 ? Infinity : rankA;
          const safeB = rankB === 0 ? Infinity : rankB;
          return safeA - safeB;
        case 'total':
          return (b.totalSolved || 0) - (a.totalSolved || 0);
        case 'hard':
          return (b.hard || 0) - (a.hard || 0);
        case 'recent':
          return (b.lastSolved?.timestamp || 0) - (a.lastSolved?.timestamp || 0);
        default:
          return 0;
      }
    });
  };

  const sortedFriendsData = getSortedFriends();

  // Combined Data for Leaderboard Modal (You + Friends)
  const allUsersData = myStats ? [myStats, ...friends] : friends;

  // --- RENDER ---
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="container">
      {/* HEADER */}
      <div className="header-row">
        <div>
          <h2>Dashboard</h2>
          <div style={{ color: "#888", fontSize: "0.9rem" }}>
            Welcome, <span style={{ color: "#ffa116" }}>{myUsername}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>

          {/* 3. LEADERBOARD BUTTON (Opens Modal) */}
          <button
            onClick={() => setShowLeaderboard(true)}
            style={{
              background: '#ffa116',
              color: '#040303ff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold'
            }}
          >
            🏆 Leaderboard
          </button>

          {/* SORT DROPDOWN (Always Visible now) */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <select
              className="dark-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{ minWidth: "120px", padding: "6px 10px" }}
            >
              <option value="rank">Global Rank</option>
              <option value="total">Total Solved</option>
              <option value="hard">Hard Problems</option>
              <option value="recent">Last Active</option>
            </select>
          </div>


          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: '#333',
                border: 'none',
                color: '#ffa116',
                padding: '8px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px'
              }}
            >
              🔔
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'red',
                  color: 'white',
                  fontSize: '0.7rem',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {/* DROPDOWN */}
            {showNotifications && (
              <Notifications
                messages={notifications}
                onClear={() => {
                  handleClearNotifications();
                  setShowNotifications(false);
                }}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          <button onClick={logout} className="delete-btn" style={{ padding: '6px 12px' }}>Logout</button>
        </div>
      </div>



      <DailyChallenge />

      {/* Input Group */}
      <div className="input-group">
        <input
          placeholder="Enter username (e.g. neal_wu)..."
          value={newFriend}
          onChange={(e) => setNewFriend(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addFriend()}
        />
        <button className="primary-btn" onClick={addFriend}>
          {loading ? "..." : "+ Add Friend"}
        </button>
      </div>

      {myStats && friends.length > 0 && (
        <CompareWidget myStats={myStats} friends={friends} />
      )}

      {/* 4. GRID VIEW (Always Rendered) */}
      {(friends.length > 0 || myStats) && (
        <>
          <h3 style={{ color: "#888", borderBottom: "1px solid #333", paddingBottom: "10px", marginTop: "30px" }}>
            Your Network
          </h3>

          <div className="grid">
            {/* Part A: You (Pinned) */}
            {myStats && (
              <FriendCard
                data={myStats}
                onRemove={undefined}
                goal={userGoal}
                onSetGoal={handleUpdateGoal}
              />
            )}
            {/* Part B: Friends (Sorted) */}
            {sortedFriendsData.map((friend) => (
              <FriendCard
                key={friend.username}
                data={friend}
                onRemove={removeFriend}
              />
            ))}
          </div>
        </>
      )}

      {!loading && friends.length === 0 && !myStats && (
        <div style={{ textAlign: "center", marginTop: "50px", color: "#666" }}>
          <h3>Welcome to LeetTracker</h3>
          <p>Enter your username above to get started.</p>
        </div>
      )}

      {/* 5. LEADERBOARD POPUP (Conditionally Rendered) */}
      {showLeaderboard && (
        <Leaderboard
          friendsData={allUsersData}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}

export default App;