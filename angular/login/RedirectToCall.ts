class RedirectToCall{
    constructor(window:any, isOwner:boolean){
        if(isOwner){
            window.location.href = '#/publisherCall';
        }
        else{
            window.location.href = '#/subscriberCall';
        }
    }
}
