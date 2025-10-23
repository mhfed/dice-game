import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dice } from './components/Dice';
import { HistoryTracker, HistoryEntry } from './components/HistoryTracker';

type BetType = 'tai' | 'xiu';
type GameResult = 'win' | 'loss' | 'triple' | null;

const BET_PRESETS = [100, 500, 1000, 5000, 10000];
const WIN_STREAK_GOAL = 3;
const WIN_STREAK_BONUS_PERCENT = 0.2; // 20% bonus
const LOSS_STREAK_GOAL = 5;
const LOSS_STREAK_CONSOLATION = 500;

const ResultDisplay: React.FC<{ result: string | null; outcome: GameResult }> = ({ result, outcome }) => {
    if (!result) return null;

    const colorClasses = {
        win: 'bg-green-500/20 border-green-500 text-green-300',
        loss: 'bg-red-500/20 border-red-500 text-red-300',
        triple: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    };

    const outcomeText = {
        win: 'THẮNG!',
        loss: 'THUA!',
        triple: 'BỘ BA ĐỒNG NHẤT! NHÀ CÁI ĂN!',
    }

    return (
        <div className={`absolute -top-20 left-1/2 -translate-x-1/2 p-4 rounded-lg border-2 shadow-lg transition-all duration-300 z-20 ${outcome ? colorClasses[outcome] : ''}`}>
            <div className="text-center">
                <p className="font-teko text-7xl leading-none">{result}</p>
                {outcome && <p className="font-bold text-lg mt-1">{outcomeText[outcome]}</p>}
            </div>
        </div>
    );
};

