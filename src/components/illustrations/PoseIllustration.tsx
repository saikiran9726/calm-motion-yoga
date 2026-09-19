import React from 'react';

export interface PoseIllustrationProps {
  poseType: 'mountain' | 'tree' | 'warrior2' | 'chair' | 'triangle' | 'catcow' | 'child' | 'downward_dog';
  showAlignment?: boolean;
  className?: string;
}

export const PoseIllustration: React.FC<PoseIllustrationProps> = ({
  poseType,
  showAlignment = false,
  className = 'w-full h-64',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 320 320"
        className="w-full h-full object-contain filter drop-shadow-sm select-none"
      >
        {/* Soft atmospheric background aura */}
        <circle cx="160" cy="160" r="130" fill="#DDEBE4" fillOpacity="0.4" />
        <circle cx="160" cy="160" r="100" fill="#E9DFCF" fillOpacity="0.25" />

        {/* Dynamic Pose Figures */}
        {poseType === 'warrior2' && (
          <g>
            {/* Ground indicator */}
            <path d="M40 280 L280 280" stroke="#DDEBE4" strokeWidth="3" strokeLinecap="round" />
            {/* Back leg (straight) */}
            <path d="M160 170 L80 280" stroke="#123B35" strokeWidth="12" strokeLinecap="round" />
            {/* Front leg (bent 90 deg) */}
            <path d="M160 170 L230 205 L230 280" stroke="#123B35" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            {/* Torso */}
            <path d="M160 170 L160 100" stroke="#123B35" strokeWidth="14" strokeLinecap="round" />
            {/* Head */}
            <circle cx="160" cy="65" r="18" fill="#123B35" />
            {/* Face direction hint */}
            <circle cx="170" cy="63" r="3" fill="#DDEBE4" />
            {/* Back arm */}
            <path d="M160 115 L60 115" stroke="#123B35" strokeWidth="10" strokeLinecap="round" />
            {/* Front arm */}
            <path d="M160 115 L260 115" stroke="#123B35" strokeWidth="10" strokeLinecap="round" />

            {/* Optional Alignment Overlay */}
            {showAlignment && (
              <g>
                {/* Horizontal Arm Alignment Line */}
                <line x1="50" y1="115" x2="270" y2="115" stroke="#E9A99A" strokeWidth="2.5" strokeDasharray="4 3" />
                {/* Vertical Spine Alignment Line */}
                <line x1="160" y1="40" x2="160" y2="280" stroke="#123B35" strokeWidth="2" strokeDasharray="4 3" opacity="0.6" />
                {/* Knee 90 degree angle marker */}
                <circle cx="230" cy="205" r="7" fill="#E9A99A" />
                <path d="M218 205 L218 217 L230 217" fill="none" stroke="#E9A99A" strokeWidth="2" />
                {/* Soft Guidance Tag */}
                <rect x="200" y="145" width="70" height="22" rx="11" fill="#123B35" />
                <text x="235" y="160" textAnchor="middle" fill="#DDEBE4" fontSize="10" fontFamily="sans-serif" fontWeight="bold">90° Knee</text>
              </g>
            )}
          </g>
        )}

        {poseType === 'tree' && (
          <g>
            <path d="M70 280 L250 280" stroke="#DDEBE4" strokeWidth="3" strokeLinecap="round" />
            {/* Standing Leg */}
            <path d="M160 170 L160 280" stroke="#123B35" strokeWidth="12" strokeLinecap="round" />
            {/* Folded Leg resting on inner thigh */}
            <path d="M160 170 L210 200 L160 220" stroke="#123B35" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
            {/* Torso */}
            <path d="M160 170 L160 95" stroke="#123B35" strokeWidth="14" strokeLinecap="round" />
            {/* Head */}
            <circle cx="160" cy="62" r="18" fill="#123B35" />
            {/* Hands in Anjali Mudra prayer at chest */}
            <path d="M160 110 L130 135 L160 130 L190 135 L160 110" stroke="#123B35" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {showAlignment && (
              <g>
                <line x1="160" y1="35" x2="160" y2="280" stroke="#E9A99A" strokeWidth="2.5" strokeDasharray="4 3" />
                <circle cx="160" cy="280" r="6" fill="#E9A99A" />
                <rect x="195" y="175" width="80" height="22" rx="11" fill="#123B35" />
                <text x="235" y="190" textAnchor="middle" fill="#DDEBE4" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Rooted Pelvis</text>
              </g>
            )}
          </g>
        )}

        {poseType === 'mountain' && (
          <g>
            <path d="M90 280 L230 280" stroke="#DDEBE4" strokeWidth="3" strokeLinecap="round" />
            {/* Legs */}
            <path d="M152 170 L152 280" stroke="#123B35" strokeWidth="11" strokeLinecap="round" />
            <path d="M168 170 L168 280" stroke="#123B35" strokeWidth="11" strokeLinecap="round" />
            {/* Torso */}
            <path d="M160 170 L160 90" stroke="#123B35" strokeWidth="14" strokeLinecap="round" />
            {/* Head */}
            <circle cx="160" cy="58" r="18" fill="#123B35" />
            {/* Relaxed Arms at side */}
            <path d="M160 105 L130 175" stroke="#123B35" strokeWidth="9" strokeLinecap="round" />
            <path d="M160 105 L190 175" stroke="#123B35" strokeWidth="9" strokeLinecap="round" />

            {showAlignment && (
              <g>
                <line x1="160" y1="35" x2="160" y2="280" stroke="#E9A99A" strokeWidth="2.5" strokeDasharray="4 3" />
                <line x1="120" y1="105" x2="200" y2="105" stroke="#E9A99A" strokeWidth="2" strokeDasharray="3 3" />
                <rect x="185" y="85" width="80" height="22" rx="11" fill="#123B35" />
                <text x="225" y="100" textAnchor="middle" fill="#DDEBE4" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Even Balance</text>
              </g>
            )}
          </g>
        )}

        {poseType === 'chair' && (
          <g>
            <path d="M80 280 L250 280" stroke="#DDEBE4" strokeWidth="3" strokeLinecap="round" />
            {/* Shin */}
            <path d="M180 280 L180 220" stroke="#123B35" strokeWidth="12" strokeLinecap="round" />
            {/* Thigh (horizontal deep sit) */}
            <path d="M180 220 L120 215" stroke="#123B35" strokeWidth="12" strokeLinecap="round" />
            {/* Torso leaning forward */}
            <path d="M120 215 L170 130" stroke="#123B35" strokeWidth="13" strokeLinecap="round" />
            {/* Head */}
            <circle cx="180" cy="110" r="18" fill="#123B35" />
            {/* Arms reaching upward in line with torso */}
            <path d="M165 140 L230 75" stroke="#123B35" strokeWidth="9" strokeLinecap="round" />

            {showAlignment && (
              <g>
                <line x1="180" y1="280" x2="180" y2="170" stroke="#E9A99A" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="180" cy="220" r="6" fill="#E9A99A" />
                <rect x="50" y="180" width="76" height="22" rx="11" fill="#123B35" />
                <text x="88" y="195" textAnchor="middle" fill="#DDEBE4" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Hips Back</text>
              </g>
            )}
          </g>
        )}

        {poseType === 'triangle' && (
          <g>
            <path d="M50 280 L270 280" stroke="#DDEBE4" strokeWidth="3" strokeLinecap="round" />
            {/* Front Leg */}
            <path d="M160 170 L220 280" stroke="#123B35" strokeWidth="11" strokeLinecap="round" />
            {/* Back Leg */}
            <path d="M160 170 L90 280" stroke="#123B35" strokeWidth="11" strokeLinecap="round" />
            {/* Lateral Torso */}
            <path d="M160 170 L210 120" stroke="#123B35" strokeWidth="12" strokeLinecap="round" />
            {/* Head */}
            <circle cx="225" cy="105" r="17" fill="#123B35" />
            {/* Bottom Arm touching shin */}
            <path d="M190 140 L220 230" stroke="#123B35" strokeWidth="9" strokeLinecap="round" />
            {/* Top Arm reaching vertically */}
            <path d="M190 140 L170 50" stroke="#123B35" strokeWidth="9" strokeLinecap="round" />

            {showAlignment && (
              <g>
                <line x1="170" y1="40" x2="220" y2="240" stroke="#E9A99A" strokeWidth="2.5" strokeDasharray="4 3" />
                <rect x="75" y="70" width="80" height="22" rx="11" fill="#123B35" />
                <text x="115" y="85" textAnchor="middle" fill="#DDEBE4" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Stacked Ribs</text>
              </g>
            )}
          </g>
        )}

        {poseType === 'catcow' && (
          <g>
            <path d="M40 260 L280 260" stroke="#DDEBE4" strokeWidth="3" strokeLinecap="round" />
            {/* Thighs/Knees */}
            <path d="M100 260 L100 190" stroke="#123B35" strokeWidth="12" strokeLinecap="round" />
            {/* Arms/Hands */}
            <path d="M220 260 L220 185" stroke="#123B35" strokeWidth="11" strokeLinecap="round" />
            {/* Curved Spine */}
            <path d="M100 190 Q 160 160 220 185" stroke="#123B35" strokeWidth="14" strokeLinecap="round" fill="none" />
            {/* Head tilted softly upward */}
            <circle cx="245" cy="165" r="17" fill="#123B35" />

            {showAlignment && (
              <g>
                <line x1="220" y1="260" x2="220" y2="170" stroke="#E9A99A" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="100" y1="260" x2="100" y2="170" stroke="#E9A99A" strokeWidth="2" strokeDasharray="3 3" />
                <rect x="120" y="115" width="84" height="22" rx="11" fill="#123B35" />
                <text x="162" y="130" textAnchor="middle" fill="#DDEBE4" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Wave of Spine</text>
              </g>
            )}
          </g>
        )}

        {poseType === 'child' && (
          <g>
            <path d="M30 260 L290 260" stroke="#DDEBE4" strokeWidth="3" strokeLinecap="round" />
            {/* Folded legs sitting on heels */}
            <path d="M90 260 L130 260 L80 225" stroke="#123B35" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            {/* Gentle curved back resting forward */}
            <path d="M80 225 Q 140 200 200 240" stroke="#123B35" strokeWidth="14" strokeLinecap="round" fill="none" />
            {/* Head on ground */}
            <circle cx="215" cy="245" r="16" fill="#123B35" />
            {/* Arms draped forward softly */}
            <path d="M180 220 L260 255" stroke="#123B35" strokeWidth="9" strokeLinecap="round" />

            {showAlignment && (
              <g>
                <line x1="80" y1="225" x2="215" y2="245" stroke="#E9A99A" strokeWidth="2" strokeDasharray="3 3" />
                <rect x="110" y="165" width="94" height="22" rx="11" fill="#123B35" />
                <text x="157" y="180" textAnchor="middle" fill="#DDEBE4" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Relaxed Lower Back</text>
              </g>
            )}
          </g>
        )}

        {poseType === 'downward_dog' && (
          <g>
            <path d="M30 260 L290 260" stroke="#DDEBE4" strokeWidth="3" strokeLinecap="round" />
            {/* Hands rooted */}
            <path d="M230 260 L160 130" stroke="#123B35" strokeWidth="11" strokeLinecap="round" />
            {/* Feet rooted */}
            <path d="M80 260 L160 130" stroke="#123B35" strokeWidth="12" strokeLinecap="round" />
            {/* Apex of Hips */}
            <circle cx="160" cy="130" r="10" fill="#123B35" />
            {/* Head between arms */}
            <circle cx="178" cy="165" r="16" fill="#123B35" />

            {showAlignment && (
              <g>
                <line x1="80" y1="260" x2="160" y2="130" stroke="#E9A99A" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="230" y1="260" x2="160" y2="130" stroke="#E9A99A" strokeWidth="2" strokeDasharray="3 3" />
                <rect x="115" y="85" width="90" height="22" rx="11" fill="#123B35" />
                <text x="160" y="100" textAnchor="middle" fill="#DDEBE4" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Hips Lifted Up</text>
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
