<?php
    $link = ($lang == 'ru' ? 'en' : 'ru');
    if(!$isMm) {
        include $_SERVER['DOCUMENT_ROOT'] .'/snippets/lg-vkgroup.htm';
    }

?>
<?php if ( $gvId != 14
        && $gvId != 28
        && $gvId != 17
        && $gvId != 21
        && $gvId != 30
        && $gvId != 25
        && $gvId != 38
        && $gvId != 36
){ ?>
<a class="switchLocale" href="?lang=<?php echo $link ?>"><?php echo $link ?></a>
<?php }?>