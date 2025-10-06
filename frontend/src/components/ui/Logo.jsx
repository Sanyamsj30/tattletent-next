// src/components/Logo.jsx

import React from 'react';
// 1. Correctly import the logo file from its source path: src/pictures/logo.png
//import TattleTentFullLogo from './pictures/logo.png'; 

// Define the custom colors based on your theme
const brownCircleColor = '#A0522D';
const grayTextColor = 'text-[#696969]'; 
const scriptStyle = { fontFamily: 'Great Vibes, cursive' }; // Ensure this font is loaded globally

const Logo = () => {
    // If your logo is split (T in circle + TattleTent text), use the structured approach:
    return (
        <a href="/" className="flex items-center space-x-2">
            
            {/* 1. T Logo (The 'T' inside a circle) */}
            <div 
                className="w-12 h-12 rounded-full flex items-center justify-center border-4" 
                style={{ borderColor: brownCircleColor, color: '#000000' }}
            >
                <span className="font-bold text-xl leading-none">T</span>
            </div>

            {/* 2. TattleTent Text (Styled in gray script) */}
            <span 
                className={`text-4xl font-script font-extrabold ${grayTextColor}`} 
                style={scriptStyle}
            >
                TattleTent
            </span>
        </a>
    );
    
    /* --- OR, if your imported TattleTentFullLogo is a single image file containing both elements: ---
    
    return (
        <a href="/" className="flex items-center">
            <img 
                src={TattleTentFullLogo} 
                alt="TattleTent Logo" 
                className="h-8 md:h-10" // Use Tailwind to set the height
            />
        </a>
    );
    */
};

export default Logo;