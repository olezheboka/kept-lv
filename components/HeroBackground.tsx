
export const HeroBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            <svg
                className="absolute w-full h-full scale-125 opacity-30" // scale to cover edges during wave
                viewBox="0 0 1440 800"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="fold-shading" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="black" stopOpacity="0.3" />
                        <stop offset="25%" stopColor="white" stopOpacity="0.1" />
                        <stop offset="50%" stopColor="black" stopOpacity="0.3" />
                        <stop offset="75%" stopColor="white" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="black" stopOpacity="0.3" />
                    </linearGradient>
                </defs>

                {/* 
           Latvian Flag Proportions 2:1:2
           Total Height unit: 500
           Red: 200
           White: 100
           Red: 200
           
           Wave logic: Quadratic Bezier curves.
           M startX, startY Q controlX, controlY endX, endY T ...
           Wave amplitude approx 60 units.
        */}

                <g style={{ transformOrigin: 'center', animation: 'wave 10s ease-in-out infinite alternate' }}>
                    {/* Top Red Band */}
                    <path
                        d="M0,0 
                Q360,80 720,0 
                T1440,0 
                V250 
                Q1080,330 720,250 
                T0,250 
                Z"
                        fill="#9E1B34"
                    />

                    {/* Middle White Band */}
                    <path
                        d="M0,250 
                Q360,330 720,250 
                T1440,250 
                V375 
                Q1080,455 720,375 
                T0,375 
                Z"
                        fill="#FFFFFF" // Using solid white, opacity handled by container or shading
                    />

                    {/* Bottom Red Band */}
                    <path
                        d="M0,375 
                Q360,455 720,375 
                T1440,375 
                V800 
                Q1080,880 720,800 
                T0,800 
                Z"
                        fill="#9E1B34"
                    />

                    {/* Shading Overlay */}
                    <rect x="0" y="0" width="1440" height="800" fill="url(#fold-shading)" style={{ mixBlendMode: 'overlay' }} />
                </g>
            </svg>
        </div>
    );
};
