import React, { useCallback, useState } from 'react';

interface DropZoneProps {
  onFileLoaded: (file: File, text: string) => void;
  disabled: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileLoaded, disabled }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const processFile = (file: File) => {
    if (file.type !== 'text/plain') {
      alert("Пожалуйста, загрузите файл формата .txt");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onFileLoaded(file, text);
    };
    reader.readAsText(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [disabled]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`
        relative overflow-hidden transition-all duration-500 ease-out
        w-full max-w-2xl h-80 rounded-[3rem]
        flex flex-col items-center justify-center text-center p-8
        border-4 border-dashed
        ${disabled ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' : 'cursor-pointer'}
        ${isDragActive 
          ? 'border-mono-lavender bg-mono-lavender/20 scale-[1.02]' 
          : 'border-mono-lavender/50 bg-white hover:border-mono-lavender hover:bg-mono-base'}
      `}
    >
      <input
        type="file"
        accept=".txt"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      
      {/* Decorative Icon */}
      <div className={`mb-6 transition-transform duration-700 ${isDragActive ? 'scale-110 -rotate-12' : 'animate-float'}`}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M9 12H15" stroke="#B0E0E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M9 16H15" stroke="#B0E0E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M10 20H14C16.2091 20 18 18.2091 18 16V8C18 5.79086 16.2091 4 14 4H10C7.79086 4 6 5.79086 6 8V16C6 18.2091 7.79086 20 10 20Z" stroke="#B0E0E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h3 className="text-2xl font-semibold text-mono-text mb-2">
        {isDragActive ? "Отпускайте..." : "Загрузите текст"}
      </h3>

      <p className="text-gray-400 font-medium max-w-xs mx-auto">
        Перетащите .txt файл с текстом урока или лекции
      </p>

      {!disabled && (
        <div className="mt-8 px-6 py-2 bg-mono-lavender/30 text-mono-text rounded-full text-sm font-semibold transition-colors hover:bg-mono-lavender/50">
          Выбрать файл
        </div>
      )}
    </div>
  );
};

export default DropZone;