var RedirectToCall = (function () {
    function RedirectToCall(window, isOwner) {
        if (isOwner) {
            window.location.href = '#/publisherCall';
        }
        else {
            window.location.href = '#/subscriberCall';
        }
    }
    return RedirectToCall;
}());
//# sourceMappingURL=RedirectToCall.js.map