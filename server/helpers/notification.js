export const LAYWAY_DUE_DATE = ({
  customerId = '',
  customerName = '',
  dueDate = '',
  remainingBalance = ''
}) => {
  return `
  Customer’s Layaway Payment Reminder
  
  Dear Customer ${customerId},
  
  We hope this message finds you well. This is a friendly reminder regarding your layaway purchase with us.
  
  Customer ID: ${customerId}
  Customer Name: ${customerName}
  Due Date: ${dueDate}
  Remaining Balance: ₱${remainingBalance}
  
  We kindly remind you to make your scheduled payments to avoid any inconvenience. Feel free to contact our team if you have any questions or need assistance regarding your layaway plan. Thank you for your cooperation.
  
  Best regards,
  A.V. De Asis Jewelry
`;
};
