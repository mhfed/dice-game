import React from 'react';
import { DiceOne, DiceTwo, DiceThree, DiceFour, DiceFive, DiceSix } from './icons';

interface DiceProps {
    value: number;
    isRolling: boolean;
}

const diceFaceMap: { [key: number]: React.ComponentType<React.SVGProps<SVGSVGElement>> } = {
    1: DiceOne,
    2: DiceTwo,
    3: DiceThree,
    4: DiceFour,
    5: DiceFive,
    6: DiceSix,
};

export const Dice: React.FC<DiceProps> = ({ value, isRolling }) => {
    const FaceComponent = diceFaceMap[value] || DiceOne;
    
    // Using a more realistic tumble animation
    const rollingClass = `animate-tumble`;

    return (
        <div className={`w-16 h-16 bg-white rounded-lg p-2 shadow-lg transition-all duration-500 ease-out ${isRolling ? rollingClass : ''}`}>
           <FaceComponent className="w-full h-full text-red-600" />
        </div>
    );
};