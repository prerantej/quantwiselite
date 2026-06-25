import React from 'react';

export default function SettlementBoard({ balances, transactions, users, onSettleClick }) {
  
  const handleSettleUp = (fromName, toName, amount) => {
    if (!users || !onSettleClick) return;
    const sender = users.find(u => u.name === fromName);
    const receiver = users.find(u => u.name === toName);
    if (sender && receiver) {
      onSettleClick(sender.id, receiver.id, amount);
    }
  };

  return (
    <div className="space-y-6">
      {/* Net Balances Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg text-[#5f259f]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800">Net Balances</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {balances.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No balances recorded yet</p>
          ) : (
            balances.map((userBalance) => {
              const bal = userBalance.netBalance;
              const isOwed = bal > 0.005;
              const isOwes = bal < -0.005;

              return (
                <div key={userBalance.userId} className="flex justify-between items-center py-4">
                  <div className="flex items-center space-x-3">
                    <div className={`h-9 w-9 rounded-full font-bold flex items-center justify-center text-sm shadow-inner uppercase ${
                      isOwed 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : isOwes 
                          ? 'bg-rose-50 text-rose-700' 
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {userBalance.userName.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-700 text-sm">{userBalance.userName}</span>
                  </div>

                  <div className="text-right">
                    {isOwed ? (
                      <span className="text-sm font-bold text-emerald-600">
                        +${bal.toFixed(2)}
                      </span>
                    ) : isOwes ? (
                      <span className="text-sm font-bold text-rose-500">
                        -${Math.abs(bal).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                        Even
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Live Settlement Plan Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg text-[#5f259f]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800">Minimized Debts</h2>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-emerald-50/30 rounded-xl border border-emerald-100/50 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-sm font-bold text-emerald-800">All Settled Up!</p>
              <p className="text-xs text-emerald-600 mt-1">Everyone owes nobody (Even)</p>
            </div>
          ) : (
            transactions.map((tx, idx) => (
              <div key={idx} className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-100 flex items-center justify-between">
                <div className="flex flex-col space-y-0.5">
                  <div className="text-xs font-semibold text-gray-400">
                    PAYMENT REQUIREMENT
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-bold text-gray-800">{tx.from}</span>
                    <span className="text-gray-400 text-xs px-1.5">owes</span>
                    <span className="font-bold text-gray-800">{tx.to}</span>
                  </div>
                  <div className="text-lg font-extrabold text-[#5f259f] pt-1">
                    ${tx.amount.toFixed(2)}
                  </div>
                </div>
                
                <button
                  onClick={() => handleSettleUp(tx.from, tx.to, tx.amount)}
                  className="bg-[#5f259f] hover:bg-[#7e35b7] active:scale-[0.96] text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all duration-150 flex items-center space-x-1"
                >
                  <span>Settle Up</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
