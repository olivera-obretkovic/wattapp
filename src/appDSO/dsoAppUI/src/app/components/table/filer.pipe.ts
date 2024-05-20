import { Pipe, PipeTransform } from "@angular/core";
import { User } from "models/User";
@Pipe({
    name: 'filterName'
})
export class FilterPipe implements PipeTransform{
    transform(allUsers : User[], _searchByName:string, _searchByAddress:string) {
        if(!allUsers){
            return [];
        }
        if(!_searchByName && !_searchByAddress){
            return allUsers;
        }
        return allUsers.filter((user)=>{
            const matchName = _searchByName ? user.firstName.toLowerCase().includes(_searchByName.toLowerCase()) || user.lastName.toLowerCase().includes(_searchByName.toLowerCase()) : true;
            const matchAddress = _searchByAddress ? user.address.toLowerCase().includes(_searchByAddress.toLowerCase()) || user.city.toLowerCase().includes(_searchByAddress.toLowerCase()) || user.country.toLowerCase().includes(_searchByAddress.toLowerCase()) : true;
            return matchName && matchAddress;
        })
       }
    }

