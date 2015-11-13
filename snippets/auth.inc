<?php
ini_set ( "display_errors", "1");
require_once($_SERVER['DOCUMENT_ROOT'] ."/sharedAPI/LogicGameSessionManager.php");
require_once($_SERVER['DOCUMENT_ROOT'] ."/sharedAPI/LogicGameLocalization.php");
require_once($_SERVER['DOCUMENT_ROOT'] ."/sharedAPI/LogicGameVkAuth.php");
require_once($_SERVER['DOCUMENT_ROOT'] ."/sharedAPI/LogicGameFbAuth.php");
require_once($_SERVER['DOCUMENT_ROOT'] ."/sharedAPI/LogicGameMmAuth.php");
require_once($_SERVER['DOCUMENT_ROOT'] ."/sharedAPI/LogicGameResourceManager.php");

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
// moy mir auth
$isMm = false;
if (!$isVk && !$isFb){
        $mmAuth = new LogicGameMmAuth($s, $sm);
        $mmAuth->tryMmAuth();
        $isMm = $mmAuth->hasMmAuth();
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