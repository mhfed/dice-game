import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dice } from './components/Dice';
import { HistoryTracker, HistoryEntry } from './components/HistoryTracker';
import { Modal } from './components/Modal';

const BET_AMOUNTS = [1000, 10000, 50000, 100000, 500000, 1000000];
const INITIAL_BALANCE = 20000000;

// Placeholder component for icons
const Icon = ({ path, className = 'w-6 h-6' }: { path: string, className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>
);

const App: React.FC = () => {
    const [diceValues, setDiceValues] = useState([1, 2, 3]);
    const [isRolling, setIsRolling] = useState(false);
    const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
    const [betAmount, setBetAmount] = useState<number>(0);
    const [selectedSide, setSelectedSide] = useState<'tai' | 'xiu' | null>(null);
    const [confirmedBet, setConfirmedBet] = useState<{ side: 'tai' | 'xiu'; amount: number } | null>(null);
    
    const [isCovered, setIsCovered] = useState(false);
    const [isRevealing, setIsRevealing] = useState(false);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    
    const [gameId, setGameId] = useState(365586);
    const [totalTai, setTotalTai] = useState(873724316);
    const [totalXiu, setTotalXiu] = useState(854348318);
    const [resultTotal, setResultTotal] = useState<number | null>(null);

    // State for deposit/withdraw modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'deposit' | 'withdraw'>('deposit');
    const [modalAmount, setModalAmount] = useState(0);
    const [modalMessage, setModalMessage] = useState('');


    const playSound = useCallback((id: string) => {
        const audio = document.getElementById(id) as HTMLAudioElement;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(error => console.error(`Audio playback failed for ${id}:`, error));
        }
    }, []);

    useEffect(() => {
        const savedBalance = localStorage.getItem('taiXiuBalanceV2');
        const savedHistory = localStorage.getItem('taiXiuHistoryV2');
        if (savedBalance) setBalance(JSON.parse(savedBalance));
        else setBalance(INITIAL_BALANCE);
        if (savedHistory) setHistory(JSON.parse(savedHistory));
    }, []);

    useEffect(() => { localStorage.setItem('taiXiuBalanceV2', JSON.stringify(balance)); }, [balance]);
    useEffect(() => { localStorage.setItem('taiXiuHistoryV2', JSON.stringify(history)); }, [history]);
    
    // Simulate other players' bets
    useEffect(() => {
      if (isRolling) return;
      const interval = setInterval(() => {
        setTotalTai(prev => prev + Math.floor(Math.random() * 10000));
        setTotalXiu(prev => prev + Math.floor(Math.random() * 10000));
      }, 1500);
      return () => clearInterval(interval);
    }, [isRolling]);

    const getResult = (d1: number, d2: number, d3: number): { total: number; result: 'tai' | 'xiu' | 'triple' } => {
        const total = d1 + d2 + d3;
        if (d1 === d2 && d2 === d3) return { total, result: 'triple' };
        if (total >= 4 && total <= 10) return { total, result: 'xiu' };
        return { total, result: 'tai' };
    };

    const processResult = useCallback(() => {
        if (!confirmedBet) return;

        const { total, result } = getResult(diceValues[0], diceValues[1], diceValues[2]);
        setResultTotal(total);
        const playerWon = result === confirmedBet.side;

        if (playerWon) {
            const winnings = confirmedBet.amount * 2;
            setBalance(prev => prev + winnings);
            playSound('audio-win');
        } else {
            playSound('audio-lose');
        }

        setHistory(prev => [{ id: Date.now(), total, result }, ...prev.slice(0, 19)]);
        setConfirmedBet(null);
        setBetAmount(0);
        
        setTimeout(() => {
            setGameId(prev => prev + 1);
            setResultTotal(null);
        }, 3000); // Reset for next round after 3s
    }, [diceValues, confirmedBet, playSound]);
    
    const handleBetSelection = (side: 'tai' | 'xiu') => {
        if (confirmedBet) return;
        setSelectedSide(side);
        playSound('audio-click');
    }

    const handlePlaceBet = () => {
        if (!selectedSide || betAmount <= 0 || betAmount > balance || confirmedBet) return;
        
        setIsRolling(true);
        playSound('audio-roll');
        
        setBalance(prev => prev - betAmount);
        setConfirmedBet({ side: selectedSide, amount: betAmount });
        if (selectedSide === 'tai') setTotalTai(prev => prev + betAmount);
        else setTotalXiu(prev => prev + betAmount);

        setSelectedSide(null);

        setTimeout(() => {
            const newDiceValues = [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ];
            setDiceValues(newDiceValues);
            setIsRolling(false);
            setIsCovered(true);
        }, 2000);
    };

    const handleReveal = () => {
        if (!isCovered || isRevealing) return;
        playSound('audio-click');
        setIsRevealing(true); 

        setTimeout(() => {
            setIsCovered(false);
            setIsRevealing(false);
            processResult();
        }, 500);
    };

    const handleCancel = () => {
        if (confirmedBet) return;
        setSelectedSide(null);
        setBetAmount(0);
        playSound('audio-click');
    };
    
    const handleAllIn = () => {
        if (confirmedBet) return;
        setBetAmount(balance);
        playSound('audio-click');
    }

    const handleChipSelect = (amount: number) => {
        if (confirmedBet) return;
        setBetAmount(prev => prev + amount);
        playSound('audio-click');
    }

    // Modal Handlers
    const openModal = (mode: 'deposit' | 'withdraw') => {
        setModalMode(mode);
        setModalAmount(0);
        setModalMessage('');
        setIsModalOpen(true);
        playSound('audio-click');
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleTransaction = () => {
        playSound('audio-click');
        if (modalMode === 'deposit') {
            if (modalAmount > 0) {
                setBalance(prev => prev + modalAmount);
                setModalMessage(`Giao dịch thành công! ${modalAmount.toLocaleString()} đã được 'in' và thêm vào tài khoản của bạn.`);
            }
        } else { // withdraw
            if (modalAmount <= 0) return;
            if (modalAmount > balance) {
                setModalMessage('Số dư không đủ để thực hiện giao dịch này!');
            } else {
                setBalance(prev => prev - modalAmount);
                setModalMessage(`Yêu cầu đã được gửi đến ngân hàng vũ trụ. Đùa thôi, bạn đã rút ${modalAmount.toLocaleString()}!`);
            }
        }
        setModalAmount(0);
    };

    return (
        <div className="text-white min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 selection:bg-yellow-500 selection:text-slate-900 overflow-hidden">
             {/* Main Betting Panel */}
            <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#6b1427] to-[#4c0d1b] rounded-2xl border-2 border-gold panel-shadow p-4 sm:p-6">
                {/* Header Icons */}
                <div className="absolute top-4 left-6 flex gap-3 text-gold">
                    <Icon path="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7h2v5h-2v-5zm0-4h2v2h-2V7z" />
                    <Icon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 7h2v2h-2zm0 4h2v6h-2z" />
                </div>
                 <div className="absolute top-4 right-6 flex gap-3 text-gold">
                    <Icon path="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    <Icon path="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </div>

                {/* Title */}
                <div className="text-center mb-4">
                    <h1 className="text-5xl font-teko text-gold tracking-wider">TÀI XỈU</h1>
                    <p className="font-semibold text-dark-gold">#{gameId}</p>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center">
                    {/* TÀI Section */}
                    <div 
                        onClick={() => handleBetSelection('tai')}
                        className={`cursor-pointer bg-black/20 rounded-lg p-3 sm:p-4 text-center transition-all duration-300 ${selectedSide === 'tai' ? 'border-2 border-red-400 shadow-lg' : 'border-2 border-transparent'}`}
                    >
                        <h2 className="text-6xl font-teko text-red-400" style={{textShadow: '0 0 10px #f43f5e'}}>TÀI</h2>
                        <div className="bg-black/30 rounded py-1 px-2 mb-2">
                            <span className="text-lg font-bold text-white">{totalTai.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Center Section */}
                    <div className="relative flex flex-col items-center">
                        <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-black/30 rounded-full flex items-center justify-center border-2 border-gold shadow-inner">
                            {resultTotal !== null ? (
                                 <span className="font-teko text-8xl text-gold">{resultTotal}</span>
                            ) : (
                                <>
                                  <div className={`relative flex gap-2 transition-opacity duration-300 ${isCovered ? 'opacity-0' : 'opacity-100'}`}>
                                      {diceValues.map((value, index) =>
                                          <Dice key={index} value={value} isRolling={isRolling} small />
                                      )}
                                  </div>
                                  {isCovered && (
                                      <div onClick={handleReveal} className={`absolute inset-0 flex items-center justify-center cursor-pointer ${isRevealing ? 'animate-lift-up' : ''}`}>
                                        <svg width="100" height="100" viewBox="0 0 150 150" className="drop-shadow-lg">
                                            <defs>
                                                <radialGradient id="bowlGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                                    <stop offset="0%" stopColor="#c28a2a" />
                                                    <stop offset="100%" stopColor="#855d1c" />
                                                </radialGradient>
                                            </defs>
                                            <path d="M 10 75 A 65 65 0 0 1 140 75" fill="url(#bowlGradient)" stroke="#4a2e0a" strokeWidth="3" />
                                            <path d="M 50 20 A 25 10 0 0 1 100 20" fill="#a16d1f" stroke="#4a2e0a" strokeWidth="2" />
                                        </svg>
                                      </div>
                                  )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* XỈU Section */}
                    <div 
                        onClick={() => handleBetSelection('xiu')}
                        className={`cursor-pointer bg-black/20 rounded-lg p-3 sm:p-4 text-center transition-all duration-300 ${selectedSide === 'xiu' ? 'border-2 border-sky-400 shadow-lg' : 'border-2 border-transparent'}`}
                    >
                        <h2 className="text-6xl font-teko text-sky-400" style={{textShadow: '0 0 10px #38bdf8'}}>XỈU</h2>
                        <div className="bg-black/30 rounded py-1 px-2 mb-2">
                             <span className="text-lg font-bold text-white">{totalXiu.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                 {/* Player Bet Input & History */}
                <div className="relative bg-panel-darker-bg mt-[-20px] pt-6 pb-2 px-4 rounded-b-xl border-x-2 border-b-2 border-gold">
                    <div className="bg-black/30 rounded-md p-1 flex items-center justify-between mb-3 mx-auto max-w-xs">
                        <span className="text-dark-gold px-2">CƯỢC</span>
                        <input 
                            type="text" 
                            value={betAmount.toLocaleString()} 
                            readOnly 
                            className="flex-grow bg-transparent text-white font-bold text-center text-lg p-1 focus:outline-none"
                        />
                        <button onClick={handleCancel} className="text-dark-gold px-2 font-bold">X</button>
                    </div>
                    <HistoryTracker history={history} />
                </div>
            </div>

            {/* Bet Chips and Actions */}
            <div className="w-full max-w-4xl mt-4">
                 <div className="flex justify-center items-center gap-2 flex-wrap mb-4">
                    {BET_AMOUNTS.map(amount => (
                        <button key={amount} onClick={() => handleChipSelect(amount)} className="chip-button rounded-full font-bold px-3 py-1 text-sm sm:px-4 sm:py-2 sm:text-base">
                            {amount / 1000}K
                        </button>
                    ))}
                </div>
                <div className="flex justify-center items-center gap-4">
                    <button onClick={handleAllIn} disabled={!!confirmedBet} className="action-button action-button-secondary disabled:opacity-50">All-in</button>
                    <button onClick={handlePlaceBet} disabled={!selectedSide || betAmount <= 0 || !!confirmedBet} className="action-button action-button-primary disabled:opacity-50">Đặt Cược</button>
                    <button onClick={handleCancel} disabled={!!confirmedBet} className="action-button action-button-cancel disabled:opacity-50">Hủy</button>
                </div>
                 <div className="flex justify-center items-center gap-4 mt-4 text-dark-gold">
                    <span>Số dư: <span className="font-bold text-gold text-lg">{balance.toLocaleString()}</span></span>
                    <button onClick={() => openModal('deposit')} className="chip-button !text-xs !px-3 !py-1">Nạp</button>
                    <button onClick={() => openModal('withdraw')} className="chip-button !text-xs !px-3 !py-1">Rút</button>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className="text-center">
                    <h2 className="font-teko text-3xl text-gold mb-4">
                        {modalMode === 'deposit' ? 'NẠP TIỀN' : 'RÚT TIỀN'}
                    </h2>
                    {modalMessage ? (
                        <div className="min-h-[150px] flex flex-col justify-center items-center">
                          <p className="text-green-400 mb-4">{modalMessage}</p>
                          <button onClick={closeModal} className="action-button action-button-cancel">Đóng</button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-black/30 rounded-md p-2 flex items-center justify-between mb-4">
                                <span className="text-dark-gold px-2">SỐ TIỀN</span>
                                <input 
                                    type="number"
                                    value={modalAmount === 0 ? '' : modalAmount}
                                    onChange={(e) => setModalAmount(Number(e.target.value))}
                                    placeholder="Nhập số tiền"
                                    className="flex-grow bg-transparent text-white font-bold text-center text-lg p-1 focus:outline-none"
                                />
                            </div>
                            <div className="flex justify-center items-center gap-2 flex-wrap mb-4">
                                {[1000000, 5000000, 10000000, 50000000].map(amount => (
                                    <button key={amount} onClick={() => setModalAmount(prev => prev + amount)} className="chip-button">
                                        {amount / 1000000}M
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={handleTransaction} 
                                className="action-button action-button-primary w-full"
                            >
                                XÁC NHẬN
                            </button>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default App;