
// Add React import to fix namespace error
import React, { useState } from 'react';
import DropZone from './components/DropZone';
import PreviewCard from './components/PreviewCard';
import ProgressBar from './components/ProgressBar';
import ResultViewer from './components/ResultViewer';
import AdminPanel from './components/AdminPanel';
import { AppStatus, ProcessingState, CompressionMode, PdfStyle } from './types';
import { analyzeTranscript } from './services/aiService';
import { generatePDF } from './services/pdfService';

const App: React.FC = () => {
  const [state, setState] = useState<ProcessingState>({
    status: AppStatus.IDLE,
    progress: 0,
    fileName: null,
    topic: '',
    mode: CompressionMode.STANDARD,
    pdfStyle: PdfStyle.CLASSIC,
    previewText: null,
    generatedSummary: null,
    errorMessage: undefined,
    isAdminOpen: false,
  });

  const handleFileLoaded = (file: File, text: string) => {
    setState(prev => ({
      ...prev,
      fileName: file.name,
      previewText: text,
      errorMessage: undefined,
      status: AppStatus.IDLE 
    }));
  };

  const handleClear = () => {
    setState({
      status: AppStatus.IDLE,
      progress: 0,
      fileName: null,
      topic: '',
      mode: CompressionMode.STANDARD,
      pdfStyle: PdfStyle.CLASSIC,
      previewText: null,
      generatedSummary: null,
      isAdminOpen: false,
    });
  };

  const handleAnalyze = async () => {
    if (!state.previewText || !state.fileName) return;

    try {
      setState(prev => ({ ...prev, status: AppStatus.ANALYZING }));
      await new Promise(r => setTimeout(r, 800));

      setState(prev => ({ ...prev, status: AppStatus.STRUCTURING }));
      const structuredText = await analyzeTranscript(state.previewText, state.topic, state.mode);
      
      setState(prev => ({ 
        ...prev, 
        generatedSummary: structuredText,
        status: AppStatus.REVIEW 
      }));

    } catch (error: any) {
      console.error(error);
      setState(prev => ({ 
        ...prev, 
        status: AppStatus.ERROR,
        errorMessage: error.message || "Произошла непредвиденная ошибка."
      }));
    }
  };

  const handleDownloadPDF = async (style: PdfStyle) => {
    if (!state.generatedSummary || !state.fileName) return;

    try {
      setState(prev => ({ ...prev, status: AppStatus.GENERATING_PDF, pdfStyle: style }));
      await generatePDF(state.generatedSummary, state.fileName, style);
      setState(prev => ({ ...prev, status: AppStatus.COMPLETED }));
    } catch (error: any) {
      console.error(error);
      setState(prev => ({ 
        ...prev, 
        status: AppStatus.ERROR,
        errorMessage: "Ошибка при создании PDF."
      }));
    }
  };

  const isProcessing = state.status === AppStatus.ANALYZING || state.status === AppStatus.STRUCTURING || state.status === AppStatus.GENERATING_PDF;
  const hasFile = !!state.fileName;
  const inReviewMode = state.status === AppStatus.REVIEW;

  return (
    <div className="min-h-screen w-full bg-mono-base flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Ambient Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-mono-lavender/30 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-mono-sage/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Admin Entry Point */}
      <button 
        onClick={() => setState(p => ({...p, isAdminOpen: true}))}
        className="absolute top-6 right-6 p-2 text-gray-300 hover:text-mono-text transition-colors rounded-full hover:bg-white/50 z-20"
        title="Admin Panel"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </button>

      <AdminPanel 
        isOpen={state.isAdminOpen} 
        onClose={() => setState(p => ({...p, isAdminOpen: false}))} 
      />

      {/* Main Container */}
      <div className="w-full max-w-5xl flex flex-col items-center z-10 space-y-10">
        
        {!inReviewMode && (
          <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-4xl md:text-5xl font-bold text-mono-text tracking-tight">
              Моно-ассистент
            </h1>
            <p className="text-gray-400 font-medium">
              Превращаем шум в ясность.
            </p>
          </div>
        )}

        <div className="w-full flex flex-col items-center space-y-8 min-h-[400px]">
          
          {state.status === AppStatus.ERROR && (
             <div className="bg-red-50 text-red-500 px-6 py-4 rounded-2xl border border-red-100 max-w-md text-center shadow-sm">
                <p className="font-bold">Ой!</p>
                <p className="text-sm">{state.errorMessage}</p>
                <button 
                  onClick={() => setState(s => ({...s, status: AppStatus.IDLE}))}
                  className="mt-2 text-xs underline decoration-red-300 underline-offset-2"
                >
                  Попробовать снова
                </button>
             </div>
          )}

          {!hasFile && (
            <DropZone onFileLoaded={handleFileLoaded} disabled={isProcessing} />
          )}

          {hasFile && !isProcessing && !inReviewMode && state.status !== AppStatus.COMPLETED && (
            <div className="w-full flex flex-col items-center gap-6 animate-in fade-in duration-500">
               <PreviewCard 
                  text={state.previewText || ''} 
                  onClear={handleClear} 
                  disabled={isProcessing} 
                />
               
               {/* Controls Panel */}
               <div className="w-full max-w-2xl bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-xl flex flex-col gap-8">
                 
                 {/* Topic Input */}
                 <div className="flex flex-col gap-3">
                   <label htmlFor="topic" className="text-sm font-bold text-mono-text ml-2 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-mono-lavender"></span>
                     Тема урока (необязательно):
                   </label>
                   <input 
                      id="topic"
                      type="text" 
                      value={state.topic}
                      onChange={(e) => setState(prev => ({ ...prev, topic: e.target.value }))}
                      placeholder="Например: Основы дизайна, Введение в Gemini..."
                      className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 focus:outline-none focus:ring-4 focus:ring-mono-lavender/30 transition-all text-mono-text placeholder:text-gray-300"
                   />
                 </div>

                 {/* Mode Selection */}
                 <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-mono-text ml-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-mono-sage"></span>
                      Тип конспекта:
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setState(p => ({ ...p, mode: CompressionMode.STANDARD }))}
                        className={`
                          px-6 py-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-1
                          ${state.mode === CompressionMode.STANDARD 
                            ? 'bg-mono-lavender/20 border-mono-lavender text-mono-text' 
                            : 'bg-white border-transparent text-gray-400 hover:border-gray-100'}
                        `}
                      >
                        <span className="font-bold">Стандартный</span>
                        <span className="text-[10px] opacity-70 uppercase tracking-widest">Максимальное сжатие</span>
                      </button>
                      <button
                        onClick={() => setState(p => ({ ...p, mode: CompressionMode.DETAILED }))}
                        className={`
                          px-6 py-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-1
                          ${state.mode === CompressionMode.DETAILED 
                            ? 'bg-mono-sage/20 border-mono-sage text-mono-text' 
                            : 'bg-white border-transparent text-gray-400 hover:border-gray-100'}
                        `}
                      >
                        <span className="font-bold">Подробный</span>
                        <span className="text-[10px] opacity-70 uppercase tracking-widest">Больше контекста</span>
                      </button>
                    </div>
                 </div>

               </div>

               <button
                onClick={handleAnalyze}
                className="
                  group relative px-16 py-6 rounded-full 
                  bg-mono-lavender text-mono-text font-bold text-xl tracking-wide
                  shadow-[0_20px_40px_-10px_rgba(230,230,250,1)]
                  hover:bg-purple-100 hover:shadow-[0_25px_45px_-10px_rgba(230,230,250,1)]
                  active:scale-95 transition-all duration-300
                "
               >
                 Создать конспект
                 <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-[-100%] h-full w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>
                 </div>
               </button>
            </div>
          )}

          {isProcessing && (
             <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 py-12">
               <div className="w-24 h-24 mb-6 relative">
                 <div className="absolute inset-0 border-4 border-mono-lavender/30 rounded-full"></div>
                 <div className="absolute inset-0 border-t-4 border-mono-lavender rounded-full animate-spin"></div>
               </div>
               <h3 className="text-xl text-mono-text font-semibold">
                {state.status === AppStatus.ANALYZING ? 'Анализируем...' : 
                 state.status === AppStatus.STRUCTURING ? 'Структурируем...' : 'Сохраняем...'}
               </h3>
               <ProgressBar status={state.status} />
             </div>
          )}

          {inReviewMode && state.generatedSummary && (
             <ResultViewer 
                content={state.generatedSummary} 
                onDownload={handleDownloadPDF}
                onBack={() => setState(s => ({...s, status: AppStatus.IDLE}))}
             />
          )}

          {state.status === AppStatus.COMPLETED && (
            <div className="text-center animate-in fade-in zoom-in-95 duration-700 py-12">
               <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-mono-sage/30 text-green-600 mb-6">
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                   <polyline points="20 6 9 17 4 12"></polyline>
                 </svg>
               </div>
               <h2 className="text-2xl font-bold text-mono-text mb-2">Готово!</h2>
               <p className="text-gray-400">Файл успешно сохранен на вашем устройстве.</p>
               <button 
                onClick={handleClear}
                className="mt-8 px-6 py-2 rounded-full border border-gray-200 text-gray-500 hover:border-mono-lavender hover:text-mono-text transition-colors"
               >
                 Обработать другой файл
               </button>
            </div>
          )}
        </div>

      </div>
      
      {!inReviewMode && (
        <div className="absolute bottom-6 text-gray-300 text-xs font-medium">
          Моно-ассистент • Создано для ясности
        </div>
      )}
    </div>
  );
};

export default App;
