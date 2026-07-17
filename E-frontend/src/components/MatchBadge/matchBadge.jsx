import React from 'react'

const getColors = (pct) => {
    if (pct >= 70) return { text: 'text-green-700', bg: 'bg-green-100' };
    if (pct >= 50) return { text: 'text-amber-700', bg: 'bg-amber-100' };
    return { text: 'text-red-700', bg: 'bg-red-100' };
};

const MatchBadge = ({ percentage, size = 'md' }) => {
    if (percentage === undefined || percentage === null) return null;
    const { text, bg } = getColors(percentage);
    const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
    return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full whitespace-nowrap ${bg} ${text} ${sizeClasses}`}>
            {percentage}% match
        </span>
    );
};

export default MatchBadge;