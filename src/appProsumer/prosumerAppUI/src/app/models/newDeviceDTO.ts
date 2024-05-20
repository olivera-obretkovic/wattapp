export class newDeviceDTO {
    public deviceTypeID: string;
    public macAdress: string;
    public deviceName: string;

    constructor(devicetypeid: string, macaddress: string, devicename: string) {
        this.macAdress = macaddress;
        this.deviceTypeID = devicetypeid;
        this.deviceName = devicename;
    }
}
