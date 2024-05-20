export interface deviceGroup{
    id: string,
    name: string,
    deviceType: string
}

export interface deviceTypeInformation{
    deviceTypeId: string,
    deviceTypeName: string,
    groupName: string
}
export interface deviceManifacturers{
    manufacturerID: string,
    manufacturerName: string
    
}
export interface deviceGroupManifacturers{
    id:string,
    name: string,
    groupID:string,
    manifacturerID: string,
    manifacturer: string,
    wattage: number,
    devices: string,
    typeOfDevice:string
}
export interface labProducers{
    name: string,
    count: number
}

export interface eachDevice{
    id:string,
    mongodID: string,
    timestampPowerPairs: TimestampPowerPairs[]
}
export interface TimestampPowerPairs{
    timestamp: string,
    powerUsage: number
}