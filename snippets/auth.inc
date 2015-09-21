<?php
ini_set ( "display_errors", "1");
require_once("../sharedAPI/LogicGameSessionManager.php");
require_once("../sharedAPI/LogicGameLocalization.php");
require_once("../sharedAPI/LogicGameVkAuth.php");
require_once("../sharedAPI/LogicGameFbAuth.php");
require_once("../sharedAPI/LogicGameResourceManager.php");

// версия клиентских файлов css и js, для кеша
$v .= '10';

$sm = new LogicGameSessionManager($gvId);
$s = $sm->getAuthServerInstance();
$s->updateActivity();
$isFreshUser = $sm->isFreshUser();
// локализация
$i18n = $s->getI18n();
$lang = $i18n->get("locale", "id");

// Vk auth
$isVk = false;
$vkAuth = new LogicGameVkAuth($s, $sm);
$vkAuth->tryVkAuth();
$isVk = $vkAuth->hasVkAuth();

//Fb auth
$isFb = false;
// флаг обновления страницы для переключения языка, TODO: переделать это
$refresh = false;
if (!$isVk) {
    $fbAuth = new LogicGameFbAuth($gvId);
    $fbAuth->tryFbAuth($s, $sm);
    $isFb = $fbAuth->hasFbAuth();
    if ($isFb){
        if ($fbAuth->locale != $lang){
            $s->switchLocale($fbAuth->locale);
            $refresh = true;
        }
    }
}

if (!$s->isGuest()) {
    $displayNotLogged = " style='display: none;'";
    $displayLogged = "";
} else {
    $displayLogged = " style='display: none;'";
    $displayNotLogged = "";
}

if (!isset($sign)) {
    $sign = '';
}