import React, { useState, useEffect, useCallback } from 'react';
import { Dice } from './components/Dice';
import { HistoryTracker, HistoryEntry } from './components/HistoryTracker';
import { Modal } from './components/Modal';

const BET_AMOUNTS = [100, 500, 1000, 5000];
const INITIAL_BALANCE = 10000;
const WIN_STREAK_THRESHOLD = 3;
const WIN_STREAK_BONUS_PERCENT = 0.2;
const LOSS_STREAK_THRESHOLD = 5;
const LOSS_STREAK_RECOVERY_AMOUNT = 500;

const App: React.FC = () => {
    const [diceValues, setDiceValues] = useState([1, 2, 3]);
    const [isRolling, setIsRolling] = useState(false);
    const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
    const [betAmount, setBetAmount] = useState<number>(100);
    const [currentBet, setCurrentBet] = useState<'tai' | 'xiu' | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [winStreak, setWinStreak] = useState(0);
    const [lossStreak, setLossStreak] = useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });
    const [modalType, setModalType] = useState<'result' | 'deposit' | 'withdraw' | null>(null);
    const [transactionAmount, setTransactionAmount] = useState('');

    const playSound = useCallback((id: string) => {
        const audio = document.getElementById(id) as HTMLAudioElement;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(error => console.error(`Audio playback failed for ${id}:`, error));
        }
    }, []);

    useEffect(() => {
        const savedBalance = localStorage.getItem('taiXiuBalance');
        const savedHistory = localStorage.getItem('taiXiuHistory');
        if (savedBalance) {
            setBalance(JSON.parse(savedBalance));
        }
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('taiXiuBalance', JSON.stringify(balance));
    }, [balance]);

    useEffect(() => {
        localStorage.setItem('taiXiuHistory', JSON.stringify(history));
    }, [history]);

    const getResult = (d1: number, d2: number, d3: number): { total: number; result: 'tai' | 'xiu' | 'triple' } => {
        const total = d1 + d2 + d3;
        if (d1 === d2 && d2 === d3) return { total, result: 'triple' };
        if (total >= 4 && total <= 10) return { total, result: 'xiu' };
        return { total, result: 'tai' };
    };

    const handleRoll = () => {
        if (isRolling || !currentBet || betAmount <= 0 || betAmount > balance) {
            if (!currentBet) setModalContent({ title: 'Lỗi', body: 'Vui lòng chọn TÀI hoặc XỈU trước khi lắc.' });
            else if (betAmount > balance) setModalContent({ title: 'Lỗi', body: 'Số dư không đủ để đặt cược.'});
            else setModalContent({ title: 'Lỗi', body: 'Số tiền cược không hợp lệ.'});
            setModalType('result');
            setIsModalOpen(true);
            return;
        }

        setIsRolling(true);
        playSound('audio-roll');
        setBalance(prev => prev - betAmount);

        setTimeout(() => {
            const newDiceValues = [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ];
            setDiceValues(newDiceValues);

            const { total, result } = getResult(newDiceValues[0], newDiceValues[1], newDiceValues[2]);
            const playerWon = result === currentBet;

            let resultMessage = `Kết quả: ${total} điểm - ${result.toUpperCase()}! Bạn đã ${playerWon ? 'Thắng' : 'Thua'}.`;
            let bonusMessage = '';

            if (playerWon) {
                const winnings = betAmount * 2;
                setBalance(prev => prev + winnings);
                setWinStreak(prev => prev + 1);
                setLossStreak(0);
                playSound('audio-win');

                if (winStreak + 1 === WIN_STREAK_THRESHOLD) {
                    const bonus = Math.floor(betAmount * WIN_STREAK_BONUS_PERCENT);
                    setBalance(prev => prev + bonus);
                    bonusMessage = `\n\nNóng tay! Bạn nhận được thưởng chuỗi ${WIN_STREAK_THRESHOLD} ván thắng: ${bonus.toLocaleString()}!`;
                }
            } else {
                setLossStreak(prev => prev + 1);
                setWinStreak(0);
                playSound('audio-lose');

                if (lossStreak + 1 === LOSS_STREAK_THRESHOLD) {
                    setBalance(prev => prev + LOSS_STREAK_RECOVERY_AMOUNT);
                    bonusMessage = `\n\nĐừng nản lòng! Bạn được an ủi ${LOSS_STREAK_RECOVERY_AMOUNT.toLocaleString()} để lấy lại vận may!`;
                }
            }
            
            setHistory(prev => [{ id: Date.now(), total, result }, ...prev.slice(0, 19)]);
            setIsRolling(false);
            setCurrentBet(null);
            setModalContent({ title: 'Kết Quả Ván Cược', body: resultMessage + bonusMessage });
            setModalType('result');
            setIsModalOpen(true);

        }, 1500);
    };

    const handleTransaction = (type: 'deposit' | 'withdraw') => {
        const amount = parseInt(transactionAmount, 10);
        if (isNaN(amount) || amount <= 0) return;

        if (type === 'deposit') {
            setBalance(prev => prev + amount);
            setModalContent({ title: 'Giao Dịch Thành Công', body: `Tài khoản của bạn đã được cộng ${amount.toLocaleString()}. Chúc bạn may mắn!`});
        } else {
            if (amount > balance) {
                setModalContent({ title: 'Giao Dịch Thất Bại', body: 'Số tiền rút không thể lớn hơn số dư hiện tại.' });
            } else {
                setBalance(prev => prev - amount);
                setModalContent({ title: 'Giao Dịch Thành Công', body: `Bạn đã rút ${amount.toLocaleString()} từ ngân hàng vũ trụ. Tiêu xài vui vẻ nhé!` });
            }
        }
        setTransactionAmount('');
        setIsModalOpen(true);
        setModalType('result'); // To show a simple message
    };

    const openTransactionModal = (type: 'deposit' | 'withdraw') => {
        setModalType(type);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-slate-950 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans selection:bg-yellow-500 selection:text-slate-900">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm">
                <div className="text-left">
                    <h1 className="text-3xl font-bold text-yellow-300 font-teko tracking-wider">TÀI XỈU</h1>
                    <p className="text-slate-400 text-sm">Số dư: <span className="font-bold text-white text-base">{balance.toLocaleString()}</span></p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => openTransactionModal('deposit')} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">Nạp Tiền</button>
                    <button onClick={() => openTransactionModal('withdraw')} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">Rút Tiền</button>
                </div>
            </header>

            <main className="flex flex-col items-center justify-center w-full mt-20">
                <HistoryTracker history={history} />

                {/* Dice Area */}
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-full shadow-2xl mb-8 border-2 border-slate-700">
                    <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-20"></div>
                    <div className="relative flex gap-6">
                        {diceValues.map((value, index) => <Dice key={index} value={value} isRolling={isRolling} />)}
                    </div>
                </div>

                {/* Betting Controls */}
                <div className="w-full max-w-md bg-slate-800/50 p-4 rounded-lg shadow-lg mb-6">
                    <div className="mb-3">
                         <label className="block text-center text-slate-400 mb-2">Số tiền cược</label>
                         <input 
                            type="number"
                            value={betAmount}
                            onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full bg-slate-900 text-white text-center text-xl p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                         />
                    </div>
                    <div className="flex justify-center gap-2 mb-4">
                        {BET_AMOUNTS.map(amount => (
                            <button key={amount} onClick={() => setBetAmount(amount)} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">
                                {amount.toLocaleString()}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <button 
                            onClick={() => { setCurrentBet('xiu'); playSound('audio-click'); }} 
                            className={`py-4 rounded-lg text-2xl font-teko tracking-widest transition-all duration-200 ${currentBet === 'xiu' ? 'bg-sky-500 text-white ring-2 ring-offset-2 ring-offset-slate-900 ring-sky-400' : 'bg-slate-700 hover:bg-slate-600'}`}
                        >
                            XỈU
                        </button>
                        <button 
                            onClick={() => { setCurrentBet('tai'); playSound('audio-click'); }}
                            className={`py-4 rounded-lg text-2xl font-teko tracking-widest transition-all duration-200 ${currentBet === 'tai' ? 'bg-red-500 text-white ring-2 ring-offset-2 ring-offset-slate-900 ring-red-400' : 'bg-slate-700 hover:bg-slate-600'}`}
                        >
                            TÀI
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleRoll}
                    disabled={isRolling || !currentBet}
                    className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold py-4 px-12 rounded-full text-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                    {isRolling ? 'ĐANG LẮC...' : 'ĐẶT CƯỢC & LẮC'}
                </button>
            </main>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {modalType === 'deposit' || modalType === 'withdraw' ? (
                     <div>
                        <h2 className="text-2xl font-bold mb-4 text-yellow-300">{modalType === 'deposit' ? 'Nạp Tiền' : 'Rút Tiền'}</h2>
                        <p className="text-slate-300 mb-4">Nhập số tiền bạn muốn {modalType === 'deposit' ? 'nạp' : 'rút'}.</p>
                        <input
                            type="number"
                            value={transactionAmount}
                            onChange={(e) => setTransactionAmount(e.target.value)}
                            className="w-full bg-slate-900 text-white text-center text-xl p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none mb-4"
                            placeholder="0"
                        />
                        <button 
                            onClick={() => handleTransaction(modalType)}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-2 px-4 rounded-md transition-colors"
                        >
                            Xác Nhận
                        </button>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-yellow-300">{modalContent.title}</h2>
                        <p className="text-slate-300 whitespace-pre-wrap">{modalContent.body}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default App;