export default function App() {
    const [balance, setBalance] = useState<number>(() => {
        const savedBalance = localStorage.getItem('taiXiuBalance');
        return savedBalance ? JSON.parse(savedBalance) : 10000;
    });
    const [betAmount, setBetAmount] = useState<number | string>(100);
    const [currentBet, setCurrentBet] = useState<BetType | null>(null);
    const [dice, setDice] = useState<[number, number, number]>([1, 1, 1]);
    const [isRolling, setIsRolling] = useState<boolean>(false);
    const [gameResult, setGameResult] = useState<GameResult>(null);
    const [message, setMessage] = useState<string>('Chọn Tài hoặc Xỉu để bắt đầu');
    const [bonusMessage, setBonusMessage] = useState<string>('');
    const [total, setTotal] = useState<number | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>(() => {
        const savedHistory = localStorage.getItem('taiXiuHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });
    const [winStreak, setWinStreak] = useState(0);
    const [loseStreak, setLoseStreak] = useState(0);

    const audioRefs = {
        click: useRef<HTMLAudioElement>(null),
        roll: useRef<HTMLAudioElement>(null),
        win: useRef<HTMLAudioElement>(null),
        lose: useRef<HTMLAudioElement>(null),
    };
    
    useEffect(() => {
        audioRefs.click.current = document.getElementById('audio-click') as HTMLAudioElement;
        audioRefs.roll.current = document.getElementById('audio-roll') as HTMLAudioElement;
        audioRefs.win.current = document.getElementById('audio-win') as HTMLAudioElement;
        audioRefs.lose.current = document.getElementById('audio-lose') as HTMLAudioElement;
    }, []);

    const playSound = (sound: 'click' | 'roll' | 'win' | 'lose') => {
        const audio = audioRefs[sound].current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.error("Audio playback failed", e));
        }
    };
    
    useEffect(() => {
        localStorage.setItem('taiXiuBalance', JSON.stringify(balance));
    }, [balance]);

    useEffect(() => {
        localStorage.setItem('taiXiuHistory', JSON.stringify(history));
    }, [history]);

    const handlePlaceBet = useCallback(() => {
        const numericBetAmount = Number(betAmount);
        if (!currentBet) {
            setMessage('Vui lòng chọn Tài hoặc Xỉu.');
            return;
        }
        if (isNaN(numericBetAmount) || numericBetAmount <= 0) {
            setMessage('Số tiền cược không hợp lệ.');
            return;
        }
        if (numericBetAmount > balance) {
            setMessage('Bạn không đủ số dư.');
            return;
        }

        setIsRolling(true);
        setGameResult(null);
        setTotal(null);
        setMessage('');
        playSound('roll');

        setTimeout(() => {
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const d3 = Math.floor(Math.random() * 6) + 1;
            const newDice: [number, number, number] = [d1, d2, d3];
            const newTotal = d1 + d2 + d3;

            setDice(newDice);
            setTotal(newTotal);

            let outcome: GameResult;
            let resultType: BetType | 'triple' = 'triple';
            
            if (d1 === d2 && d2 === d3) {
                outcome = 'triple';
                setBalance(prev => prev - numericBetAmount);
                setWinStreak(0);
                setLoseStreak(prev => prev + 1);
            } else {
                if (newTotal >= 4 && newTotal <= 10) resultType = 'xiu';
                if (newTotal >= 11 && newTotal <= 17) resultType = 'tai';

                if (currentBet === resultType) {
                    outcome = 'win';
                    setBalance(prev => prev + numericBetAmount);
                    setWinStreak(prev => prev + 1);
                    setLoseStreak(0);
                } else {
                    outcome = 'loss';
                    setBalance(prev => prev - numericBetAmount);
                    setWinStreak(0);
                    setLoseStreak(prev => prev + 1);
                }
            }
            
            setHistory(prev => [{ id: Date.now(), total: newTotal, result: resultType }, ...prev].slice(0, 20));
            setGameResult(outcome);
            setIsRolling(false);
            setCurrentBet(null);
            playSound(outcome === 'win' ? 'win' : 'lose');
        }, 2000);
    }, [betAmount, currentBet, balance]);

    useEffect(() => {
        if (winStreak > 0 && winStreak % WIN_STREAK_GOAL === 0) {
            const bonus = Math.floor(Number(betAmount) * WIN_STREAK_BONUS_PERCENT);
            setBalance(prev => prev + bonus);
            setBonusMessage(`Nóng Tay! Thưởng ${bonus.toLocaleString()} từ chuỗi ${WIN_STREAK_GOAL} trận thắng!`);
        }
    }, [winStreak]);

    useEffect(() => {
        if (loseStreak > 0 && loseStreak % LOSS_STREAK_GOAL === 0) {
            setBalance(prev => prev + LOSS_STREAK_CONSOLATION);
            setBonusMessage(`An Ủi! Bạn nhận được ${LOSS_STREAK_CONSOLATION.toLocaleString()} cho chuỗi 5 trận thua.`);
        }
    }, [loseStreak]);

    useEffect(() => {
        if (gameResult) {
            const timer = setTimeout(() => {
                setGameResult(null);
                setTotal(null);
                setBonusMessage('');
                setMessage('Chọn Tài hoặc Xỉu để chơi tiếp');
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [gameResult]);

    const getResultString = () => {
        if (total === null) return null;
        if (gameResult === 'triple') return `${total} ĐIỂM`;
        const type = total >= 11 ? 'TÀI' : 'XỈU';
        return `${total} - ${type}`;
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            
            <header className="w-full max-w-4xl mx-auto flex justify-between items-center p-4 rounded-t-xl bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
                <h1 className="font-teko text-5xl text-amber-300 tracking-widest">TÀI XỈU</h1>
                <div className="text-right">
                    <span className="block text-slate-400 text-sm">SỐ DƯ</span>
                    <span className="block font-teko text-4xl text-green-400 tracking-wider">${balance.toLocaleString()}</span>
                </div>
            </header>

            <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col items-center justify-center bg-green-900/70 rounded-b-xl shadow-2xl p-8 relative border-4 border-yellow-700">
                <ResultDisplay result={getResultString()} outcome={gameResult} />
                
                {bonusMessage && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-900 font-bold px-4 py-2 rounded-lg shadow-lg z-20 animate-pulse">
                        {bonusMessage}
                    </div>
                )}

                <div className="relative w-72 h-72 mb-8 flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full bg-slate-900 shadow-inner"></div>
                    <div className="absolute w-60 h-60 rounded-full bg-slate-700/50"></div>
                    <div className="flex gap-4 z-10">
                        {dice.map((value, index) => (
                            <Dice key={index} value={value} isRolling={isRolling} />
                        ))}
                    </div>
                </div>

                <HistoryTracker history={history} />

                <div className="w-full max-w-md text-center h-8 my-4">
                     <p className={`transition-opacity duration-300 font-semibold ${message ? 'opacity-100' : 'opacity-0'}`}>
                        {message}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6 w-full max-w-2xl mb-6">
                    <button 
                        onClick={() => { if(!isRolling) { setCurrentBet('xiu'); playSound('click'); }}}
                        disabled={isRolling}
                        className={`font-teko text-6xl py-10 rounded-lg transition-all duration-300 ease-in-out transform disabled:cursor-not-allowed disabled:opacity-50
                            ${currentBet === 'xiu' ? 'bg-sky-500 shadow-sky-400/50 scale-105' : 'bg-slate-700 hover:bg-slate-600'} shadow-lg`}
                    >
                        XỈU
                        <span className="block text-2xl font-normal text-slate-300">4-10</span>
                    </button>
                    <button 
                        onClick={() => { if(!isRolling) { setCurrentBet('tai'); playSound('click'); }}}
                        disabled={isRolling}
                        className={`font-teko text-6xl py-10 rounded-lg transition-all duration-300 ease-in-out transform disabled:cursor-not-allowed disabled:opacity-50
                            ${currentBet === 'tai' ? 'bg-red-600 shadow-red-500/50 scale-105' : 'bg-slate-700 hover:bg-slate-600'} shadow-lg`}
                    >
                        TÀI
                        <span className="block text-2xl font-normal text-slate-300">11-17</span>
                    </button>
                </div>
                
                <div className="bg-slate-900/50 p-4 rounded-lg w-full max-w-2xl">
                    <div className="flex items-center gap-4 mb-3">
                        <label htmlFor="betAmount" className="font-bold text-slate-300">Số tiền cược:</label>
                        <input 
                            id="betAmount"
                            type="number"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            min="1"
                            step="10"
                            disabled={isRolling}
                            className="flex-grow bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white text-lg font-bold w-full disabled:opacity-50"
                        />
                    </div>
                     <div className="flex justify-between gap-2 mb-4">
                        {BET_PRESETS.map(amount => (
                           <button 
                                key={amount}
                                onClick={() => { setBetAmount(amount); playSound('click'); }}
                                disabled={isRolling}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 rounded px-2 py-1 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                {amount.toLocaleString()}
                            </button> 
                        ))}
                    </div>
                    <button 
                        onClick={handlePlaceBet}
                        disabled={isRolling || !currentBet}
                        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-teko text-4xl py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                    >
                        {isRolling ? 'ĐANG XOAY...' : 'ĐẶT CƯỢC'}
                    </button>
                </div>
            </main>
        </div>
    );
}