import React from 'react';

export default function ExpenseHistory({ expenses, users, onDelete }) {
  
  const getUserName = (id) => {
    return users.find(u => u.id === id)?.name || 'Unknown User';
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  const handleDelete = (id, desc) => {
    if (window.confirm(`Are you sure you want to delete "${desc}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-2.5 mb-6">
        <div className="p-2 bg-purple-50 rounded-lg text-[#5f259f]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-800">Transaction History</h2>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {expenses.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-300 mb-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-sm font-semibold">No transactions recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">Add expenses or record settlements above</p>
          </div>
        ) : (
          expenses.map((exp) => {
            const payerName = getUserName(exp.payerId);

            if (exp.isSettlement) {
              const recipientName = getUserName(exp.splits[0]?.userId);
              return (
                <div key={exp.id} className="bg-purple-50/30 border border-purple-100 p-4 rounded-xl flex items-center justify-between shadow-sm relative group">
                  <div className="flex items-center space-x-3.5">
                    <div className="bg-purple-100 p-2.5 rounded-full text-[#5f259f] shrink-0">
                      {/* P2P Transfer Arrow Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#5f259f] bg-purple-100/50 px-2 py-0.5 rounded-md uppercase tracking-wider">Settlement</span>
                        <span className="text-xs text-gray-400">{formatDate(exp.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1.5 font-medium">
                        <span className="font-bold text-gray-800">{payerName}</span> paid <span className="font-bold text-gray-800">{recipientName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-base font-extrabold text-[#5f259f]">
                      ${exp.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDelete(exp.id, exp.description)}
                      className="text-gray-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete record"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            }

            // Standard Expense
            return (
              <div key={exp.id} className="bg-white border border-gray-100 hover:border-gray-200 p-4 rounded-xl shadow-sm transition-all duration-150 relative group">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3.5">
                    <div className="bg-purple-50 p-2.5 rounded-full text-[#5f259f] shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">{exp.description}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Paid by <span className="font-semibold text-gray-500">{payerName}</span> • {formatDate(exp.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-base font-bold text-gray-800">
                      ${exp.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDelete(exp.id, exp.description)}
                      className="text-gray-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete record"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Split Details Breakdown */}
                <div className="mt-3.5 pt-3 border-t border-gray-50 bg-gray-50/50 p-2.5 rounded-lg flex flex-wrap gap-y-2 gap-x-4">
                  {exp.splits.map((s) => (
                    <div key={s.userId} className="text-xs text-gray-500 flex items-center space-x-1">
                      <span className="font-semibold text-gray-700">{getUserName(s.userId)}:</span>
                      <span className="bg-gray-150/70 px-1 py-0.5 rounded text-[10px] text-gray-400 font-bold">{s.percentage}%</span>
                      <span className="font-medium text-gray-600">${s.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
