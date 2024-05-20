export interface User{
    id: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    address: string,
    city: string,
    country: string,
    email: string,
    sharesDataWithDso: boolean,
    dsoHasControl: boolean,
    consumption:number,
    production:number,
    summary:number,
    selected: boolean,
}
export interface Device{
    deviceId: string;
    deviceTypeName: string;
    macAdress: string;
    manufacturerName: string;
    typeOfDevice: string;
    powerusage:number;
    dsoHasControl:boolean;
   
}
export interface Role{
    email: string,
    firstName: string,
    id: string,
    lastName: string,
    phoneNumber: string,
    role: string
}
export interface Info{
    powerusage: any;
    deviceId: string;
    deviceTypeName: string;
    macAdress: string;
    manufacturerName: string;
    typeOfDevice: string;
    statusOfDevice:string;
    dsoHasControl:boolean;
 
}
export interface ExportSelected{
    firstName: string,
    lastName: string,
    address: string,
    city: string,
    country: string,
    consumption:number,
    production:number,
    email:string
}

export interface DeviceType{
    id: string,
    name: string,
    groupID: string,
    group: DeviceGroup;
    manifacturerID: string,
    manifacturer: DeviceManifacturers,
    wattage: number,
    devices: Device[]
}

export interface DeviceGroup{
    id: string,
    name: string,
    devicesTypes: DeviceType[];
}
export interface DeviceManifacturers{
    id: string,
    name: string,
    deviceTypes: DeviceType[];
}
export type Root = Root2[]

export interface Root2 {
  mongoId: any
  id: string
  timestampPowerPairs: TimestampPowerPair[]
}

export interface TimestampPowerPair {
  timestamp: string
  powerUsage: number
}
