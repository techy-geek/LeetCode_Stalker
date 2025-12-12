import React, { useMemo } from 'react';

const ActivityFeed = ({ friends }) => {
    // Aggregate all recent submissions from all friends
    const feed = useMemo(() => {
        let allActivities = [];

        friends.forEach(friend => {
            const submissions = friend.recentSubmissions || [];
            submissions.forEach(sub => {
                allActivities.push({
                    user: friend.username,
                    avatar: friend.avatar,
                    title: sub.title,
                    difficulty: 'Unknown', // LeetCode recentAcSubmissionList doesn't always give difficulty directly in this query structure, but we can try to infer or ignore. Actually, it's not in the query for recent list.
                    timestamp: parseInt(sub.timestamp) * 1000, // Convert unix to ms
                    titleSlug: sub.titleSlug
                });
            });
        });

        // Sort by newest first
        return allActivities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
    }, [friends]);

    // Helper to format time ago
    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    if (!feed || feed.length === 0) return null;

    return (
        <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ color: "#888", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
                Live Activity
            </h3>

            <div style={{
                display: 'flex',
                gap: '15px',
                overflowX: 'auto',
                padding: '10px 0',
                scrollbarWidth: 'thin',
                scrollbarColor: '#444 #1a1a1a'
            }}>
                {feed.map((item, idx) => (
                    <div key={idx} style={{
                        minWidth: '250px',
                        background: '#1e1e1e',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #333',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                                src={item.avatar || "https://assets.leetcode.com/users/default_avatar.jpg"}
                                alt={item.user}
                                style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                            />
                            <span style={{ color: '#ffa116', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {item.user}
                            </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#ccc' }}>
                            Solved <span style={{ color: '#fff' }}>{item.title}</span>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                            {timeAgo(new Date(item.timestamp))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityFeed;
