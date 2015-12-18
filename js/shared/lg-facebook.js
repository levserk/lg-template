window.fbAsyncInit = function() {
    if (_isFb){

        $('.profileLogoutPanel').hide();
        $('.share42init').hide();
        $('#welcomePanel').hide();
        $('#inviteFriend').hide();
        $('#showShared').hide();
        $('#shadow').hide();
        $('#welcomeOverlay').hide();

        // init the FB JS SDK
        FB.init({
            appId      : _FB_ID,
            status     : true,
            xfbml      : true,
            version    : 'v2.4',
            cookie: true
        });

        //FB login
        FB.getLoginStatus(function(response) {
            if (response.status !== 'connected') {
                FB.login(function(response) {
                    location.replace(location.href);
                    //if (response.authResponse) {
                    //    // The person logged into your app
                    //    location.replace(location.href);
                    //} else {
                    //    // The person cancelled the login dialog
                    //    console.log(response);
                    //}
                },{ scope:'publish_actions' });
            } else {
                console.log(response);
                //if (_isFb && _isGuest && _lang == 'ru') {
                //    setTimeout(function(){
                //        location.replace(location.href + '?lang=en');
                //    }, 100)
                //}
            }
        });

    }
};

$(document).ready(function(){
// Load the SDK asynchronously
if (_isFb)(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

});

var _ogPosts=0;
_openGraphPost = function(title, time){
    if (typeof FB === 'undefined' || !FB) return;
    if (!title || typeof title === 'undefined') title = 'Hand #1';
    _ogPosts++;
    if (_ogPosts>1) return; //TODO: Limit posting
    var description = (time?'time: '+time:'');
    // first - create object (game), next - create story (win game)
    FB.api(
        'me/objects/'+_FB_GAME+':game',
        'post',
        {
            object: {
                "app_id":_FB_ID,
                "type":_FB_GAME+":game",
                "url":'http:\/\/logic-games.spb.ru\/'+_FB_GAME+'\/og.php?title='+title+'&description='+description,
                "title":title,
                "image":'https:\/\/logic-games.spb.ru\/images/games\/'+_FB_GAME+'_preview.jpg',
                "description":description,
                is_scraped:'true'}
        },
        function(response) {
            console.log(response);
            FB.api(
                'me/'+_FB_GAME+':win',
                'post',
                {
                    game: response.id
                },
                function(response) {
                    console.log(response)
                }
            );
        }
    );
}
// TODO: вынести все в класс или модуль