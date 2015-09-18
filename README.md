# lg-template
Проект шаблона для игр

структура верстки в **scheme.png**
## подключение шаблона

пример - папка **example**

файл index.php
``` php

$pageTitle = 'example';
$gvId = YOUR_GAME_ID; // число
$sign = 'your sign';

include('../snippets/lg-template-local.inc');

// продакшн:
// include('../snippets/lg-template.inc');
```
в папке игры **snippets** должны лежать только нужные файлы которые будут вставлены в соответсвующие блоки шаблона
список возможных файлов:
- head.inc
- top.inc
- left.inc
- description.inc
- field.inc
- right.inc
- bottom.inc
- footer.inc

## настройка стилей

все обернуто в **main-wrapper** со стилем:

```css
#main-wrapper{
    width: 1000px;
    margin: 0 auto;
}
```
при необходимости ширину можно изменить увеличить, или уменьшить для vk

нижний блок **bottom-block** необходимо отцентрировать отступами:
```css
#bottom-block{
    margin: 0 190px 0 190px;
}
```

или, если игровое поле статичн, задав ширину:

```css
#bottom-block{
    width: 600px;
    margin: 0 auto;
}
```
