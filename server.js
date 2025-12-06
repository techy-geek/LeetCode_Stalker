const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

// --- 1. DATABASE CONNECTION ---
// REPLACE THIS WITH YOUR OWN CONNECTION STRING IF NEEDED
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

// --- 2. DATABASE SCHEMA ---
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    friends: [String]
});

const User = mongoose.model('User', UserSchema);

const LEETCODE_API_URL = 'https://leetcode.com/graphql';

// --- HELPER FUNCTION ---
async function fetchLeetCodeStats(username) {
    // FIX: Added 'recentAcSubmissionList' to the query so we don't get the error
    const query = `
      query getUserProfile($username: String!) {
        allQuestionsCount { difficulty count }
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum { difficulty count }
          }
        }
        recentAcSubmissionList(username: $username, limit: 1) {
          title
          titleSlug
          timestamp
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
        }
      }
    `;

    try {
        const response = await axios.post(
            LEETCODE_API_URL,
            { query, variables: { username } },
            { headers: { 'Referer': 'https://leetcode.com', 'Content-Type': 'application/json' } }
        );
        return response.data.data;
    } catch (error) {
        console.error("LeetCode Fetch Error:", error.message);
        return null;
    }
}

// --- 3. API ROUTES ---

// server.js

// 1. UPDATE THE LOGIN ROUTE
app.post('/login', async (req, res) => {
    const { username } = req.body;

    // STEP A: Verify they exist on LeetCode first!
    const leetCodeData = await fetchLeetCodeStats(username);
    if (!leetCodeData || !leetCodeData.matchedUser) {
        return res.status(404).json({ error: "User not found on LeetCode" });
    }
    
    // STEP B: If valid, proceed to DB logic
    let user = await User.findOne({ username });
    if (!user) {
        user = new User({ username, friends: [] });
        await user.save();
    }
    
    res.json(user);
});

// server.js

// Updated Route: Get Full Stats for the Logged-in User
app.get('/stats/:username', async (req, res) => {
    const { username } = req.params;
    const data = await fetchLeetCodeStats(username);
    
    if (!data || !data.matchedUser) return res.status(404).json({ error: "User not found" });

    const submitStats = data.matchedUser.submitStats.acSubmissionNum;
    const contestData = data.userContestRanking || { rating: 0, globalRanking: 0 };
    
    // Safety check for last solved
    const lastSolved = (data.recentAcSubmissionList && data.recentAcSubmissionList.length > 0) 
        ? data.recentAcSubmissionList[0] 
        : null;

    const cleanStats = {
        username: username,
        easy: submitStats[1].count,
        medium: submitStats[2].count,
        hard: submitStats[3].count,
        totalSolved: submitStats[0].count,
        lastSolved: lastSolved, // Now included!
        contestStats: {
            rating: Math.round(contestData.rating),
            globalRank: contestData.globalRanking
        }
    };

    res.json(cleanStats);
});
// Route B: Add Friend
app.post('/add-friend', async (req, res) => {
    const { username, friendUsername } = req.body;
    
    const leetCodeData = await fetchLeetCodeStats(friendUsername);
    if (!leetCodeData || !leetCodeData.matchedUser) {
        return res.status(404).json({ error: "LeetCode user not found" });
    }

    const user = await User.findOne({ username });
    if (!user.friends.includes(friendUsername)) {
        user.friends.push(friendUsername);
        await user.save();
    }

    res.json({ message: "Friend added", stats: leetCodeData });
});

// Route C: Get Friends (Fixed Error Here)
app.get('/friends/:username', async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    if (!user) return res.json([]);

    const friendPromises = user.friends.map(async (friendName) => {
        const data = await fetchLeetCodeStats(friendName);
        if (!data || !data.matchedUser) return null;

        const contestData = data.userContestRanking || { rating: 0, globalRanking: 0 };
        const submitStats = data.matchedUser.submitStats.acSubmissionNum;
        
        // Safety Check: Ensure the recent list exists, otherwise null
        const lastSolved = (data.recentAcSubmissionList && data.recentAcSubmissionList.length > 0) 
            ? data.recentAcSubmissionList[0] 
            : null;

        return {
            username: friendName,
            easy: submitStats[1].count,
            medium: submitStats[2].count,
            hard: submitStats[3].count,
            totalSolved: submitStats[0].count,
            lastSolved: lastSolved, // Now safe to use
            contestStats: {
                rating: Math.round(contestData.rating),
                globalRank: contestData.globalRanking
            }
        };
    });

    const friendsData = await Promise.all(friendPromises);
    res.json(friendsData.filter(f => f !== null));
});

// Route D: Remove Friend
app.post('/remove-friend', async (req, res) => {
    const { username, friendUsername } = req.body;
    
    try {
        await User.updateOne(
            { username },
            { $pull: { friends: friendUsername } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove friend" });
    }
});
// server.js

// NEW ROUTE: Get Official Daily Question
app.get('/daily-question', async (req, res) => {
    const query = `
      query questionOfToday {
        activeDailyCodingChallengeQuestion {
          date
          link
          question {
            title
            difficulty
            titleSlug
          }
        }
      }
    `;

    try {
        const response = await axios.post(
            LEETCODE_API_URL,
            { query },
            { headers: { 'Referer': 'https://leetcode.com', 'Content-Type': 'application/json' } }
        );
        res.json(response.data.data.activeDailyCodingChallengeQuestion);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch daily question" });
    }
});
// Start Server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});