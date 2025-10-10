// src/components/Logo.jsx

import React from 'react';

// Custom colors
const brownCircleColor = '#A0522D';
const grayTextColor = 'text-orange-700'; 
const scriptStyle = { fontFamily: 'Great Vibes, cursive' };

const Logo = () => {
    return (
        <a href="/" className="flex items-center space-x-2 max-w-full">
            
            {/* T Logo (Circle) */}
            <div 
                className="flex items-center justify-center rounded-full border-4 text-black
                           w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
                style={{ borderColor: brownCircleColor }}
            >
                <span className="font-bold leading-none
                                 text-sm sm:text-lg md:text-xl lg:text-2xl">
                    T
                </span>
            </div>

            {/* TattleTent Text */}
            <span
                className={`font-script font-extrabold ${grayTextColor} 
                            text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl truncate`}
                style={scriptStyle}
            >
                TattleTent
            </span>
        </a>
    );
};

export default Logo;
