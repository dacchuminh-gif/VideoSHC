import React from 'react';
import { FilmIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-center gap-4 mb-2">
        <FilmIcon className="w-10 h-10 text-[#007dc5]" />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#007dc5]">
          Trợ Lý Video Marketing AI
        </h1>
      </div>
      <p className="text-lg text-gray-600">
        Tạo kịch bản và storyboard video hấp dẫn chỉ trong vài phút.
      </p>
    </header>
  );
};