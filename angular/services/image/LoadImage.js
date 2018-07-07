///<reference path="../../lib/events/EventBus.ts"/>
var LoadImage = (function () {
    function LoadImage() {
        var _this = this;
        this.j = jQuery.noConflict();
        this.reader = new FileReader();
        this.j("#fileInput").change(function (event) { return _this.onFileSelected(event); });
    }
    LoadImage.prototype.renderImage = function (file) {
        var _this = this;
        this.canvas = document.getElementById('imageOverlay');
        this.context = this.canvas.getContext('2d');
        this.reader.onload = function (event) {
            _this.onReaderLoadedImage(event);
        };
        this.reader.readAsDataURL(file);
    };
    LoadImage.prototype.onReaderLoadedImage = function (event) {
        var _this = this;
        this.img = new Image();
        this.img.onload = (function () { return _this.onImageLoaded(); });
        this.img.src = this.reader.result;
    };
    LoadImage.prototype.onImageLoaded = function () {
        this.canvas.width = this.img.width; // set canvas size big enough for the image
        this.canvas.height = this.img.height;
        this.context.drawImage(this.img, 0, 0); // draw the image
        var dataUrl = this.canvas.toDataURL("image/png");
        EventBus.dispatchEvent("ON_IMAGE_LOADED", dataUrl);
    };
    LoadImage.prototype.onFileSelected = function (event) {
        this.renderImage(event.target.files[0]);
    };
    return LoadImage;
}());
//# sourceMappingURL=LoadImage.js.map