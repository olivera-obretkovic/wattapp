export class Request{
    RequestId: string;
    FirstName!:string;
    LastName!:string;
    Address!:string;
    UserID:string;

    constructor(requestId: string, userID: string) {
        this.RequestId = requestId;
        this.UserID = userID;
      }
}