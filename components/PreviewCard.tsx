import React from 'react';

interface PreviewCardProps {
  text: string;
  onClear: () => void;
  disabled: boolean;
}

const PreviewCard: React.FC<PreviewCardProps> = ({ text, onClear, disabled }) => {
  // Take just the first 300 characters
  const preview = text.slice(0, 350) + (text.length > 350 ? '...' : '');

  return (
    <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(230,230,250,0.8)] border border-white relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-mono-sage"></div>
           <h4 className="text-mono-text font-bold text-lg">Предпросмотр</h4>
        </div>
        {!disabled && (
          <button 
            onClick={onClear}
            className="text-gray-400 hover:text-red-400 transition-colors p-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      
      <div className="bg-mono-base rounded-2xl p-6 text-gray-500 leading-relaxed font-light h-32 overflow-hidden relative">
        {preview}
        {/* Fade out effect at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-mono-base to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default PreviewCard;