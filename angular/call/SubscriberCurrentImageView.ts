class SubscriberCurrentImageView{
    private canvas:any;
    private ctx:any;
    private image:any;

    constructor(){
        this.canvas = document.getElementById("imageOverlay");
        this.ctx = this.canvas.getContext("2d");
    }
    
    public loadImage(fileData:string):void{
        this.image = new Image();
        this.image.src = fileData;
        this.image.onload = (()=>this.onImageLoaded());
    }

    private onImageLoaded():void{
        this.ctx.drawImage(this.image, 0, 0);
    }
}
