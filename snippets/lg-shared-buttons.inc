<?php
    $link = ($lang == 'ru' ? 'en' : 'ru');
    if(!$isMm) {
        include $_SERVER['DOCUMENT_ROOT'] .'/snippets/lg-vkgroup.htm';
    }

?>
<a class="switchLocale" href="?lang=<?php echo $link ?>"><?php echo $link ?></a>
