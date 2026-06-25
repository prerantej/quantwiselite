import React from 'react';

export default function NavBar() {
  return (
    <nav className="bg-[#5f259f] text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-full shadow-inner flex items-center justify-center">
            {/* Splitwise Logo SVG representation */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#5f259f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">QuantWise Lite</h1>
            <p className="text-xs text-purple-200">The Splitwise-Lite Expense Tracker</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-xs bg-purple-800/40 px-3 py-1.5 rounded-full border border-purple-400/20 text-purple-100">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Ledger Sync Enabled</span>
        </div>
      </div>
    </nav>
  );
}
