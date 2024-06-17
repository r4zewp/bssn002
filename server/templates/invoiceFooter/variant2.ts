export const invoiceFooter = (data: any) => `
<div style="padding: 20px;">
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr>
                <th style="border: 1px solid #000; padding: 8px; background-color: #f2f2f2;">DESCRIPTION</th>
                <th style="border: 1px solid #000; padding: 8px; background-color: #f2f2f2;">AMOUNT</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="border: 1px solid #000; padding: 8px;">
                    ${data.description}
                </td>
                <td style="border: 1px solid #000; padding: 8px;">
                    ${data.amount} ${data.currency}
                </td>
            </tr>
        </tbody>
    </table>
    <div style="text-align: right; font-weight: bold; padding-top: 10px;">
        TOTAL: ${data.amount} ${data.currency}
    </div>
</div>
`;
