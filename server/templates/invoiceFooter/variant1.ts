export const invoiceFooter = (data: any) => `
<div class="footer" style="margin-left: 10px; margin-right: 10px;">
    <table class="table-container" style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr>
                <th style="border: 1px solid #000; padding: 8px; background-color: #f2f2f2; text-align: left;">Description</th>
                <th style="border: 1px solid #000; padding: 8px; background-color: #f2f2f2; text-align: left;">Amount</th>
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
    <div class="total" style="text-align: right; font-weight: bold; padding-top: 10px;">
        Total: ${data.amount} ${data.currency}
    </div>
</div>
`;
