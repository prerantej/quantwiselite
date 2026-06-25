import React, { useState, useEffect } from 'react';

export default function ExpenseForm({ users, onSubmit }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [percentages, setPercentages] = useState({});
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize values when users are loaded
  useEffect(() => {
    if (users && users.length > 0) {
      if (!payerId) setPayerId(users[0].id);
      splitEqually();
    }
  }, [users]);

  // Helper to split equally across all users
  const splitEqually = () => {
    if (!users || users.length === 0) return;
    const count = users.length;
    const base = Math.floor(100 / count * 100) / 100; // 33.33 for 3 users
    const remainder = Math.round((100 - (base * (count - 1))) * 100) / 100; // 33.34 for the last one
    
    const newPercentages = {};
    users.forEach((user, idx) => {
      newPercentages[user.id] = idx === count - 1 ? remainder : base;
    });
    setPercentages(newPercentages);
  };

  const handlePercentageChange = (userId, value) => {
    const val = Math.min(100, Math.max(0, Number(value) || 0));
    setPercentages(prev => ({
      ...prev,
      [userId]: val
    }));
  };

  const sumPercentages = () => {
    return Object.values(percentages).reduce((sum, p) => sum + Number(p), 0);
  };

  const totalPercentage = Math.round(sumPercentages() * 100) / 100;
  const isBalanced = Math.abs(totalPercentage - 100) < 0.001;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!description.trim()) {
      setLocalError('Please enter a description');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setLocalError('Please enter a valid amount greater than 0');
      return;
    }

    if (!isBalanced) {
      setLocalError(`Percentages must sum up to exactly 100% (currently ${totalPercentage}%)`);
      return;
    }

    setIsSubmitting(true);

    const splitsPayload = Object.keys(percentages).map(userId => ({
      userId,
      percentage: Number(percentages[userId])
    }));

    const result = await onSubmit({
      description,
      amount: numAmount,
      payerId,
      isSettlement: false,
      splits: splitsPayload
    });

    setIsSubmitting(false);

    if (result.success) {
      setDescription('');
      setAmount('');
      splitEqually();
      // Alert/toast is handled by parent, reset state
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

      {/* Input Group: Description & Amount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Item Description</label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Dinner, Rent, Fuel"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-3 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f259f] focus:border-transparent text-sm"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Amount ($)</label>
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
      </div>

      {/* Input Group: Payer */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Who Paid?</label>
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

      {/* Split sliders */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <label className="text-xs font-bold text-[#5f259f] uppercase tracking-wider">Custom Splits (%)</label>
          <button
            type="button"
            onClick={splitEqually}
            className="text-xs text-[#5f259f] hover:underline font-semibold flex items-center space-x-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <span>Split Equally</span>
          </button>
        </div>

        <div className="space-y-4">
          {users.map((user) => {
            const currentPercentage = percentages[user.id] || 0;
            const computedShare = amount ? ((Number(amount) * currentPercentage) / 100).toFixed(2) : '0.00';
            
            return (
              <div key={user.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between md:space-x-4">
                <div className="flex items-center space-x-3 w-32 shrink-0">
                  <div className="h-8 w-8 rounded-full bg-purple-100 text-[#5f259f] font-bold flex items-center justify-center text-sm shadow-inner uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">{user.name}</span>
                </div>
                
                {/* Range Slider */}
                <div className="flex-1 flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentPercentage}
                    onChange={(e) => handlePercentageChange(user.id, e.target.value)}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5f259f]"
                  />
                </div>

                {/* Input and Share Label */}
                <div className="flex items-center justify-between md:justify-end space-x-3 shrink-0">
                  <div className="relative w-16">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentPercentage}
                      onChange={(e) => handlePercentageChange(user.id, e.target.value)}
                      className="w-full text-right pr-4 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f259f] text-sm"
                    />
                    <span className="absolute right-1.5 top-2 text-gray-400 text-xs">%</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium w-16 text-right">
                    ${computedShare}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Validation Sum Status Bar */}
        <div className={`mt-4 p-3 rounded-lg flex items-center justify-between text-xs font-semibold ${
          isBalanced 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span className="flex items-center space-x-1.5">
            {isBalanced ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-600 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span>Split validation check</span>
          </span>
          <span className="text-sm font-bold">{totalPercentage}% / 100%</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isBalanced}
        className={`w-full py-3.5 rounded-lg text-white font-bold shadow transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${
          isBalanced && !isSubmitting
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
            <span>Adding expense...</span>
          </>
        ) : (
          <span>Add Expense</span>
        )}
      </button>
    </form>
  );
}
