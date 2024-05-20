import { Pipe, PipeTransform } from "@angular/core";
import { Device } from "./models/device.model";

@Pipe({
  name:'searchDevice'
})
export class FilterPipe implements PipeTransform
{
  transform(devices: any, searchName: string):any {
    if(!devices || !searchName) return devices;

    return devices.filter((device:any)=> device.deviceName.toLocaleLowerCase().includes(searchName.toLocaleLowerCase()));
  }

}
