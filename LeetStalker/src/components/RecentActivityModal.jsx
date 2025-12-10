import React, { useMemo } from 'react';

const RecentActivityModal = ({ friends, onClose }) => {
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
                    difficulty: 'Unknown',
                    timestamp: parseInt(sub.timestamp) * 1000,
                    titleSlug: sub.titleSlug
                });
            });
        });

        // Sort by newest first
        return allActivities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
    }, [friends]);

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#ffa116' }}>Recent Activity</h2>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div style={{ overflowY: 'auto', paddingRight: '10px' }}>
                    {feed.length === 0 ? (
                        <p style={{ color: '#666', textAlign: 'center' }}>No recent activity found.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {feed.map((item, idx) => (
                                <a
                                    key={idx}
                                    href={`https://leetcode.com/problems/${item.titleSlug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        textDecoration: 'none',
                                        background: '#1a1a1a',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #333',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#252525'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img
                                            src={item.avatar || "https://assets.leetcode.com/users/default_avatar.jpg"}
                                            alt={item.user}
                                            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                                        />
                                        <div>
                                            <div style={{ color: '#ddd', fontSize: '0.95rem', fontWeight: '500' }}>
                                                {item.user} solved <span style={{ color: '#ffa116' }}>{item.title}</span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                                                {timeAgo(new Date(item.timestamp))}
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{ color: '#888', fontSize: '1.2rem' }}>›</span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecentActivityModal;
