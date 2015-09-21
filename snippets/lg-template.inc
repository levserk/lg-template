<?php
ini_set ( "display_errors", "1");
ini_set ( "display_startup_errors", "1");
ini_set ( "html_errors", "1");

    require_once '../snippets/auth.inc'
?>
<!DOCTYPE html>
<html>
<!--TODO: lang-->
<head lang="ru">
    <?php
        require_once '../snippets/lg-head.inc';
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
            <?php include '../snippets/lg-activity.htm'; ?>
        </div>
    </div>
</div>
<?php
    @include 'snippets/footer.inc'
?>
</body>
</html>