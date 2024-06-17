export const invoiceHeader = (data: any) => `
<div class="header" style="display: flex; flex-direction: row; justify-content: space-between; margin-bottom: 20px; padding-bottom: 20px;">
    <div style="flex: 1; font-size: 45px; line-height: 45px">
        <p style="margin: 0;">${data.companyName}</p>
        Invoice: ${data.invoiceNumber}
    </div>
    <div style="flex: 1; text-align: right;">
        Issue date: <br>
        Due date:
    </div>
</div>
`;
