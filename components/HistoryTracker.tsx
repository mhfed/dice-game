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
            case 'tai': return 'bg-rose-600 border-rose-400';
            case 'xiu': return 'bg-sky-700 border-sky-500';
            case 'triple': return 'bg-yellow-500 border-yellow-300';
            default: return 'bg-slate-600 border-slate-400';
        }
    };

    return (
        <div className="w-full p-1 rounded-lg">
            <div className="flex items-center justify-center gap-1.5 flex-row-reverse">
                {Array.from({ length: 20 }).map((_, index) => {
                    const entry = history[index];
                    if (!entry) return <div key={`placeholder-${index}`} className="w-5 h-5 rounded-full bg-black/20 border-2 border-gray-700" />;
                    
                    return (
                        <div 
                            key={entry.id}
                            className={`w-5 h-5 rounded-full border-2 shadow-inner transition-all duration-300 ${getDotClass(entry.result)}`}
                            title={`Ván ${history.length - index}: ${entry.total} điểm - ${entry.result.toUpperCase()}`}
                        >
                        </div>
                    );
                })}
            </div>
        </div>
    );
};