$(document).ready(function(){
    var bg = new BackgroundPiker();
});

var BackgroundPiker = function(conf){
    conf = conf || {};
    conf.backgrounds = conf.backgrounds || [
            'rgb(76, 76, 76)',
            'rgb(128, 128, 128)',
            'rgb(177, 181, 185)',
            'rgb(221, 221, 221)',
            'rgb(139, 139, 131)',
            'url(http://test.logic-games.spb.ru/checkers/i/bg.jpg) repeat',
            'url(http://test.logic-games.spb.ru/balda/images/bamboo4.jpg) repeat',
            'url(http://test.logic-games.spb.ru/images/bg/bg-light.png) repeat',
            'url(http://test.logic-games.spb.ru/images/bg/bg-dark.png) repeat'
        ];
    conf.backgrounds.push(getBlockBackground($(document.body)));
    var bgBlock = $('<div>').css({
        position:"fixed",
        left: "10px",
        bottom: "20px",
        width: "30px",
        'min-height': "20px",
        padding: "2px"
    });
    bgBlock.attr("id", 'bg-piker');
    $('#main-wrapper').append(bgBlock);
    conf.backgrounds.forEach(function(el){
        var div =  $('<div>').css({
            width: "30px",
            height: "30px",
            background: el,
            border: "1px solid black",
            'margin-top': "10px",
            'margin-bottom': "10px"
        });
        div.on('click', function(e){
            var bgcss = getBlockBackground($(this));
            console.log(bgcss);
            $(document.body).css('background', bgcss, 'important');
        });
        bgBlock.append(div);
    });
    function getBlockBackground(div){
        var bgcss = div.css('background');
        if (!bgcss || bgcss == "" || bgcss == "none"){
            bgcss = div.css('background-image');
        }
        if (!bgcss || bgcss == "" || bgcss == "none"){
            bgcss = div.css('background-color');
        }
        return bgcss;
    }
};