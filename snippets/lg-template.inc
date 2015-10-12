<?php
//function shutdown()
//{
//    $err = error_get_last();
//    if ($err){
//        echo '<br>=========== error:<br>';
//        print_r(error_get_last());
//    }
//
//    echo '', PHP_EOL;
//}
//register_shutdown_function('shutdown');
require_once '../snippets/auth.inc'
?>


<!DOCTYPE html>
<html>
<!--TODO: lang-->
<head lang="ru">
    <?php
        require_once '../snippets/lg-head.inc';
    if(is_file('snippets/head.inc'))
        @include 'snippets/head.inc'
    ?>
</head>
<body>
<?php
if(is_file('snippets/top.inc'))
    @include 'snippets/top.inc'
?>
<div id="main-wrapper" class="lg-unwrapped
<?php if ($isVk==true) echo "isVk"?>
">
    <div id="description">
        <div class="description-wrapper">
            <img id="closeDescription" src="/img/icons/icon_close.png" alt=""/>
            <div class="description-container">
            <?php
            if(is_file('snippets/description.inc'))
                @include 'snippets/description.inc'
            ?>
            </div>
        </div>
    </div>
    <div id="app-container">
            <div id="left-block" >
                <?php
                if(is_file('snippets/left.inc'))
                    @include 'snippets/left.inc'
                ?>
            </div>
            <div id="middle-block" >
                <?php
                    include '../snippets/lg-login-register.htm';
                ?>
                <div id="game-field">
                    <?php
                    if(is_file('snippets/field.inc'))
                        @include 'snippets/field.inc'
                    ?>
                </div>
                <div id="under-field">
                    <?php
                        include '../snippets/lg-shared-buttons.inc'
                    ?>
                </div>
            </div>
            <div id="right-block" >
                <?php
                if(is_file('snippets/right.inc'))
                    @include 'snippets/right.inc'
                ?>
            </div>
        </did>
    </div>
    <div id="bottom-block" >
        <?php
            include '../snippets/lg-profile.htm';
            include '../snippets/lg-guestbook.htm';
        if(is_file('snippets/bottom.inc'))
            @include 'snippets/bottom.inc'
        ?>
        <div id="info-block">
            <?php include '../snippets/lg-activity.htm'; ?>
        </div>
    </div>
</div>
<?php
if(is_file('snippets/footer.inc'))
    @include 'snippets/footer.inc'
?>
</body>
</html>