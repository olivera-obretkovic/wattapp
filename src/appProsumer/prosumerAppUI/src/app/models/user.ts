export interface User
{
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  role: string;
  email: string;
}

export interface Info{
  powerusage: any;
  deviceId: string;
  deviceTypeName: string;
  macAdress: string;
  manufacturerName: string;
  typeOfDevice: string;
  powerUsage:string;

}
export class ImageUpdate{
  id:any;
  image:any;

  constructor(id:any,image:any){
    this.id = id;
    this.image = image
  }
}