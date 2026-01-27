
import React, { useState } from 'react';
import { PdfStyle } from '../types';

interface ResultViewerProps {
  content: string;
  onDownload: (style: PdfStyle) => void;
  onBack: () => void;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ content, onDownload, onBack }) => {
  const [selectedStyle, setSelectedStyle] = useState<PdfStyle>(PdfStyle.CLASSIC);

  const styleConfigs = {
    [PdfStyle.CLASSIC]: {
      paperBg: 'bg-[#FAF9FF]', // Light lavender tint
      sidebar: null,
      titleColor: 'text-slate-800',
      accentColor: 'text-mono-lavender',
      borderColor: 'border-mono-lavender',
      bulletIcon: '●',
      bulletColor: 'text-purple-400',
      textColor: 'text-slate-600',
      headingDecoration: 'border-b-4 border-mono-lavender/40 pb-1 inline-block'
    },
    [PdfStyle.ACADEMIC]: {
      paperBg: 'bg-white',
      sidebar: null,
      titleColor: 'text-black',
      accentColor: 'text-zinc-900',
      borderColor: 'border-zinc-200',
      bulletIcon: '■',
      bulletColor: 'text-black',
      textColor: 'text-zinc-800',
      headingDecoration: 'border-l-4 border-black pl-4'
    },
    [PdfStyle.CREATIVE]: {
      paperBg: 'bg-white',
      sidebar: 'w-4 bg-gradient-to-b from-mono-sage to-teal-500 absolute left-0 top-0 h-full opacity-80',
      titleColor: 'text-teal-900',
      accentColor: 'text-teal-600',
      borderColor: 'border-teal-100',
      bulletIcon: '✦',
      bulletColor: 'text-teal-500',
      textColor: 'text-slate-700',
      headingDecoration: 'text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-mono-sage'
    }
  };

  const currentConfig = styleConfigs[selectedStyle];

  const styles = [
    { 
      id: PdfStyle.CLASSIC, 
      name: 'Классика', 
      desc: 'Мягкий лавандовый', 
      color: 'bg-mono-lavender',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      )
    },
    { 
      id: PdfStyle.ACADEMIC, 
      name: 'Академия', 
      desc: 'Строгий ч/б', 
      color: 'bg-zinc-800',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      )
    },
    { 
      id: PdfStyle.CREATIVE, 
      name: 'Креатив', 
      desc: 'Современный тил', 
      color: 'bg-teal-500',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      )
    }
  ];

  return (
    <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header controls */}
      <div className="flex justify-between items-end mb-6 px-2">
        <div>
          <h2 className="text-3xl font-bold text-mono-text mb-1">Предпросмотр конспекта</h2>
          <p className="text-gray-400 text-sm italic">Интерактивный макет вашего PDF-документа</p>
        </div>
        <button 
          onClick={onBack}
          className="text-gray-400 hover:text-mono-text text-sm underline decoration-gray-200 underline-offset-4 transition-colors"
        >
          Вернуться к настройкам
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Style Selection Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h4 className="text-xs font-bold text-mono-text uppercase tracking-widest px-1 opacity-60">Стили оформления</h4>
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`
                  flex-shrink-0 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left
                  ${selectedStyle === style.id 
                    ? 'bg-white border-mono-lavender shadow-lg scale-[1.05] z-10' 
                    : 'bg-white/40 border-transparent hover:bg-white/60'}
                `}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.color} text-white`}>
                  {style.icon}
                </div>
                <div className="hidden sm:block">
                  <p className="font-bold text-mono-text text-xs leading-none mb-1">{style.name}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-tight">{style.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Paper Container (Live Preview) */}
        <div className={`lg:col-span-4 ${currentConfig.paperBg} rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col h-[75vh] relative transition-all duration-700 ease-in-out`}>
          
          {/* Sidebar Decoration */}
          {currentConfig.sidebar && <div className={currentConfig.sidebar}></div>}

          {/* Scrollable Content Area */}
          <div className={`flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar relative z-10 ${currentConfig.sidebar ? 'pl-12 md:pl-20' : ''} transition-all duration-500`}>
            
            {/* Header in Preview */}
            <div className="mb-10 animate-in fade-in duration-1000">
               <h1 className={`text-4xl font-bold ${currentConfig.titleColor} transition-colors duration-500 mb-2`}>Конспект</h1>
               <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  <span>Создано в Моно-ассистент</span>
                  <span className="opacity-30">•</span>
                  <span>{new Date().toLocaleDateString('ru-RU')}</span>
               </div>
               <div className={`mt-6 w-full border-b ${currentConfig.borderColor} transition-colors duration-500`}></div>
            </div>

            <div className={`prose prose-slate prose-lg max-w-none font-medium leading-relaxed ${currentConfig.textColor} transition-colors duration-500`}>
              {content.split('\n').map((line, index) => {
                if (line.startsWith('## ')) {
                  return (
                    <div key={index} className="mt-12 mb-6">
                      <h2 className={`text-2xl font-bold ${currentConfig.titleColor} ${currentConfig.headingDecoration} transition-all duration-500`}>
                        {line.replace('## ', '')}
                      </h2>
                    </div>
                  );
                }
                if (line.startsWith('### ')) {
                  return (
                    <h3 key={index} className={`text-xl font-bold opacity-80 ${currentConfig.titleColor} mt-8 mb-4 transition-colors duration-500`}>
                      {line.replace('### ', '')}
                    </h3>
                  );
                }
                if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                  const text = line.replace(/^[-*]\s/, '').replace(/\*\*/g, '');
                  return (
                    <div key={index} className="flex gap-4 mb-3 ml-2 group animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 30}ms` }}>
                      <span className={`${currentConfig.bulletColor} font-bold transition-colors duration-500 scale-125`}>
                        {currentConfig.bulletIcon}
                      </span>
                      <span className="flex-1 font-normal">{text}</span>
                    </div>
                  );
                }
                if (line.trim() === '') return <div key={index} className="h-4" />;
                
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <p key={index} className="mb-4 animate-in fade-in duration-500 font-normal">
                    {parts.map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} className={`${currentConfig.titleColor} font-black transition-colors duration-500`}>{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>

            {/* Simulated footer */}
            <div className={`mt-20 pt-10 border-t ${currentConfig.borderColor} text-[10px] text-gray-400 text-center uppercase tracking-[0.3em] font-bold opacity-50`}>
              Документ сформирован автоматически
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-8 bg-white/90 backdrop-blur-md border-t border-gray-100 flex justify-between items-center z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Макет PDF</span>
              <span className="text-sm font-bold text-mono-text">A4 • {styles.find(s => s.id === selectedStyle)?.name}</span>
            </div>
            
            <button
              onClick={() => onDownload(selectedStyle)}
              className="
                group relative px-10 py-5 rounded-2xl 
                bg-mono-text text-white font-bold text-lg tracking-wide
                shadow-2xl hover:shadow-black/20 hover:bg-black hover:scale-[1.02]
                active:scale-95 transition-all duration-300 flex items-center gap-4
              "
            >
              <span>Сохранить конспект</span>
              <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-y-0.5 transition-transform">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultViewer;
