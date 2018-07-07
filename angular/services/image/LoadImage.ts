///<reference path="../../lib/events/EventBus.ts"/>
declare var jQuery:any;
class LoadImage{
    private j:any;

    private canvas:any;
    private context:any;
    private reader:FileReader;
    private img:any;

    constructor(){
        this.j = jQuery.noConflict();

        this.reader = new FileReader();

        this.j("#fileInput").change((event)=>this.onFileSelected(event));
    }

    private renderImage(file:any):void{
        this.canvas = document.getElementById('imageOverlay');
        this.context = this.canvas.getContext('2d');

        this.reader.onload = (event)=>{
            this.onReaderLoadedImage(event);
        };

        this.reader.readAsDataURL(file);
    }

    private onReaderLoadedImage(event:Event):void{
        this.img = new Image();
        this.img.onload = (()=>this.onImageLoaded());

        this.img.src = this.reader.result;
    }
    private onImageLoaded():void{
        this.canvas.width = this.img.width;      // set canvas size big enough for the image
        this.canvas.height = this.img.height;
        this.context.drawImage(this.img,0,0);         // draw the image

        var dataUrl = this.canvas.toDataURL("image/png");
        EventBus.dispatchEvent("ON_IMAGE_LOADED", dataUrl);
    }

    private onFileSelected(event):void{
        this.renderImage(event.target.files[0]);
    }
}