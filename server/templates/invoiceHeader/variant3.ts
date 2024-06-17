export const invoiceHeader = (data: any) => `
  <div style="position: relative;">
    <div style="position: absolute; top: 0px; left: -280px; height: 100vh; transform-origin: left top 0; font-size: 24px;">
        <h1 style="transform: rotate(-90deg); margin-top: 100%; ">Invoice: ${data.invoiceNumber}</h1>
    </div>
</div>
`;
