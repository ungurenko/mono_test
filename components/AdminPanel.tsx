
import React, { useState, useEffect } from 'react';
import { getUsageStats, getPromptConfig, savePromptConfig, resetPrompts, clearStats } from '../services/storageService';
import { PromptConfig, UsageLog } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'STATS' | 'PROMPTS'>('STATS');
  
  // Data State
  const [stats, setStats] = useState<UsageLog[]>([]);
  const [prompts, setPrompts] = useState<PromptConfig | null>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadData();
    }
  }, [isOpen, isAuthenticated, activeTab]);

  const loadData = () => {
    setStats(getUsageStats());
    setPrompts(getPromptConfig());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'админ' || password === 'admin') {
      setIsAuthenticated(true);
      loadData();
    } else {
      alert("Неверный пароль");
      setPassword('');
    }
  };

  const handleSavePrompts = () => {
    if (prompts) {
      savePromptConfig(prompts);
      alert("Настройки промптов сохранены!");
    }
  };

  const handleResetPrompts = () => {
    if (confirm("Сбросить все промпты к заводским настройкам?")) {
      const defaults = resetPrompts();
      setPrompts(defaults);
    }
  };

  const handleClearStats = () => {
    if (confirm("Очистить историю запросов?")) {
      clearStats();
      setStats([]);
    }
  };

  // Stats Calculation
  const totalRequests = stats.length;
  const totalInput = stats.reduce((acc, curr) => acc + curr.inputTokens, 0);
  const totalOutput = stats.reduce((acc, curr) => acc + curr.outputTokens, 0);
  // Estimate: Input $0.075/1M, Output $0.30/1M (Approx Flash pricing)
  const estCost = ((totalInput / 1000000) * 0.075 + (totalOutput / 1000000) * 0.30).toFixed(4);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mono-text/20 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative border border-white">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-20"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!isAuthenticated ? (
          // LOGIN VIEW
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white to-mono-base">
            <div className="w-16 h-16 bg-mono-lavender rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-mono-lavender/40">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-mono-text mb-2">Вход в Админку</h2>
            <p className="text-gray-400 mb-8 text-sm">Центр управления полетами</p>
            
            <form onSubmit={handleLogin} className="w-full max-w-xs flex flex-col gap-4">
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Пароль..."
                className="w-full px-6 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mono-lavender text-center tracking-widest"
                autoFocus
              />
              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-mono-text text-white font-bold hover:bg-black transition-all active:scale-95"
              >
                Войти
              </button>
            </form>
          </div>
        ) : (
          // DASHBOARD VIEW
          <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-4 bg-white/50">
              <div className="w-10 h-10 bg-mono-text rounded-xl flex items-center justify-center text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-mono-text leading-none">Админ-панель</h2>
                <p className="text-xs text-gray-400 font-medium mt-1">Мониторинг и Настройки</p>
              </div>

              {/* Tabs */}
              <div className="ml-auto flex bg-gray-100 p-1 rounded-xl mr-12">
                <button 
                  onClick={() => setActiveTab('STATS')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'STATS' ? 'bg-white shadow-sm text-mono-text' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Статистика
                </button>
                <button 
                  onClick={() => setActiveTab('PROMPTS')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'PROMPTS' ? 'bg-white shadow-sm text-mono-text' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Промпты
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-[#FAFAFA] p-8">
              
              {activeTab === 'STATS' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Всего запросов</p>
                      <p className="text-4xl font-bold text-mono-text mt-2">{totalRequests}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Токенов (In/Out)</p>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-bold text-mono-text">{(totalInput / 1000).toFixed(1)}k</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-2xl font-bold text-blue-500">{(totalOutput / 1000).toFixed(1)}k</span>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-4 opacity-10">
                        <svg width="60" height="60" viewBox="0 0 24 24" stroke="green" strokeWidth="2" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      </div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Расход (Est.)</p>
                      <p className="text-4xl font-bold text-green-600 mt-2">${estCost}</p>
                    </div>
                  </div>

                  {/* Logs Table */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-mono-text">История операций (Последние 50)</h3>
                      <button onClick={handleClearStats} className="text-xs text-red-400 hover:text-red-600 font-medium">Очистить</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                          <tr>
                            <th className="px-6 py-3">Дата</th>
                            <th className="px-6 py-3">Тема</th>
                            <th className="px-6 py-3">Режим</th>
                            <th className="px-6 py-3 text-right">In Tokens</th>
                            <th className="px-6 py-3 text-right">Out Tokens</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {stats.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-3 text-gray-400 font-mono text-xs">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-3 font-medium text-mono-text truncate max-w-[200px]">
                                {log.topic}
                              </td>
                              <td className="px-6 py-3">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${log.mode === 'STANDARD' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                  {log.mode}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right text-gray-600">{log.inputTokens}</td>
                              <td className="px-6 py-3 text-right text-blue-600 font-bold">{log.outputTokens}</td>
                            </tr>
                          ))}
                          {stats.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                История запросов пуста
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'PROMPTS' && prompts && (
                <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-yellow-800 text-sm flex gap-3">
                    <span className="text-xl">⚠️</span>
                    <p>Изменение системных инструкций напрямую влияет на качество конспектов. Используйте переменные осторожно.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-mono-text ml-1">Роль системы (Base Identity)</label>
                    <textarea 
                      value={prompts.systemRole}
                      onChange={e => setPrompts({...prompts, systemRole: e.target.value})}
                      className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-mono-lavender focus:ring-4 focus:ring-mono-lavender/20 outline-none transition-all text-sm leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-mono-text ml-1">Инструкция: Стандартный</label>
                      <textarea 
                        value={prompts.standardInstruction}
                        onChange={e => setPrompts({...prompts, standardInstruction: e.target.value})}
                        className="w-full h-48 p-4 rounded-xl border border-gray-200 focus:border-mono-lavender focus:ring-4 focus:ring-mono-lavender/20 outline-none transition-all text-sm leading-relaxed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-mono-text ml-1">Инструкция: Подробный</label>
                      <textarea 
                        value={prompts.detailedInstruction}
                        onChange={e => setPrompts({...prompts, detailedInstruction: e.target.value})}
                        className="w-full h-48 p-4 rounded-xl border border-gray-200 focus:border-mono-lavender focus:ring-4 focus:ring-mono-lavender/20 outline-none transition-all text-sm leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between items-center border-t border-gray-200">
                    <button 
                      onClick={handleResetPrompts}
                      className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors"
                    >
                      Сбросить к умолчанию
                    </button>
                    <button 
                      onClick={handleSavePrompts}
                      className="px-8 py-3 bg-mono-text text-white font-bold rounded-xl shadow-lg hover:bg-black hover:shadow-xl active:scale-95 transition-all"
                    >
                      Сохранить изменения
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
