var SubscriberCurrentImageView = (function () {
    function SubscriberCurrentImageView() {
        this.canvas = document.getElementById("imageOverlay");
        this.ctx = this.canvas.getContext("2d");
    }
    SubscriberCurrentImageView.prototype.loadImage = function (fileData) {
        var _this = this;
        this.image = new Image();
        this.image.src = fileData;
        this.image.onload = (function () { return _this.onImageLoaded(); });
    };
    SubscriberCurrentImageView.prototype.onImageLoaded = function () {
        this.ctx.drawImage(this.image, 0, 0);
    };
    return SubscriberCurrentImageView;
}());
//# sourceMappingURL=SubscriberCurrentImageView.js.map