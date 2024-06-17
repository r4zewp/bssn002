export const invoiceBody = (supplier: any, customer: any) => `
<div style="padding: 20px;">
    <p><strong>Supplier:</strong></p>
        <p>${supplier.name}</p>
        <p>${supplier.address}</p>
        <p><strong>Supplier Bank information:</strong></p>
        <p>${supplier.bankAccountNumber}</p>
        <p>SWIFT code: ${supplier.swift}</p>
</div>
<div style="padding: 20px;">
    <h3>Bill To</h3>
        <p>${customer.name}</p>
        <p>${customer.address}</p>
        <p>Registration number: ${customer.address}</p>
        <p><strong>Customer Bank information:</strong></p>
        <p>${customer.account_number}</p>
        <p>SWIFT code: ${customer.swift}</p>
</div>
`;
