import React from 'react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#3057F2] rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">N!</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#3057F2] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#677c92] text-lg">Carregando NIAH!...</span>
        </div>
      </div>
    </div>
  );
}
