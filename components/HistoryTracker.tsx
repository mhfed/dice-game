import React from 'react';

export type HistoryEntry = {
    id: number;
    total: number;
    result: 'tai' | 'xiu' | 'triple';
};

interface HistoryTrackerProps {
    history: HistoryEntry[];
}

export const HistoryTracker: React.FC<HistoryTrackerProps> = ({ history }) => {
    
    const getDotClass = (result: 'tai' | 'xiu' | 'triple') => {
        switch(result) {
            case 'tai': return 'bg-red-500 border-red-300';
            case 'xiu': return 'bg-sky-500 border-sky-300';
            case 'triple': return 'bg-yellow-500 border-yellow-300';
            default: return 'bg-slate-600 border-slate-400';
        }
    };

    const getDotLabel = (result: 'tai' | 'xiu' | 'triple') => {
        switch(result) {
            case 'tai': return 'T';
            case 'xiu': return 'X';
            case 'triple': return 'B';
            default: return '?';
        }
    }

    return (
        <div className="w-full max-w-2xl bg-slate-900/50 p-2 rounded-lg mb-4">
            <div className="flex items-center justify-end gap-1.5 flex-row-reverse">
                {history.map((entry, index) => (
                    <div 
                        key={entry.id}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm border-2 shadow-md transition-all duration-300 ${getDotClass(entry.result)} ${index === 0 ? 'scale-110 animate-pulse' : 'opacity-70'}`}
                        title={`Ván ${history.length - index}: ${entry.total} điểm - ${entry.result.toUpperCase()}`}
                    >
                        {getDotLabel(entry.result)}
                    </div>
                ))}
            </div>
        </div>
    );
};