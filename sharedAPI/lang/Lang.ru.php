<?php

require_once($_SERVER['DOCUMENT_ROOT'] . "/sharedAPI/LogicGameConfig.php");

$locale = array(
    'locale' => array(
        'id' => 'ru'
    ),
    'switchy' => array(
        'id' => 'en',
        'title' => "EN" // Switch to English version
    ),
    'monthsBeta' => array(
        1 => "января",
        2 => "февраля",
        3 => "марта",
        4 => "апреля",
        5 => "мая",
        6 => "июня",
        7 => "июля",
        8 => "августа",
        9 => "сентября",
        10 => "октября",
        11 => "ноября",
        12 => "декабря"
    ),
    'page' => array(
        'title' => array(
            KOSYNKA_ID => 'Пасьянс «Косынка» — играть онлайн'
        )
    ),
    'ui' => array(
        'auxScrollTop' => 'в начало',
        'auxClose' => 'закрыть',
        'closeIconAltText' => 'Закрыть',
        'loading' => 'Загрузка'
    ),
    'titleBand' => array(
        'title' => array(
            KOSYNKA_ID => 'Пасьянс &laquo;Косынка&raquo;',
            FREECELL_ID => 'Пасьянс &laquo;Солитёр&raquo;',
            SPIDER_1S_ID => 'Пасьянс &laquo;Паук&raquo;',
            SPIDER_2S_ID => 'Пасьянс &laquo;Паук&raquo;',
            SPIDER_4S_ID => 'Пасьянс &laquo;Паук&raquo;',
            SOKOBAN_ID => 'Cокобан',
            BAKER_ID => 'Дюжина пекаря',
            SUDOKU_ID => 'Судоку',
            PYRAMID_ID => 'Пасьянс &laquo;Пирамида&raquo;'

        ),
        'description' => 'Описание',
        'playOtherGamesLink' => 'Перейти на другие игры',
        'gbLink' => 'Вопросы и отзывы'
    ),
    'topCP' => array(
        'undo' => 'Ход назад',
        'redo' => 'Ход вперёд',
        'newGame' => 'Новая игра',
        'replay' => 'Начать<br/>сначала',
        'autoMove' => 'Автоход',
        'autoComplete' => 'Автозавершение',
        'autoMoveHome' => 'Автоход <br> в дом',
        'specialMove' => 'Спецход',
        'undoSpecialMove' => 'Отменить<br/>спецход',
        'showAvailableMoves' => 'Возможные ходы',
        'suite' => 'масть',
        'suites' => 'масти',
    ),
    'gameplay' => array(
        'winNotice' => 'Поздравляем,<br/>вы выиграли!',
        'markCard' => 'Пометить карту',
        'specMove' => 'Выберите карту или нажмите ESC для отмены.',
        'wonAttemptNotice' => 'Вы открыли выигранную попытку. Для просмотра решения используйте кнопки «Ход назад», «Ход вперёд» и/или стрелки на клавиатуре.',
        'backToGame' => 'Вернуться к своей игре'
    ),
    'loginRegister' => array(
        'closeIconAltText' => 'Закрыть форму входа / ввода нового имени',
        'header' => 'Войти в личный кабинет',
    ),
    'loginRegister.welcome' => array(
        'guestWelcomeMsg' => 'Авторизация', // 0 - "имя" гостя
        'regOption' => 'Регистрация',
        'regOptionHint' => 'только<br/>имя и пароль',
        'loginOption' => 'Войти',
        'loginOptionHint' => 'если вы уже<br/>регистрировались',
        'skipOption' => 'Играть как гость',
        'skipOptionHint' => 'без регистрации'
    ),
    'loginRegister.login' => array(
        'header' => 'Войти',
        'hint' => 'если у вас уже есть имя и пароль',
        'usernameLabel' => 'Имя&nbsp;пользователя:',
        'passwdLabel' => 'Пароль:',
        'rememberMeLabel' => 'запомнить меня на этом компьютере',
        'loginBtnLabel' => 'Войти',
        'cancelBtnLabel' => 'Отмена'
    ),
    'loginRegister.reg' => array(
        'header' => 'Ввести новое имя',
        'hint' => 'если у вас ещё нет имени и пароля',
        'usernameLabel' => 'Имя&nbsp;пользователя:',
        'passwdLabel' => 'Пароль:',
        'passwdConfirmationLabel' => 'Повторите пароль:',
        'regBtnLabel' => 'Продолжить',
        'cancelBtnLabel' => 'Отмена'
    ),
    'bottomCP' => array(
        'parameters' => 'Параметры',
        'gameList' => 'Все расклады',
        'history' => 'История',
        'gameInfo' => 'О раскладе',
        'rating' => 'Рейтинги игроков',
        'loginRegister' => 'Авторизация',
        'profile' => 'Личный<br/>кабинет'
    ),
    'parameters' => array(
        'closeIconAltText' => 'Закрыть параметры выбора игры',
        'header' => 'Параметры',
        'playRandomOption' => 'играть в случайном порядке',
        'playSuccOption' => 'играть подряд',
        'unsolvedOnlyOption' => 'только нерешённые мной расклады',
        'requestByIdLabel' => 'Ввести номер расклада ({{0}}-{{1}}):',
        'commitBtnLabel' => 'Ok',
        'cancelBtnLabel' => 'Отмена'
    ),
    'parameters.solitaireVariant' => array(
        'variantTitle' => 'Вариант пасьянса',
        'oneCard' => 'по одной карте' ,
        'threeCards' => 'по три карты',
    ),
    'parameters.category' => array(
        'header' => 'Выбор категории раскладов',
        'easy' => 'лёгкие',
        'easyHint' => '({{0}}-{{1}} мин)',
        'normal' => 'средние',
        'normalHint' => '({{0}}-{{1}} мин)',
        'hard' => 'сложные',
        'hardHint' => '(&gt;{{0}} мин)',
        'all' => 'все',
        'unsolved' => 'нерешённые никем'
    ),
    'parameters.theme' => array(
        'header' => 'Выбор оформления карт',
        'themeClassic' => 'Классическая колода (Windows)',
        'themeAmerican' => 'Англо-американская колода'
    ),
    'history' => array(
        'closeIconAltText' => 'Закрыть историю игр'
    ),
    'gameList' => array(
        'closeIconAltText' => 'Закрыть список игр',
        'loadingAltText' => 'Загрузка'
    ),
    'gameInfo' => array(
        'addToFavorites' => 'добавить в избранное',
        'peekSolution' => 'Посмотреть решение',
        'commitBtnLabel' => 'Сохранить',
        'cancelBtnLabel' => 'Отмена'
    ),
    'profile' => array(
        'header' => 'Ваш личный кабинет (&laquo;{{0}}&raquo;)',
        'noPhotoAltText' => 'Фото не загружено',
        'editProfileBtnLabel' => 'Редактировать профиль',
        'birthdayLabel' => 'День рождения:',
        'fromWhereLabel' => 'Город:',
        'linkLabel' => 'Ссылка в соц-сети:',
        'aboutLabel' => 'О себе:',
        'photoLabel' => 'Фото:',
        'commitBtnLabel' => 'Сохранить',
        'cancelBtnLabel' => 'Отмена',
        'newMsgCountLabel' => 'Новых сообщений',
        'goToInbox' => 'Посмотреть личные сообщения',
        'doLogout' => 'Выйти из ЛК и играть как гость',
        'goInvisible' => 'Скрыть моё пребывание на сайте',
        'writeAdmin' => 'Написать админу',
        'changePass' => 'Изменить пароль',
        'email' => 'Электронная почта',
        'share' => 'Рекомендовать игру в соц. сетях'
    ),
    'guestBook' => array(
        'closeIconAltText' => 'Закрыть гостевую книгу'
    ),
    'footer' => array(
        'activity' => 'Сейчас на сайте — гостей: {{0}}, зарегистрированных пользователей: {{1}} (из {{2}}).',
        'visitors' => '<p>Всего уникальных посетителей — вчера: {{0}}, сегодня: {{1}}</p>',
        'copyright' => 'Программный продукт <a href="http://v6.spb.ru/" target="_blank">Юридического центра &laquo;Восстания-6&raquo;</a>',
    ),

    'rating' => array(
        'yearChampionship' => 'чемпион {{0}} года'
    ),

    /* Gomoku localization part */

    'g_settings' => array(
        'moveorder_computer'        => 'Порядок хода в игре с компьютером',
        'moveorder_first'           => 'Ходить первым',
        'moveorder_second'          => 'Ходить вторым',
        'moveorder_first_to_second' => 'По очереди',
        'diff_computer'             => 'Уровень сложности в игре с компьютером',
        'diff_easy'                 => 'Простой',
        'diff_medium'               => 'Средний',
        'diff_hard'     => 'Сложный',
        'board_view' => 'Значки',
        'board_xo_colored' => 'Цветные',
        'board_xo_bw'=> 'Черно-белые',
        'board_stones_bw' => 'Камни',
        'game_settings' => 'Настройки игры',
        'game_1_takeback' => 'Разрешить 1 ход назад',
        'game_advice_rival' => 'Показывать угрозы противника',
        'game_advice_your' => 'Показывать свои угрозы',
        'game_sound_enable' => 'Включить звук',
        'game_disable_invite' => 'Запретить приглашать меня в игру',
        'chat_settings' => 'Настройки чата',
        'chat_disable' => 'Отключить чат',
        'chat_scroll_to_new' => 'Всегда листать на новое сообщение',
        'cancel' => 'Отмена'
    ),

    'g_history' => array(
        'games_all'         => 'все партии',
        'games_fav'         => 'избранное',
        'search_by_name'    => 'Поиск по имени',
        'date'              => 'Дата',
        'rival'             => 'Противник',
        'time'              => 'Время',
        'id'                => '№',
        'rating'            => 'Рейтинг'
    ),

    'g_game' => array(
        'lose'              => 'Поражение',
        'lose_give_up'      => 'Поражение, вы сдались',
        'lose_time'         => 'Поражение, у вас истекло время',
        'lose_leave_game'   => 'Поражение, вы покинули игру',
        'win'               => 'Победа',
        'win_give_up'       => 'Победа, соперник сдался',
        'win_time'          => 'Победа, у соперника истекло время',
        'win_leave_game'    => 'Победа, соперник покинул игру',
        'draw'              => 'Ничья',
        'draw_move_miss'    => 'Ничья, игроки пропустили ходы',
        'username_comp'     => 'Компьютер',
        'takeback'          => 'Ход назад',
        'takeforward'       => 'Ход вперед',
        'xo'                => 'Крестики-нолики',
        'xo_2'                => 'Крестики-<br>нолики',
        'renju'             => 'Рэндзю',
        'xo_training'                => 'Трен.режим<br>без рейтинга', // appended
        'renju_training'             => 'Тренир.<br>режим',
        'training_title'                => 'Игра без учета рейтинга, времени и со свободными ходами назад',
        'newgame'           => 'Новая игра',
        'free_rivals'       => 'Свободны',
        'ingame_rivals'     => 'Играют',
        'button_random_rival' => 'Играть с любым',
        'msg_loading' => 'Загрузка...',
        'list_search' => 'Поиск по списку:',
        'list_expand' => 'Развернуть список игроков',
        'title_score_sum' => 'Суммарный счет',
        'title_move_limit' => 'Если вы не будете ходить 1 минуту, вам будет засчитано поражение',
        'title_spectate_close' => 'Выйти из просмотра',
        'leave_game' => 'Покинуть<br>игру',
        'button_draw' => 'Предложить<br>ничью',
        'button_throw' => 'Сдаться'
    ),

    'g_coordinates' => array(
        0 => 'а', 1 => 'б', 2 => 'в', 3 => 'г', 4 => 'д', 5 => 'е', 6 => 'ж', 7 => 'з',
        8 => 'и', 9 => 'к', 10 => 'л', 11 => 'м', 12 => 'н', 13 => 'о',
        14 => 'п', 15 => 'р', 16 => 'с', 17 => 'т', 18 => 'у'
    ),

    'g_rating' => array(
        'you' => 'Вы',
        'placeBig' => 'Место',
        'placeSmall' => 'место',
        'column_elo' => 'Рейтинг Эло',
        'rating_changes' => 'изменение рейтинга игрока',
        'all_players' => 'все игроки'
    ),

    'g_chat' => array(
        'common_chat' => 'Общий чат',
        'private_chat' => 'Чат с игроком',
        'invite_player' => 'Пригласить в игру',
        'show_profile' => 'Показать профиль',
        'ban_player' => 'Забанить в чате',
        'expand' => 'Развернуть чат',
        'send' => 'Отправить',
        'msg_delete' => 'Удалить сообщение',
        'msg_header' => 'Готовые сообщения',
        'msg_0' => 'Привет!',
        'msg_1' => 'Молодец!',
        'msg_2' => 'Здесь кто-нибудь умеет играть?',
        'msg_3' => 'Кто со мной?',
        'msg_4' => 'Спасибо!',
        'msg_5' => 'Спасибо! Интересная игра!',
        'msg_6' => 'Спасибо, больше играть не могу. Ухожу!',
        'msg_7' => 'Спасибо, интересная игра! Сдаюсь!',
        'msg_8' => 'Отличная партия. Спасибо!',
        'msg_9' => 'Ты мог выиграть',
        'msg_10' => 'Ты могла выиграть',
        'msg_11' => 'Ходи!',
        'msg_12' => 'Дай ссылку на твою страницу вконтакте',
        'msg_13' => 'Снимаю шляпу!',
        'msg_14' => 'Красиво!',
        'msg_15' => 'Я восхищен!',
        'msg_16' => 'Где вы так научились играть?',
        'msg_17' => 'Еще увидимся!',
        'msg_18' => 'Ухожу после этой партии. Спасибо!',
        'msg_19' => 'Минуточку',
        'by_admin' => 'От админа',
        'rules' => 'Правила чата',
        'rules_header1' => 'В чате запрещено:',
        'rule_1' => 'использование ненормативной лексики и оскорбительных выражений',
        'rule_2' => 'хамское и некорректное общение с другими участниками',
        'rule_3' => 'многократная публикация бессмысленных, несодержательных или одинаковых сообщений',
        'bans' => 'Баны',
        'bans_2' => 'выносятся: на 1 день, на 3 дня, на 7 дней,на
        месяц или навсегда, в зависимости от степени тяжести нарушения.',
        'ban' => 'Бан',
        'ban_latency' => 'снимается автоматически по истечении срока'
    )
);