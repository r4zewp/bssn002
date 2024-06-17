export const invoiceHeader = (data: any) => `
<div style="background-color: #4CAF50; padding: 10px; color: white; text-align: center;">
    <h1 style="margin: 0;">${data.companyName}</h1>
    <h2 style="margin: 0;">INVOICE: ${data.invoiceNumber}</h2>
</div>
`;
