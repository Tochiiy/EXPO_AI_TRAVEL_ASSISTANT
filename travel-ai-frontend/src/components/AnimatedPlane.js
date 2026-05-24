import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function AnimatedPlane() {
    return (_jsxs("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 1
        }, children: [_jsx("style", { children: `
          @keyframes flyPlaneFixed {
            0% { 
              transform: translate(-20vw, 80vh) rotate(10deg) scale(0.8); 
              opacity: 0; 
            }
            15% { opacity: 0.6; } 
            85% { opacity: 0.6; } 
            100% { 
              transform: translate(120vw, -10vh) rotate(15deg) scale(2.5); 
              opacity: 0; 
            }
          }
        ` }), _jsx("div", { style: {
                    position: 'absolute',
                    fontSize: '7rem',
                    animation: 'flyPlaneFixed 10s ease-in-out infinite',
                    filter: 'drop-shadow(0px 0px 15px rgba(255, 255, 255, 0.8)) drop-shadow(0px 10px 10px rgba(0,0,0,0.5))'
                }, children: "\u2708\uFE0F" })] }));
}
