import React from "react";

const Loader = () => {
  return (
    <div className="relative w-[9px] h-[9px]">
      {Array.from({ length: 10 }).map((_, i) => {
        const rotation = 36 * (i + 1);
        const delay = 0.1 * (i + 1);
        return (
          <div
            key={i}
            className="absolute w-1/2 h-[150%] bg-black animate-[spin-pop_1s_ease_infinite]"
            style={{
              transform: `rotate(${rotation}deg) translate(0, 150%)`,
              animationDelay: `${delay}s`,
            }}
          ></div>
        );
      })}

      <style>{`
        @keyframes spin-pop {
          0%, 10%, 20%, 30%, 50%, 60%, 70%, 80%, 90%, 100% {
            transform: inherit;
          }
          50% {
            transform: inherit translate(0, 225%);
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
