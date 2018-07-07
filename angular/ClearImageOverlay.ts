declare var jQuery:any;
class ClearImageOverlay{
    private j:any;

    constructor(){
        this.j = jQuery.noConflict();
        var canvas:any = document.getElementById('imageOverlay');
        var context:any = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}
