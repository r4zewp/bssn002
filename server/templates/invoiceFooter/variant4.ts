export const invoiceFooter = (data: any) => `
<div style="padding: 20px;">
    <table style="width: 100%; border-collapse: collapse; border-top: 2px solid #000; solid #000;">
        <thead>
            <tr>
                <th style="border: 2px solid #000; padding: 8px; background-color: #f2f2f2; text-align: center;">DESCRIPTION</th>
                <th style="border: 2px solid #000; padding: 8px; background-color: #f2f2f2; text-align: center;">AMOUNT</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="border: 2px solid #000; padding: 8px;">
                    ${data.description}
                </td>
                <td style="border: 2px solid #000; padding: 8px;">
                    ${data.amount}
                </td>
            </tr>
            <tr>
                <td style="border: 0px solid #000; padding: 8px;">
                </td>
                <td style="border: 2px solid #000; padding: 8px; font-weight: bold;">
                    TOTAL: ${data.amount} ${data.currency}
                </td>
            </tr>
        </tbody>
    </table>
</div>

`;
