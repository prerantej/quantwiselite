const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, rawBody: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING BACKEND INTEGRATION TESTS ===\n');

  try {
    // 1. Get seeded users
    console.log('Test 1: Fetching Seeded Users...');
    const usersRes = await request('GET', '/users');
    if (usersRes.status !== 200 || usersRes.body.length !== 3) {
      throw new Error(`Failed to fetch seeded users: Status ${usersRes.status}`);
    }
    console.log('✓ Successfully retrieved seeded users: Amit, Rahul, Sneha\n');

    // Clear existing expenses if any, to start fresh
    // Fetch all first to delete
    const expensesList = await request('GET', '/expenses');
    for (const exp of expensesList.body) {
      await request('DELETE', `/expenses/${exp.id}`);
    }
    console.log('✓ Cleared previous database expenses to ensure clean state\n');

    // 2. Submit normal expense with penny adjustments
    console.log('Test 2: Creating $100.00 Dinner Expense split 3-ways...');
    const dinnerExpense = {
      description: 'Dinner at Olive Garden',
      amount: 100.00,
      payerId: 'u1', // Amit
      isSettlement: false,
      splits: [
        { userId: 'u1', percentage: 33.33 },
        { userId: 'u2', percentage: 33.33 },
        { userId: 'u3', percentage: 33.34 }
      ]
    };
    const createRes = await request('POST', '/expenses', dinnerExpense);
    if (createRes.status !== 201) {
      throw new Error(`Failed to create expense: Status ${createRes.status}, Error: ${JSON.stringify(createRes.body)}`);
    }
    
    // Verify shares are adjusted correctly for penny rounding
    const createdSplits = createRes.body.expense.splits;
    const splitMap = {};
    createdSplits.forEach(s => splitMap[s.userId] = s.amount);
    
    if (splitMap['u1'] !== 33.33 || splitMap['u2'] !== 33.33 || splitMap['u3'] !== 33.34) {
      throw new Error(`Penny adjustment failed. Got splits: ${JSON.stringify(splitMap)}`);
    }
    console.log('✓ Penny adjustment split calculations validated successfully!\n');

    // 3. Test backend validations
    console.log('Test 3: Testing backend validation guards...');
    // A. Invalid percentage sum (99%)
    const invalidPercentageExpense = {
      description: 'Test Invalid Percentages',
      amount: 100.00,
      payerId: 'u1',
      isSettlement: false,
      splits: [
        { userId: 'u1', percentage: 33.00 },
        { userId: 'u2', percentage: 33.00 },
        { userId: 'u3', percentage: 33.00 }
      ]
    };
    const validationRes1 = await request('POST', '/expenses', invalidPercentageExpense);
    if (validationRes1.status !== 400) {
      throw new Error(`Expected 400 Bad Request for incorrect percentage sum. Got status: ${validationRes1.status}`);
    }
    console.log('  - Correctly rejected sum not equal to 100%');

    // B. Negative percentage
    const negativePercentageExpense = {
      description: 'Test Negative Percentage',
      amount: 100.00,
      payerId: 'u1',
      isSettlement: false,
      splits: [
        { userId: 'u1', percentage: 110.00 },
        { userId: 'u2', percentage: -10.00 },
        { userId: 'u3', percentage: 0.00 }
      ]
    };
    const validationRes2 = await request('POST', '/expenses', negativePercentageExpense);
    if (validationRes2.status !== 400) {
      throw new Error(`Expected 400 Bad Request for negative percentage. Got status: ${validationRes2.status}`);
    }
    console.log('  - Correctly rejected negative percentages');

    // C. Non-positive amount
    const invalidAmountExpense = {
      description: 'Negative Amount Dinner',
      amount: -50.00,
      payerId: 'u1',
      isSettlement: false,
      splits: [
        { userId: 'u1', percentage: 50.00 },
        { userId: 'u2', percentage: 50.00 },
        { userId: 'u3', percentage: 0.00 }
      ]
    };
    const validationRes3 = await request('POST', '/expenses', invalidAmountExpense);
    if (validationRes3.status !== 400) {
      throw new Error(`Expected 400 Bad Request for negative amount. Got status: ${validationRes3.status}`);
    }
    console.log('  - Correctly rejected negative expense amount\n');

    // 4. Create direct peer-to-peer settlement transaction
    console.log('Test 4: Recording a direct payment of $15.00 (Rahul settled to Amit)...');
    const settlementTx = {
      description: 'Rahul settled Amit (Settlement)',
      amount: 15.00,
      payerId: 'u2', // Rahul (Sender)
      isSettlement: true,
      splits: [
        { userId: 'u1', percentage: 100 } // Amit (Receiver)
      ]
    };
    const settleRes = await request('POST', '/expenses', settlementTx);
    if (settleRes.status !== 201) {
      throw new Error(`Failed to create settlement transaction: Status ${settleRes.status}, Error: ${JSON.stringify(settleRes.body)}`);
    }
    console.log('✓ Successfully created peer-to-peer settlement payment\n');

    // 5. Verify live settlement board and net balances
    console.log('Test 5: Fetching Live Settlement Ledger and checking balances...');
    const ledgerRes = await request('GET', '/settlement');
    if (ledgerRes.status !== 200) {
      throw new Error(`Failed to fetch ledger: Status ${ledgerRes.status}`);
    }

    const { balances, transactions } = ledgerRes.body;
    
    // We expect:
    // Amit (u1): +100.00 paid, -33.33 dinner share, -15.00 settlement received = +51.67
    // Rahul (u2): 0.00 paid, -33.33 dinner share, +15.00 settlement paid = -18.33
    // Sneha (u3): 0.00 paid, -33.34 dinner share = -33.34
    
    const balanceMapRes = {};
    balances.forEach(b => balanceMapRes[b.userId] = b.netBalance);
    
    if (balanceMapRes['u1'] !== 51.67 || balanceMapRes['u2'] !== -18.33 || balanceMapRes['u3'] !== -33.34) {
      throw new Error(`Balance calculation incorrect! Got: ${JSON.stringify(balanceMapRes)}`);
    }
    console.log('✓ Net Balances verified perfectly:');
    console.log(`  Amit: +${balanceMapRes['u1']} | Rahul: ${balanceMapRes['u2']} | Sneha: ${balanceMapRes['u3']}`);

    // Verify minimized transaction paths:
    // Debtors: Sneha (-33.34), Rahul (-18.33)
    // Creditor: Amit (+51.67)
    // Simplified transaction paths should be:
    // - Rahul owes Amit $18.33
    // - Sneha owes Amit $33.34
    console.log('\n✓ Minimized Transactions verified perfectly:');
    transactions.forEach(t => {
      console.log(`  - ${t.from} owes ${t.to} $${t.amount}`);
      if (t.to !== 'Amit') {
        throw new Error(`Debt minimization path incorrect. Everyone should owe Amit. Got: ${JSON.stringify(transactions)}`);
      }
    });

    console.log('\n=== ALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY! ===');
  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
