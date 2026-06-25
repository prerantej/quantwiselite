import React, { useState, useEffect } from 'react';

export default function SettlementForm({ users, onSubmit, prefill, onClearPrefill }) {
  const [payerId, setPayerId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize dropdowns when users load
  useEffect(() => {
    if (users && users.length > 1) {
      if (!payerId) setPayerId(users[0].id);
      if (!recipientId) setRecipientId(users[1].id);
    }
  }, [users]);

  // Handle prefill updates when user clicks "Settle Up" on the live board
  useEffect(() => {
    if (prefill) {
      if (prefill.payerId) setPayerId(prefill.payerId);
      if (prefill.recipientId) setRecipientId(prefill.recipientId);
      if (prefill.amount) setAmount(prefill.amount.toString());
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefill, onClearPrefill]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!payerId || !recipientId) {
      setLocalError('Please select both sender and receiver');
      return;
    }

    if (payerId === recipientId) {
      setLocalError('The sender and receiver cannot be the same person');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setLocalError('Please enter a valid amount greater than 0');
      return;
    }

    setIsSubmitting(true);

    const payerName = users.find(u => u.id === payerId)?.name || 'Someone';
    const recipientName = users.find(u => u.id === recipientId)?.name || 'Someone';

    const result = await onSubmit({
      description: `${payerName} paid ${recipientName} (Settlement)`,
      amount: numAmount,
      payerId: payerId,
      isSettlement: true,
      splits: [
        {
          userId: recipientId,
          percentage: 100
        }
      ]
    });

    setIsSubmitting(false);

    if (result.success) {
      setAmount('');
      // Keep selected users for convenience or reset
    } else {
      setLocalError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {localError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-700 text-sm flex items-start space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{localError}</span>
        </div>
      )}

      <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50 flex items-center space-x-3 text-xs text-purple-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Recording a settlement directly balances the accounts by adding a peer-to-peer transfer between members.</span>
      </div>

      {/* Select Sender (Who Paid) */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Who is paying (Sender)?</label>
        <select
          value={payerId}
          onChange={(e) => setPayerId(e.target.value)}
          className="w-full px-3 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5f259f] focus:border-transparent text-sm"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* Select Receiver (Who Received) */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Who is receiving (Receiver)?</label>
        <select
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          className="w-full px-3 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5f259f] focus:border-transparent text-sm"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id} disabled={user.id === payerId}>
              {user.name} {user.id === payerId ? '(Sender)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Input Amount */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Amount Paid ($)</label>
        <div className="relative">
          <span className="absolute left-3 top-3.5 text-gray-400 text-sm">$</span>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f259f] focus:border-transparent text-sm"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || payerId === recipientId}
        className={`w-full py-3.5 rounded-lg text-white font-bold shadow transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${
          payerId !== recipientId && !isSubmitting
            ? 'bg-[#5f259f] hover:bg-[#7e35b7] active:scale-[0.98]'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Recording settlement...</span>
          </>
        ) : (
          <span>Record Settlement</span>
        )}
      </button>
    </form>
  );
}
