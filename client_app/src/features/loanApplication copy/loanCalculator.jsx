import React, { useState, useEffect, memo } from 'react';

import InputText from '../../components/Input/InputText';


const LoanCalculator = memo(({
  setFieldValue,
  handleBlur,
  values,
  calculatorLoanAmmount = 5000,
  calculatorInterestRate = 36,
  calculatorMonthsToPay = 6,
  calculatorTotalAmountToPay = 0,
  isReadOnly = false
}) => {

  console.log({ isReadOnly })


  const [loanAmount, setLoanAmount] = useState(calculatorLoanAmmount);
  const [interestRate, setInterestRate] = useState(calculatorInterestRate); // Editable interest rate
  const [totalPayment, setTotalPayment] = useState(0); // Will be calculated automatically
  const [loanDuration, setLoanDuration] = useState(calculatorMonthsToPay);
  const [payments, setPayments] = useState([]);
  const [balance, setBalance] = useState(loanAmount);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    // Calculate total payment based on loan amount and interest rate
    const computedTotalPayment = loanAmount * (1 + interestRate / 100);

    // Set the total payment directly without rounding
    setTotalPayment(computedTotalPayment);

    // Calculate the interest (Total Payment - Loan Amount)
    const interest = computedTotalPayment - loanAmount;

    // Calculate the monthly interest and principal payment
    const monthlyInterestAmount = interest / loanDuration; // No rounding
    const principal = loanAmount / loanDuration;  // No rounding
    let remainingBalance = computedTotalPayment;
    let paymentDetails = [];
    let remainingPrincipal = loanAmount;

    for (let i = 1; i <= loanDuration; i++) {
      const amountPrincipal = principal; // No rounding

      const amount = principal + monthlyInterestAmount; // No rounding
      remainingBalance = remainingBalance - amount;  // Subtract the principal from the remaining balance

      remainingPrincipal = i === 1 ? remainingPrincipal : remainingPrincipal - amountPrincipal;  // Subtract the principal from the remaining balance

      paymentDetails.push({
        transactionDate: new Date(2024, i - 1, 15).toLocaleDateString(),
        principal: remainingPrincipal,  // First row shows full loan amount, others show the regular principal
        amount: amount,  // Total monthly payment without rounding
        interestAmount: monthlyInterestAmount, // Interest without rounding
        dueAmount: amount, // Due amount without rounding
        datePaid: new Date(2024, i - 1, 15).toLocaleDateString(),
        remainingBalance: remainingBalance,
        amountPrincipal: amountPrincipal
      });
    }

    setPayments(paymentDetails);
    setBalance(remainingBalance);
  }, [loanAmount, interestRate, loanDuration]); // Dependency array to recalculate on these state changes

  // Calculate totals for Amount and Interest Amount
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalInterestAmount = payments.reduce((sum, payment) => sum + payment.interestAmount, 0);
  const totalDueAmount = payments.reduce((sum, payment) => sum + payment.dueAmount, 0);

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-md">
      {/* <h4 className="text-2xl font-bold mb-8 text-center text-gray-800">Loan Calculator</h4> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div>
          <label htmlFor="loanAmount" className="block text-sm font-semibold text-gray-700 mb-2">Loan Amount</label>

          <InputText
            isRequired
            placeholder=""
            disabled={isReadOnly}
            name="calculatorLoanAmmount"
            type="number"
            value={values?.calculatorLoanAmmount} // Bind value to Formik state
            onBlur={handleBlur}
            onChange={(e) => {
              setLoanAmount(Number(e.target.value))
              setFieldValue('calculatorLoanAmmount', e.target.value)
            }}
            isReadOnly



          />

        </div>
        <div>
          <label htmlFor="interestRate" className="block text-sm font-semibold text-gray-700 mb-2">Interest Rate (%)</label>
          {/* <input
            id="interestRate"
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          /> */}
          <InputText
            isRequired
            placeholder=""
            disabled={isReadOnly}
            name="calculatorInterestRate"
            type="number"
            value={values?.calculatorInterestRate} // Bind value to Formik state
            onBlur={handleBlur}
            onChange={(e) => {
              setInterestRate(Number(e.target.value))
              setFieldValue('calculatorInterestRate', e.target.value)
            }}
            isReadOnly
          />

        </div>
        <div>
          <label htmlFor="loanDuration" className="block text-sm font-semibold text-gray-700 mb-2">Loan Duration (Months)</label>
          {/* <input
            id="loanDuration"
            type="number"
            value={loanDuration}

            onChange={(e) => setLoanDuration(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          /> */}

          <InputText
            isRequired
            disabled={isReadOnly}
            placeholder=""
            name="calculatorMonthsToPay"
            type="number"
            value={values?.calculatorMonthsToPay} // Bind value to Formik state
            onBlur={handleBlur}
            onChange={(e) => {
              setLoanDuration(Number(e.target.value))
              setFieldValue('calculatorMonthsToPay', e.target.value)
            }}
            isReadOnly
          />

        </div>
        <div>
          <label htmlFor="totalPayment" className="block text-sm font-semibold text-gray-700 mb-2">Total Payment (₱)</label>
          <input
            id="totalPayment"
            type="number"
            value={totalPayment.toFixed(2)}
            readOnly
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none"
          />
        </div>
      </div>

      <table className="w-full mt-8 table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-3 text-left text-sm text-gray-700">No.</th>
            <th className="px-4 py-3 text-left text-sm text-gray-700">Transaction Date</th>
            <th className="px-4 py-3 text-left text-sm text-gray-700">Principal</th>
            <th className="px-4 py-3 text-left text-sm text-gray-700">Amount</th>
            <th className="px-4 py-3 text-left text-sm text-gray-700">Interest Amount</th>
            <th className="px-4 py-3 text-left text-sm text-gray-700">Due Amount</th>
            <th className="px-4 py-3 text-left text-sm text-gray-700">Date Paid</th>
            <th className="px-4 py-3 text-left text-sm text-gray-700">Balance</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{payment.transactionDate}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(payment.principal)}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(payment.amountPrincipal)}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(payment.interestAmount)}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(payment.dueAmount)}</td>
              <td className="px-4 py-3 text-sm text-gray-700"></td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(payment.remainingBalance)}</td>
            </tr>
          ))}
          {/* Total Row */}
          <tr className="bg-gray-200 font-semibold">
            <td colSpan="3" className="px-4 py-3 text-sm text-gray-700">Total</td>
            <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(totalAmount)}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(totalInterestAmount)}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(totalDueAmount)}</td>
            <td className="px-4 py-3 text-sm text-gray-700"></td>
            <td className="px-4 py-3 text-sm text-gray-700"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

export default LoanCalculator;
