import React, { useState, useRef, useEffect, useCallback } from 'react';

// --- Types ---
interface GameStats {
  hoveredYesBefore: boolean;
  hoveredNoBefore: boolean;
  noHoverCount: number;
}

interface Position {
  top: string | number;
  left: string | number;
  position: 'absolute' | 'static';
  bubblePos?: 'top' | 'bottom';
  bubbleAlign?: 'left' | 'center' | 'right';
}

interface PixelButtonProps {
  onClick?: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'success';
  style?: React.CSSProperties;
  className?: string;
}

interface ActiveMessage {
  text: string;
  source: 'YES' | 'NO';
}

// --- Constants ---
const NO_MESSAGES = [
  "nuh-uh",
  "wrong. choice.",
  "absolutely not.",
  "nice try.",
  "error: 404 love not found",
  "commitment issues?",
  "click yes. do it.",
  "don't be shy.",
  "access denied.",
  "are you lost?",
  "try the green one.",
  "playing hard to get?",
  "i am judging you.",
  "rude.",
  "button disabled by admin.",
  "do not resist.",
  "your mouse slipped.",
];

const ESCALATED_NO_MESSAGES = [
  "you're persistent.",
  "I'm concerned.",
  "stop it.",
  "please.",
  "I have a family.",
  "don't do this.",
  "why are you like this?",
  "i'm telling mom.",
  "emotional damage.",
  "this is going on my blog.",
  "i will cry.",
  "initiating tears.exe...",
  "have you no heart?",
  "is it because i'm pixelated?",
  "you're making a scene.",
  "security!",
  "we could have been great.",
  "don't make me beg.",
  "establishing perimeter...",
  "stop running from love!",
];

// --- Helpers ---
const getRandomMessage = (messages: string[], lastMessage?: string): string => {
  if (messages.length <= 1) return messages[0];
  
  let available = messages;
  if (lastMessage) {
    available = messages.filter(m => m !== lastMessage);
  }
  
  // If we somehow filtered everything out (shouldn't happen with these list sizes), reset
  if (available.length === 0) available = messages;
  
  return available[Math.floor(Math.random() * available.length)];
};

// --- Components ---

const PixelCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white pixel-border pixel-shadow p-6 sm:p-12 max-w-2xl w-full mx-4 relative ${className}`}>
    {children}
  </div>
);

const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(({ 
  onClick, 
  onMouseEnter, 
  onFocus,
  children, 
  variant = 'primary', 
  style = {},
  className = "" 
}, ref) => {
  const bgColors = {
    primary: 'bg-blue-400 hover:bg-blue-300',
    danger: 'bg-red-400 hover:bg-red-300',
    success: 'bg-green-400 hover:bg-green-300',
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      style={style}
      className={`
        ${bgColors[variant]} 
        text-white font-bold py-3 px-6 
        border-4 border-black 
        shadow-[4px_4px_0_0_rgba(0,0,0,1)] 
        active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] 
        active:translate-y-[2px] active:translate-x-[2px]
        transition-none
        uppercase tracking-widest
        text-xs sm:text-sm
        ${className}
      `}
    >
      {children}
    </button>
  );
});
PixelButton.displayName = 'PixelButton';

const SpeechBubble = ({ 
  text, 
  position = 'top', 
  align = 'center' 
}: { 
  text: string; 
  position?: 'top' | 'bottom';
  align?: 'left' | 'center' | 'right';
}) => {
  if (!text) return null;
  
  // Base classes for the bubble container
  const baseClasses = "absolute z-30 pop-in pointer-events-none w-max max-w-[200px]";
  
  // Dynamic classes based on position and alignment
  let posClasses = "";
  
  if (position === 'top') {
    posClasses += "bottom-full mb-4 ";
    if (align === 'center') posClasses += "left-1/2 -translate-x-1/2";
    else if (align === 'left') posClasses += "left-0";
    else if (align === 'right') posClasses += "right-0";
  } else { // bottom
    posClasses += "top-full mt-4 ";
    if (align === 'center') posClasses += "left-1/2 -translate-x-1/2";
    else if (align === 'left') posClasses += "left-0";
    else if (align === 'right') posClasses += "right-0";
  }

  // Tail positioning logic
  const tailBase = "absolute w-2 h-2 bg-white border-black rotate-45";
  let tailClasses = "";
  
  if (position === 'top') {
    // Point down: border-r and border-b
    tailClasses += "border-r-2 border-b-2 bottom-[-5px] ";
    if (align === 'center') tailClasses += "left-1/2 -translate-x-1/2";
    else if (align === 'left') tailClasses += "left-6";
    else if (align === 'right') tailClasses += "right-6";
  } else {
    // Point up: border-t and border-l
    tailClasses += "border-t-2 border-l-2 top-[-5px] ";
    if (align === 'center') tailClasses += "left-1/2 -translate-x-1/2";
    else if (align === 'left') tailClasses += "left-6";
    else if (align === 'right') tailClasses += "right-6";
  }

  return (
    <div className={`${baseClasses} ${posClasses}`}>
      <div className="bg-white border-2 border-black p-3 text-[10px] sm:text-xs leading-tight shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] text-center text-black relative">
        {text}
        {/* Tail */}
        <div className={`${tailBase} ${tailClasses}`}></div>
      </div>
    </div>
  );
};

const FloatingHeart: React.FC<{ id: number; x: number; y: number }> = ({ id, x, y }) => (
  <div 
    className="absolute text-red-500 text-lg animate-float pointer-events-none select-none font-sans"
    style={{ left: x, top: y }}
  >
    ❤
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'ASK' | 'SUCCESS'>('ASK');
  const [stats, setStats] = useState<GameStats>({
    hoveredYesBefore: false,
    hoveredNoBefore: false,
    noHoverCount: 0,
  });
  
  const [noBtnPos, setNoBtnPos] = useState<Position>({ 
    top: 'auto', 
    left: 'auto', 
    position: 'static',
    bubblePos: 'top',
    bubbleAlign: 'center'
  });
  
  const [activeMessage, setActiveMessage] = useState<ActiveMessage | null>(null);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  
  // Refs for logic
  const containerRef = useRef<HTMLDivElement>(null);
  const yesBtnRef = useRef<HTMLButtonElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const heartIdCounter = useRef(0);

  // --- Handlers ---

  const handleYesHover = () => {
    // Heart effect
    if (yesBtnRef.current) {
      const rect = yesBtnRef.current.getBoundingClientRect();
      const parentRect = containerRef.current?.getBoundingClientRect();
      if (parentRect) {
         // Generate 3 hearts at random positions near the button
         const newHearts = Array.from({ length: 3 }).map(() => ({
           id: heartIdCounter.current++,
           x: (rect.left - parentRect.left) + Math.random() * rect.width,
           y: (rect.top - parentRect.top) + Math.random() * rect.height - 20,
         }));
         setHearts(prev => [...prev, ...newHearts]);
         
         // Cleanup hearts after animation
         setTimeout(() => {
           setHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
         }, 1000);
      }
    }

    // Message logic
    let msg = "";
    if (!stats.hoveredYesBefore && !stats.hoveredNoBefore) {
      msg = "I knew you’d pick this instantly. But just for fun… try the other button.";
    } else if (stats.hoveredNoBefore) {
      msg = "Finally. Welcome back to good decisions.";
    }

    if (msg) setActiveMessage({ text: msg, source: 'YES' });
    setStats(prev => ({ ...prev, hoveredYesBefore: true }));
  };

  const moveNoButton = useCallback(() => {
    if (!containerRef.current || !noBtnRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const btn = noBtnRef.current.getBoundingClientRect();
    
    // Calculate safe area (inside container, minus padding)
    const padding = 20; // Reduced padding to give it more space to run
    const maxX = container.width - btn.width - padding;
    const maxY = container.height - btn.height - padding;
    
    let newX = Math.random() * maxX;
    let newY = Math.random() * maxY;

    // Determine bubble placement based on position
    let bubblePos: 'top' | 'bottom' = 'top';
    let bubbleAlign: 'left' | 'center' | 'right' = 'center';

    // If too close to top, show bubble below
    if (newY < 100) {
      bubblePos = 'bottom';
    }

    // If too close to left, align left
    if (newX < 100) {
      bubbleAlign = 'left';
    } 
    // If too close to right, align right
    else if (newX > maxX - 100) {
      bubbleAlign = 'right';
    }

    setNoBtnPos({
      position: 'absolute',
      left: Math.max(padding, newX),
      top: Math.max(padding, newY),
      bubblePos,
      bubbleAlign
    });
  }, []);

  const handleNoInteraction = () => {
    const isFirstTime = !stats.hoveredNoBefore;
    const isFirstHoverOnNoWithoutYes = isFirstTime && !stats.hoveredYesBefore;
    
    let msg = "";

    if (isFirstHoverOnNoWithoutYes) {
      msg = "ok rude??";
    } else {
      // Rotation logic
      const count = stats.noHoverCount;
      if (count < 3) {
         msg = getRandomMessage(NO_MESSAGES, activeMessage?.text);
      } else if (count === 3) {
         msg = "you sure you want to go there?";
      } else {
         msg = getRandomMessage(ESCALATED_NO_MESSAGES, activeMessage?.text);
      }
    }

    setActiveMessage({ text: msg, source: 'NO' });
    setStats(prev => ({ 
      ...prev, 
      hoveredNoBefore: true, 
      noHoverCount: prev.noHoverCount + 1 
    }));
    
    moveNoButton();
  };

  const handleNoFocus = () => {
    handleNoInteraction();
    // Redirect focus to yes to prevent keyboard users from "catching" it easily
    if (yesBtnRef.current) {
        yesBtnRef.current.focus();
    }
  };

  const handleYesClick = () => {
    setGameState('SUCCESS');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative selection:bg-pink-300">
      
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 text-pink-300 text-4xl opacity-50 animate-bounce-pixel" style={{ animationDelay: '0s' }}>♥</div>
      <div className="absolute bottom-20 right-20 text-pink-300 text-6xl opacity-50 animate-bounce-pixel" style={{ animationDelay: '0.5s' }}>♥</div>
      <div className="absolute top-1/2 right-10 text-pink-300 text-2xl opacity-50 animate-bounce-pixel" style={{ animationDelay: '1s' }}>♥</div>

      {gameState === 'ASK' ? (
        <PixelCard className="min-h-[400px] flex flex-col items-center justify-center text-center">
            {/* Reference div for calculating bounds */}
            <div ref={containerRef} className="absolute inset-0 pointer-events-none" />

            {/* Header */}
            <h1 className="text-xl sm:text-2xl md:text-3xl mb-12 leading-relaxed text-gray-800 relative z-10">
              Will you be my<br />
              <span className="text-pink-500">Valentine?</span>
            </h1>

            {/* Buttons Container */}
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 items-center justify-center w-full relative z-10">
              
              {/* YES Button Wrapper */}
              <div className="relative group">
                 {/* Floating Hearts Container */}
                 {hearts.map(h => <FloatingHeart key={h.id} id={h.id} x={h.x} y={h.y} />)}
                 
                 {/* Chat Bubble for YES */}
                 {activeMessage?.source === 'YES' && (
                   <SpeechBubble 
                     text={activeMessage.text} 
                     position="top" 
                     align="center" 
                   />
                 )}

                 <PixelButton 
                    ref={yesBtnRef}
                    onClick={handleYesClick}
                    onMouseEnter={handleYesHover}
                    className="animate-bounce-pixel"
                    variant="success"
                 >
                   YES
                 </PixelButton>
              </div>

              {/* NO Button Wrapper */}
              <div 
                style={noBtnPos.position === 'absolute' ? { 
                    position: 'absolute', 
                    top: noBtnPos.top, 
                    left: noBtnPos.left,
                    transition: 'all 0.1s ease-out' 
                } : { position: 'relative' }}
                className="z-20"
              >
                  {/* Chat Bubble for NO */}
                  {activeMessage?.source === 'NO' && (
                    <SpeechBubble 
                      text={activeMessage.text} 
                      position={noBtnPos.bubblePos || 'top'} 
                      align={noBtnPos.bubbleAlign || 'center'}
                    />
                  )}
                  
                  <PixelButton 
                    ref={noBtnRef}
                    onMouseEnter={handleNoInteraction}
                    onFocus={handleNoFocus}
                    variant="danger"
                  >
                    {stats.noHoverCount >= 3 ? "start ww 3" : "NO"}
                  </PixelButton>
              </div>

            </div>

            <div className="mt-16 text-[10px] text-gray-400 uppercase tracking-widest">
              v1.0.4 // Love_OS
            </div>
        </PixelCard>
      ) : (
        /* SUCCESS STATE */
        <PixelCard className="flex flex-col items-center justify-center text-center animate-bounce-pixel">
            <div className="text-6xl mb-6">💗</div>
            <h1 className="text-2xl sm:text-3xl mb-6 text-gray-800">
              You chose correctly
            </h1>
            <p className="text-xs sm:text-sm leading-loose text-gray-600 mb-8 max-w-md">
              Now you’re officially my Valentine.<br/>
              No take-backs.<br/>
              <span className="text-[10px] text-gray-400">(This is a legally binding HTML page.)</span>
            </p>
            <div className="flex gap-4">
              <PixelButton onClick={() => window.location.reload()} variant="primary">
                Play Again
              </PixelButton>
            </div>
        </PixelCard>
      )}
    </div>
  );
};

export default App;