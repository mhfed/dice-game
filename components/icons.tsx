
import React from 'react';

const sharedDotProps = {
    cx: "50",
    cy: "50",
    r: "14",
    fill: "currentColor"
};

export const DiceOne: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" {...props}>
        <circle {...sharedDotProps} />
    </svg>
);

export const DiceTwo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" {...props}>
        <circle {...sharedDotProps} cx="25" cy="25" />
        <circle {...sharedDotProps} cx="75" cy="75" />
    </svg>
);

export const DiceThree: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" {...props}>
        <circle {...sharedDotProps} cx="25" cy="25" />
        <circle {...sharedDotProps} />
        <circle {...sharedDotProps} cx="75" cy="75" />
    </svg>
);

export const DiceFour: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" {...props}>
        <circle {...sharedDotProps} cx="25" cy="25" />
        <circle {...sharedDotProps} cx="75" cy="25" />
        <circle {...sharedDotProps} cx="25" cy="75" />
        <circle {...sharedDotProps} cx="75"cy="75" />
    </svg>
);

export const DiceFive: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" {...props}>
        <circle {...sharedDotProps} cx="25" cy="25" />
        <circle {...sharedDotProps} cx="75" cy="25" />
        <circle {...sharedDotProps} />
        <circle {...sharedDotProps} cx="25" cy="75" />
        <circle {...sharedDotProps} cx="75"cy="75" />
    </svg>
);

export const DiceSix: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" {...props}>
        <circle {...sharedDotProps} cx="25" cy="25" />
        <circle {...sharedDotProps} cx="75" cy="25" />
        <circle {...sharedDotProps} cx="25" cy="50" />
        <circle {...sharedDotProps} cx="75" cy="50" />
        <circle {...sharedDotProps} cx="25" cy="75" />
        <circle {...sharedDotProps} cx="75"cy="75" />
    </svg>
);
