<div id="gameSection">

    <!-- TOP LINKS -->
    <div class="titleBand">
        <div class="titleBandInner">
            <table cellspacing="0" cellpadding="0" width="100%" border="0">
                <tr>
                    <td width="1%" style="white-space: nowrap;">
                            <span class="titleBandLink" id="title">
                                Example
                            </span>
                    </td>

                    <td>&nbsp;</td>

                    <td width="1%" align="center" style="white-space: nowrap;">
                            <span class="titleBandLink" id="showDescription">
                                Описаниие
                            </span>
                    </td>

                    <td>&nbsp;</td>

                    <td width="1%" align="center" style="white-space: nowrap;">
                            <span id="gbShow" class="titleBandLink">
                                Вопросы и отзывы
                            </span>
                    </td>

                    <td>&nbsp;</td>

                    <td width="1%" align="right" style="white-space: nowrap;">
                        <a href="/" class="titleBandLink" <?=(isset($isVk) && $isVk ? " target='_blank'" : "")?>>
                        Перейти на другие игры
                        </a>
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <!-- TOP BUTTONS -->
    <div class="controlPanel nonSelectable">
        <table class="controlPanelLayout" cellpadding="0">
            <tr>
                <td id="tbUndo" class="cpButton cpNormal nonSelectable">Ход назад</td>
                <td id="tbRedo" class="cpButton cpNormal nonSelectable">Ход вперед</td>
                <td id="tbNewGameContainer" class="cpButton cpNormal nonSelectable cpKillHover">
                    <table style="width: 100%; height: 100%;" cellspacing="0" cellpadding="0">
                        <tr>
                            <td id="tbPreviousGame" style="border-right: 1px solid #BBB; width: 15px;"
                                class="cpNormal roundedLeft4px"> < </td>
                            <td id="tbNewGame" class="cpNormal roundedRight4px">Новая игра</td>
                        </tr>
                    </table>
                </td>
                <td id="tbReplay" class="cpButton cpNormal nonSelectable">Начать сначала</td>
                <td id="tbHelp" class="cpButton cpNormal nonSelectable" style="padding: 5px;">Подсказка</td>
            </tr>
        </table>
    </div>
    <div id="gameField">

    </div>

    <!-- BOTTOM BUTTONS -->
    <div class="controlPanel nonSelectable">
        <table class="controlPanelLayout">
            <tr>
                <td id="bbParameters" class="cpButton cpNormal nonSelectable">Параметры</td>
                <td id="bbHistory" class="cpButton cpNormal nonSelectable">История</td>
                <td id="bbRatings" class="cpButton cpNormal nonSelectable">Рейтинг</td>
                <td id="bbLoginRegister" class="cpButton cpNormal nonSelectable"> Авторизация </td>
                <td id="bbProfile" class="cpButton cpNormal nonSelectable"> <span id="bbProfileLabel">Личный кабинет</span> <span id="bbUnreadMsgCount"></span> </td>
            </tr>
        </table>
    </div>

</div>
