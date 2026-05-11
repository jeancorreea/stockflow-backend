export class LogimatBuilder {
  buildStorageDemand(data: {
    demandNo: string;
    itemNo: string;
    quantity: number;
    zone: string;
  }): string {
    const now = this.getTimestamp();

    return `
<DI_TELEGRAM>
  <header>
    <FULL>
      <HEADER_SOURCE>HOST</HEADER_SOURCE>
      <HEADER_DESTINATION>WMS</HEADER_DESTINATION>
      <HEADER_SEQUENCE>1</HEADER_SEQUENCE>
      <HEADER_CREATIONTIME>${now}</HEADER_CREATIONTIME>
      <HEADER_RECORDTYPENAME>WLSSD001</HEADER_RECORDTYPENAME>
    </FULL>
  </header>

  <body>
    <WLSSD001>
      <clientId>DEFAULT</clientId>
      <demandNo>${data.demandNo}</demandNo>
      <typeId>EM</typeId>
      <zone>${data.zone}</zone>
      <priority>0</priority>

      <WLSSDL001>
        <demandNo>${data.demandNo}</demandNo>
        <sysPartnerLine>1</sysPartnerLine>
        <itemNo>${data.itemNo}</itemNo>
        <baseQty>${data.quantity}</baseQty>
      </WLSSDL001>

    </WLSSD001>
  </body>
</DI_TELEGRAM>
    `.trim();
  }

  private getTimestamp(): string {
    const now = new Date();

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  }
}
