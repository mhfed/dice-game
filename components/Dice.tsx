import React from 'react';
import { DiceOne, DiceTwo, DiceThree, DiceFour, DiceFive, DiceSix } from './icons';

interface DiceProps {
    value: number;
    isRolling: boolean;
    small?: boolean;
}

const diceFaceMap: { [key: number]: React.ComponentType<React.SVGProps<SVGSVGElement>> } = {
    1: DiceOne,
    2: DiceTwo,
    3: DiceThree,
    4: DiceFour,
    5: DiceFive,
    6: DiceSix,
};

export const Dice: React.FC<DiceProps> = ({ value, isRolling, small = false }) => {
    const FaceComponent = diceFaceMap[value] || DiceOne;
    
    const animationClass = isRolling ? 'animate-tumble' : '';
    const sizeClass = small ? 'w-8 h-8' : 'w-16 h-16';

    return (
        <div className={`${sizeClass} bg-white rounded-lg p-1 shadow-lg transition-all duration-500 ease-out ${animationClass}`}>
           <FaceComponent className="w-full h-full text-red-600" />
        </div>
    );
};