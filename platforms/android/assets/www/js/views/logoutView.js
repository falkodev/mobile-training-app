var logoutView = function () {
    connectedUser = false;
    loggedOut = true;
    localStorage.removeItem("sessionUserData");
    localStorage.removeItem("firstTimeOver");
    //clean every input
    $('input').val('');
    $('input:radio, input:checkbox').removeAttr('checked').removeAttr('selected');
    window.referrer = '';
    window.location.hash = '#login';
}