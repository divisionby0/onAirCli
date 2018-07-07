var ClearImageOverlay = (function () {
    function ClearImageOverlay() {
        this.j = jQuery.noConflict();
        var canvas = document.getElementById('imageOverlay');
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
    return ClearImageOverlay;
}());
//# sourceMappingURL=ClearImageOverlay.js.map