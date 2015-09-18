<?php
ini_set ( "display_errors", "1");
ini_set ( "display_startup_errors", "1");
ini_set ( "html_errors", "1");

function shutdown()
{
    $err = error_get_last();
    if ($err){
        echo '<br>=========== error:<br>';
        print_r(error_get_last());
    }

    echo '', PHP_EOL;
}

//register_shutdown_function('shutdown');

$v = '10';
$lang = "ru";
$isVk = false;
$isFb = false;
$refresh = false;
$displayLogged = " style='display: none;'";
$displayNotLogged = "";
require("../sharedAPI/LogicGameI18n.php");
require("../sharedAPI/lang/Lang.$lang.php");

$i18n = new LogicGameI18n($locale, $gvId);
?>
<!DOCTYPE html>
<html>
<!--TODO: lang-->
<head lang="ru">
        <meta charset="UTF-8">
        <link rel="icon" type="image/x-icon" href="favicon.ico">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title><?php if(isset($pageTitle)) echo $pageTitle ?></title>

        <script type="text/javascript">
            var _sessionId = "17544549985bb285ab1.28033616";
            var _userId = 448037;
            var _username = "Гость 448037";
            var _isGuest = true;
            var _lang = 'ru';
            var _gameVariationId = 11;
            var _isVk = false ;
            var _isFb = (window.location!=top.location&&!_isVk);
            var _FB_ID = '2.4531036229718E+14';
            var _isFreshUser = false;
        </script>

        <?php

        if (isset($loadMain) && $loadMain){
            echo "<script type='text/javascript' src='/js/build/public-main.min.js?v=$v'></script> \n\r";
            echo "<script type='text/javascript' src='/js/build/shared-main.js?v=$v'></script> \n\r";
        } else {
            echo "<script type='text/javascript' src='/js/build/public.min.js?v=$v'></script> \n\r";
            echo "<script type='text/javascript' src='/js/build/shared-all.js?v=$v'></script> \n\r";
        }

        echo "<script type='text/javascript' src='/js/lang/lang.".$lang.".js?v=$v'></script> \n\r";
        echo "<link media='screen' href='/css/build/shared.css?v=$v' rel='stylesheet' type='text/css'>\n\r";
        echo "<link media='screen' href='/css/shared/lg-layout.css?v=$v' rel='stylesheet' type='text/css'>\n\r";

        @include 'snippets/head.inc'
    ?>
</head>
<body>
<?php
    @include 'snippets/top.inc'
?>
<div id="main-wrapper" class="lg-unwrapped">
    <div id="app-container">
            <div id="left-block" >
                <?php
                    @include 'snippets/left.inc'
                ?>
            </div>
            <div id="middle-block" >
                <?php
                    include '../snippets/lg-login-register.htm';
                ?>
                <div id="description">
                    <?php
                        @include 'snippets/description.inc'
                    ?>
                </div>
                <div id="game-field">
                    <?php
                        @include 'snippets/field.inc'
                    ?>
                </div>
                <div id="under-field"></div>
            </div>
            <div id="right-block" >
                <?php
                    @include 'snippets/right.inc'
                ?>
            </div>
        </did>
    </div>
    <div id="bottom-block" >
        <?php
            include '../snippets/lg-profile.htm';
            include '../snippets/lg-guestbook.htm';
            @include 'snippets/bottom.inc'
        ?>
        <div id="info-block">
            <div id="activityDiv">
                <a id="activity" href="/stats?gameVariationId=11" class="transpLink" target="_top">Сейчас на сайте — гостей: 0, зарегистрированных пользователей: 0 (из 0).</a></div>
            <div id="vstats">
                <p></p><p>Всего уникальных посетителей — вчера: 0, сегодня: 0</p>    <p></p>
            </div>
            <div id="copyright">©
                Программный продукт <a href="http://v6.spb.ru/" target="_blank">Юридического центра «Восстания-6»</a>
            </div>
        </div>
    </div>
</div>
<?php
    @include 'snippets/footer.inc';
?>
</body>
</html>