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
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Mongo Error:", err));

// --- 2. DATABASE SCHEMA ---
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    friends: [String],
    // NEW: Array to store notification messages
    notifications: { type: [String], default: [] }
});

const User = mongoose.model('User', UserSchema);

const LEETCODE_API_URL = 'https://leetcode.com/graphql';

// --- HELPER FUNCTION ---
async function fetchLeetCodeStats(username) {
    // 🔥 FIX 1: Updated Query Structure to fetch Avatar correctly
    const query = `
      query getUserProfile($username: String!) {
        allQuestionsCount { difficulty count }
        matchedUser(username: $username) {
          submissionCalendar
          
          profile {         # <--- User Avatar MUST be inside 'profile'
             userAvatar
             realName
          }

          badges {
            displayName
            icon
          }
          submitStats {
            acSubmissionNum { difficulty count }
          }
        }
        recentAcSubmissionList(username: $username, limit: 15) {
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

// Health Check
app.get('/', (req, res) => {
    res.send('LeetTracker Backend is successfully running! 🚀');
});

// Route A: Login
app.post('/login', async (req, res) => {
    const { username } = req.body;
    const leetCodeData = await fetchLeetCodeStats(username);
    if (!leetCodeData || !leetCodeData.matchedUser) {
        return res.status(404).json({ error: "User not found on LeetCode" });
    }

    let user = await User.findOne({ username });
    if (!user) {
        user = new User({ username, friends: [] });
        await user.save();
    }
    res.json(user);
});

// Route B: Add Friend (MUTUAL + NOTIFICATION)
app.post('/add-friend', async (req, res) => {
    const { username, friendUsername } = req.body;

    // 1. Prevent adding yourself
    if (username === friendUsername) {
        return res.status(400).json({ error: "You cannot add yourself!" });
    }

    // 2. Check if Friend exists on LeetCode
    const leetCodeData = await fetchLeetCodeStats(friendUsername);
    if (!leetCodeData || !leetCodeData.matchedUser) {
        return res.status(404).json({ error: "LeetCode user not found" });
    }

    // 3. Add Friend to YOUR list (User A)
    const userA = await User.findOne({ username });
    if (!userA.friends.includes(friendUsername)) {
        userA.friends.push(friendUsername);
        await userA.save();
    }

    // 4. MUTUAL: Add YOU to Friend's list (User B) & Send Notification
    let userB = await User.findOne({ username: friendUsername });

    // If User B doesn't exist in our DB yet (hasn't logged in), create them
    if (!userB) {
        userB = new User({ username: friendUsername, friends: [] });
    }

    // Add User A to User B's friends (if not already there)
    if (!userB.friends.includes(username)) {
        userB.friends.push(username);

        // 🔥 ADD NOTIFICATION HERE
        userB.notifications.push(`👋 ${username} added you as a friend!`);

        await userB.save();
    }

    res.json({ message: "Friend added", stats: leetCodeData });
});

// Route NEW: Get Notifications
app.get('/notifications/:username', async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.json([]);
    res.json(user.notifications || []);
});

// Route G: Clear Notifications
app.post('/clear-notifications', async (req, res) => {
    const { username } = req.body;
    try {
        await User.updateOne({ username }, { $set: { notifications: [] } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to clear notifications" });
    }
});

// Route C: Get Friends List
app.get('/friends/:username', async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) return res.json([]);

    const friendPromises = user.friends.map(async (friendName) => {
        const data = await fetchLeetCodeStats(friendName);
        if (!data || !data.matchedUser) return null;

        const contestData = data.userContestRanking || { rating: 0, globalRanking: 0 };
        const submitStats = data.matchedUser.submitStats.acSubmissionNum;

        const lastSolved = (data.recentAcSubmissionList && data.recentAcSubmissionList.length > 0)
            ? data.recentAcSubmissionList[0]
            : null;

        return {
            username: friendName,
            // 🔥 FIX 2: Added Avatar Field Here
            avatar: data.matchedUser.profile?.userAvatar,

            easy: submitStats[1].count,
            medium: submitStats[2].count,
            hard: submitStats[3].count,
            totalSolved: submitStats[0].count,
            lastSolved: lastSolved,
            recentSubmissions: data.recentAcSubmissionList || [], // Added full list
            badges: data.matchedUser.badges || [],

            submissionCalendar: data.matchedUser.submissionCalendar,
            contestStats: {
                rating: Math.round(contestData.rating),
                globalRank: contestData.globalRanking
            }
        };
    });

    const friendsData = await Promise.all(friendPromises);
    res.json(friendsData.filter(f => f !== null));
});

// Route D: Get My Stats
app.get('/stats/:username', async (req, res) => {
    const { username } = req.params;
    const data = await fetchLeetCodeStats(username);

    if (!data || !data.matchedUser) return res.status(404).json({ error: "User not found" });

    const submitStats = data.matchedUser.submitStats.acSubmissionNum;
    const contestData = data.userContestRanking || { rating: 0, globalRanking: 0 };

    const lastSolved = (data.recentAcSubmissionList && data.recentAcSubmissionList.length > 0)
        ? data.recentAcSubmissionList[0]
        : null;

    const cleanStats = {
        username: username,
        // 🔥 FIX 3: Added Avatar Field Here too
        avatar: data.matchedUser.profile?.userAvatar,

        easy: submitStats[1].count,
        medium: submitStats[2].count,
        hard: submitStats[3].count,
        totalSolved: submitStats[0].count,
        lastSolved: lastSolved,
        recentSubmissions: data.recentAcSubmissionList || [], // Added full list
        badges: data.matchedUser.badges || [],
        badges: data.matchedUser.badges || [],
        submissionCalendar: data.matchedUser.submissionCalendar,
        contestStats: {
            rating: Math.round(contestData.rating),
            globalRank: contestData.globalRanking
        }
    };

    res.json(cleanStats);
});

// Route E: Remove Friend
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

// Route F: Daily Question
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});