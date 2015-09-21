<meta charset="UTF-8">
<link rel="icon" type="image/x-icon" href="favicon.ico">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php if(isset($pageTitle)) echo $pageTitle ?></title>

<script type="text/javascript">
    var _sessionId = "<?php echo $s->getSessionId(); ?>";
    var _userId = <?php echo $s->getUserId(); ?>;
    var _username = "<?php echo $s->getUsername(); ?>";
    var _sign = "<?php echo $s->getSign($sign);  ?>";
    var _isGuest = <?php if ($s->isGuest()) echo "true"; else echo "false"; ?>;
    var _lang = '<?php echo $lang ?>';
    var _gameVariationId = <?php echo $s->getGameVariationId(); ?>;
    var _isVk = <?php echo $isVk?'true':'false'; ?> ;
    var _isFb = (window.location!=top.location&&!_isVk);
    var _FB_ID = '<?php echo $isVk?"":$fbAuth->appId ?>';
    var _isFreshUser = <?php echo $isFreshUser?'true':'false'; ?>;
</script>

<?php
if ($refresh){
    echo '
        <script type="text/javascript">
            location.replace(location.href);
        </script>';
}

if(!$isVk) {
    echo '<script src="//vk.com/js/api/openapi.js" type="text/javascript"/></script>';
} else {
    echo '<script src="//vk.com/js/api/xd_connection.js?2" type="text/javascript"></script>';
}
if (isset($loadMain) && $loadMain){
    echo "<script type='text/javascript' src='/js/build/public-main.min.js?v=$v'></script> \n\r";
    echo "<script type='text/javascript' src='/js/build/shared-main.js?v=$v'></script> \n\r";
} else {
    echo "<script type='text/javascript' src='/js/build/public.min.js?v=$v'></script> \n\r";
    echo "<script type='text/javascript' src='/js/build/shared-all.js?v=$v'></script> \n\r";
}

echo "<script type='text/javascript' src='/js/lang/lang.".$lang.".js?v=$v'></script> \n\r";

echo '<script src="/js/shared/lg-facebook.js" type="text/javascript"></script>';

echo "<link media='screen' href='/css/build/shared.css?v=$v' rel='stylesheet' type='text/css'>\n\r";
echo "<link media='screen' href='/css/shared/lg-layout.css?v=$v' rel='stylesheet' type='text/css'>\n\r";
?>