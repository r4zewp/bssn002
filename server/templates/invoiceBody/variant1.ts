export const invoiceBody = (supplier: any, customer: any) => `
<div class="details" style="padding: 20px">
    <div style="width: 48%;">
        <p><strong>Supplier:</strong></p>
        <p>${supplier.name}</p>
        <p>${supplier.address}</p>
        <p><strong>Supplier Bank information:</strong></p>
        <p>${supplier.bankAccountNumber}</p>
        <p>SWIFT code: ${supplier.swift}</p>
    </div>
    <div style="width: 48%;">
        <p><strong>Customer:</strong></p>
        <p>${customer.name}</p>
        <p>${customer.address}</p>
        <p>Registration number: ${customer.address}</p>
        <p><strong>Customer Bank information:</strong></p>
        <p>Bank name: ${customer.bank_name}</p>
        <p>Bank address: ${customer.bank_address}</p>
        <p>TAX ID: ${customer.tax_id}</p>
        <p>SWIFT code: ${customer.swift}</p>
        <p>Bank account number: ${customer.account_number}</p>
    </div>
</div>
`;
