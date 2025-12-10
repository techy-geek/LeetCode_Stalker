import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';

const ActivityHeatmap = ({ submissionCalendar }) => {
    console.log("Heatmap Render: ", submissionCalendar ? "Data Present" : "No Data");

    if (!submissionCalendar) {
        console.warn("Heatmap: No submissionCalendar provided");
        return null;
    }

    // 1. PARSE DATA: LeetCode sends a JSON string like "{"1709234": 2, ...}"
    let parsedData = {};
    try {
        parsedData = JSON.parse(submissionCalendar);
    } catch (e) {
        console.error("Heatmap: Failed to parse calendar data", e);
        return null;
    }

    const heatmapValues = Object.keys(parsedData).map((timestamp) => {
        const date = new Date(parseInt(timestamp) * 1000); // Convert seconds to milliseconds
        return {
            date: date.toISOString().split('T')[0], // Format: YYYY-MM-DD
            count: parsedData[timestamp],
        };
    });

    // 2. Define Range: Show the last 365 days
    const today = new Date();
    const lastYear = new Date();
    lastYear.setFullYear(today.getFullYear() - 1);

    return (
        <div className="card" style={{ marginBottom: '30px', padding: '20px', border: '1px solid #444' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🔥 Submission Activity <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal' }}>(Last 365 Days)</span>
            </h3>

            <div style={{ width: '100%' }}>
                <CalendarHeatmap
                    startDate={lastYear}
                    endDate={today}
                    values={heatmapValues}
                    classForValue={(value) => {
                        if (!value) return 'color-empty';
                        // Scale color based on submission count
                        if (value.count >= 5) return 'color-scale-4';
                        if (value.count >= 3) return 'color-scale-3';
                        if (value.count >= 2) return 'color-scale-2';
                        return 'color-scale-1';
                    }}
                    tooltipDataAttrs={(value) => {
                        if (!value || !value.date) return null;
                        return {
                            'data-tooltip-id': 'heatmap-tooltip',
                            'data-tooltip-content': `${value.date}: ${value.count} submissions`,
                        };
                    }}
                    showWeekdayLabels={true}
                />
                <Tooltip id="heatmap-tooltip" style={{ backgroundColor: "#333", color: "#fff" }} />
            </div>
        </div>
    );
};

export default ActivityHeatmap;