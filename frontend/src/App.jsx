import React, { useState } from 'react';
import NavBar from './components/NavBar';
import ExpenseForm from './components/ExpenseForm';
import SettlementForm from './components/SettlementForm';
import SettlementBoard from './components/SettlementBoard';
import ExpenseHistory from './components/ExpenseHistory';

export default function App() {
  const [activeTab, setActiveTab] = useState('expense');

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form and History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('expense')}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    activeTab === 'expense'
                      ? 'text-phonepe-primary border-b-2 border-phonepe-primary bg-phonepe-light/30'
                      : 'text-gray-500 hover:text-phonepe-primary'
                  }`}
                >
                  Add Expense
                </button>
                <button
                  onClick={() => setActiveTab('settlement')}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    activeTab === 'settlement'
                      ? 'text-phonepe-primary border-b-2 border-phonepe-primary bg-phonepe-light/30'
                      : 'text-gray-500 hover:text-phonepe-primary'
                  }`}
                >
                  Record Settlement
                </button>
              </div>
              <div className="p-6">
                {activeTab === 'expense' ? <ExpenseForm /> : <SettlementForm />}
              </div>
            </div>
            <ExpenseHistory />
          </div>

          {/* Right Column: Live Settlement Board */}
          <div className="lg:col-span-1">
            <SettlementBoard />
          </div>
        </div>
      </div>
    </div>
  );
}
