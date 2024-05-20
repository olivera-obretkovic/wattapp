import { Injectable } from '@angular/core';
import { ConstellationDetail } from './constellation-detail.model';
import { HttpClient } from "@angular/common/http"
import { lastValueFrom} from "rxjs"

@Injectable({
  providedIn: 'root'
})
export class ConstellationDetailService {

  constructor(private http:HttpClient) { }

  readonly baseURL = 'https://localhost:7234/api/ConstellationDetails';
  formData:ConstellationDetail = new ConstellationDetail();
  list: ConstellationDetail[];

  postConstellationDetail()
  {
    return this.http.post(this.baseURL,this.formData);
  }

  putConstellationDetail()
  {
    return this.http.put(this.baseURL + `/${this.formData.constellationDetailsID}`, this.formData);
  }

  deleteConstellationDetail(id:number)
  {
    return this.http.delete(this.baseURL + "/" + id);
  }

  refreshlist()
  {
    lastValueFrom(  this.http.get(this.baseURL))
    .then(res=>this.list = res as ConstellationDetail[] )
  }


}
