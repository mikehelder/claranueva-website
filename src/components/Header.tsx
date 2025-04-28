
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6">
      <div className="container flex flex-col items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ayurveda-terra flex items-center justify-center">
            <span className="text-white font-semibold text-lg">अ</span>
          </div>
          <h1 className="text-3xl font-bold text-ayurveda-terra">आयुर्वेद पाकशास्त्र</h1>
        </div>
        <p className="text-ayurveda-wood mt-2 italic font-light">Ayurveda Recipe Scribe</p>
      </div>
    </header>
  );
};

export default Header;
