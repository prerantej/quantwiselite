import React, { useState } from 'react';
import NavBar from './components/NavBar';
import ExpenseForm from './components/ExpenseForm';
import SettlementForm from './components/SettlementForm';
import SettlementBoard from './components/SettlementBoard';
import ExpenseHistory from './components/ExpenseHistory';
import useLedger from './hooks/useLedger';

export default function App() {
  const {
    users,
    expenses,
    balances,
    transactions,
    loading,
    error,
    addExpense,
    removeExpense
  } = useLedger();

  const [activeTab, setActiveTab] = useState('expense');
  const [prefill, setPrefill] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  const handleExpenseSubmit = async (expenseData) => {
    const result = await addExpense(expenseData);
    if (result.success) {
      showSuccess('Expense split successfully recorded!');
    }
    return result;
  };

  const handleSettlementSubmit = async (settlementData) => {
    const result = await addExpense(settlementData);
    if (result.success) {
      showSuccess('Direct settlement transfer recorded successfully!');
    }
    return result;
  };

  const handleSettleUpShortcut = (payerId, recipientId, amount) => {
    // Set the prefill target
    setPrefill({ payerId, recipientId, amount });
    // Switch tabs to Settlement
    setActiveTab('settlement');
    // Scroll to the card smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-16 font-sans">
      <NavBar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Global Loading / Error Indicators */}
        {loading && expenses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <svg className="animate-spin h-10 w-10 text-[#5f259f] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-semibold">Synchronizing with ledger...</p>
          </div>
        )}

        {error && !loading && (
          <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg text-rose-800 text-sm flex items-start space-x-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-bold">Sync Error</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Global Toast Success alert */}
        {successMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#1e0a3c] text-white py-3.5 px-5 rounded-xl shadow-2xl flex items-center space-x-3.5 animate-bounce">
            <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
        )}

        {(!loading || expenses.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Forms and Transactions */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Form Card wrapper */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Form Tabs */}
                <div className="flex border-b border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => setActiveTab('expense')}
                    className={`flex-1 py-4 text-center font-bold text-sm transition-all duration-200 border-b-3 flex items-center justify-center space-x-2 ${
                      activeTab === 'expense'
                        ? 'text-[#5f259f] border-b-2 border-[#5f259f] bg-white'
                        : 'text-gray-400 hover:text-[#5f259f]'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Add Bill Share</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('settlement')}
                    className={`flex-1 py-4 text-center font-bold text-sm transition-all duration-200 border-b-3 flex items-center justify-center space-x-2 ${
                      activeTab === 'settlement'
                        ? 'text-[#5f259f] border-b-2 border-[#5f259f] bg-white'
                        : 'text-gray-400 hover:text-[#5f259f]'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Record Cash Payment</span>
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === 'expense' ? (
                    <ExpenseForm users={users} onSubmit={handleExpenseSubmit} />
                  ) : (
                    <SettlementForm 
                      users={users} 
                      onSubmit={handleSettlementSubmit} 
                      prefill={prefill} 
                      onClearPrefill={() => setPrefill(null)} 
                    />
                  )}
                </div>
              </div>

              {/* Transactions History */}
              <ExpenseHistory 
                expenses={expenses} 
                users={users} 
                onDelete={removeExpense} 
              />
            </div>

            {/* Right Column: Live Settlement Board */}
            <div className="lg:col-span-1 lg:sticky lg:top-8">
              <SettlementBoard 
                balances={balances} 
                transactions={transactions} 
                users={users} 
                onSettleClick={handleSettleUpShortcut} 
              />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
