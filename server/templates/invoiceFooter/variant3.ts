export const invoiceFooter = (data: any) => `
<div class="footer" style="margin-left: 10px; margin-right: 10px;">
    <table class="table-container" style="width: 100%; border-collapse: collapse; border-top: 2px solid #000; border-bottom: 2px solid #000;">
        <thead>
            <tr>
                <th style="border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 8px; background-color: #f2f2f2; text-align: left;">Description</th>
                <th style="border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 8px; background-color: #f2f2f2; text-align: left;">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 8px;">
                    ${data.description}
                </td>
                <td style="border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 8px;">
                    ${data.amount} ${data.currency}
                </td>
            </tr>
        </tbody>
    </table>
    <div class="total" style="text-align: right; font-weight: bold; padding-top: 10px; solid #000;">
        Total: ${data.amount} ${data.currency}
    </div>
</div>
`;
