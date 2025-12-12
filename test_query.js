const axios = require('axios');

const username = "anurag_nits";
const query = `
    query getContestHistory($username: String!) {
        userContestRankingHistory(username: $username) {
            attended
            rating
            contest {
                title
                startTime
            }
        }
    }
`;

async function testParam() {
    try {
        console.log("Sending request...");
        const response = await axios.post('https://leetcode.com/graphql', {
            query,
            variables: { username }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        console.log("Response received!");
        const history = response.data.data.userContestRankingHistory;
        console.log("History Length:", history ? history.length : "NULL");
        if (history && history.length > 0) {
            console.log("First Item:", JSON.stringify(history[0], null, 2));
        }
    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) console.error("Data:", e.response.data);
    }
}

testParam();
