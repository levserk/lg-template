<?php

require_once($_SERVER['DOCUMENT_ROOT'] . "/sharedAPI/LogicGameConfig.php");

$locale = array(
    'locale' => array(
        'id' => 'en'
    ),
    'switchy' => array(
        'id' => 'ru',
        'title' => "РУС"
    ),
    'monthsBeta' => array(
        1 => "January",
        2 => "February",
        3 => "March",
        4 => "April",
        5 => "May",
        6 => "June",
        7 => "July",
        8 => "August",
        9 => "September",
        10 => "October",
        11 => "November",
        12 => "December"
    ),
    'page' => array(
        'title' => array(
            KOSYNKA_ID => 'Klondike (solitaire) - all hands are winnable'
        )
    ),
    'ui' => array(
        'auxScrollTop' => 'scroll to top',
        'auxClose' => 'close',
        'closeIconAltText' => 'Close',
        'loading' => 'Loading'
    ),
    'titleBand' => array(
        'title' => array(
            KOSYNKA_ID => 'Solitaire &laquo;Klondike&raquo;',
            FREECELL_ID => 'Solitaire &laquo;FreeCell&raquo;',
            SPIDER_1S_ID => 'Solitaire &laquo;Spider&raquo;',
            SPIDER_2S_ID => 'Solitaire &laquo;Spider&raquo;',
            SPIDER_4S_ID => 'Solitaire &laquo;Spider&raquo;',
            SOKOBAN_ID => 'Sokoban',
            BAKER_ID => 'Baker\'s dozen',
            SUDOKU_ID => 'Sudoku',
            PYRAMID_ID => 'Пасьянс &laquo;Пирамида&raquo;'
        ),
        'description' => 'Description',
        'playOtherGamesLink' => 'Play other games',
        'gbLink' => 'Questions and comments'
    ),
    'topCP' => array(
        'undo' => 'Undo',
        'redo' => 'Redo',
        'newGame' => 'New game',
        'replay' => 'Restart<br/>game',
        'autoMove' => 'Auto move',
        'autoComplete' => 'Autocompletion',
        'autoMoveHome' => 'Auto move',
        'specialMove' => 'Special move',
        'undoSpecialMove' => 'Undo<br/>special move',
        'showAvailableMoves' => 'Possible moves',
        'suite' => 'suit',
        'suites' => 'suits',
    ),
    'gameplay' => array(
        'winNotice' => 'Congratulations,<br/>you have won!',
        'markCard' => 'Mark card',
        'specMove' => 'Choose card or press ESC for cancel.',
        'wonAttemptNotice' => 'You had open won attempt',
        'backToGame' => 'Return to game'
    ),
    'loginRegister' => array(
        'closeIconAltText' => 'Close sign in/registration window',
        'header' => 'Enter member area',
    ),
    'loginRegister.welcome' => array(
        'guestWelcomeMsg' => 'Authorization', // 0 - "name" of guest
        'regOption' => 'Registration',
        'regOptionHint' => 'if you still have no<br/>name and password',
        'loginOption' => 'Log in',
        'loginOptionHint' => 'if you already have<br/>username and password',
        'skipOption' => 'Play as guest',
        'skipOptionHint' => 'without entering<br/>name and password'
    ),
    'loginRegister.login' => array(
        'header' => 'Log in',
        'hint' => 'if you already have username and password',
        'usernameLabel' => 'Username:',
        'passwdLabel' => 'Password:',
        'rememberMeLabel' => 'remember me on this computer',
        'loginBtnLabel' => 'Log in',
        'cancelBtnLabel' => 'Cancel'
    ),
    'loginRegister.reg' => array(
        'header' => 'Enter new name',
        'hint' => 'if you do not have a user name and password yet',
        'usernameLabel' => 'User&nbsp;name:',
        'passwdLabel' => 'Password:',
        'passwdConfirmationLabel' => 'Confirm password:',
        'regBtnLabel' => 'Continue',
        'cancelBtnLabel' => 'Cancel'
    ),
    'bottomCP' => array(
        'parameters' => 'Parameters',
        'gameList' => 'All hands',
        'history' => 'History',
        'gameInfo' => 'Game info',
        'rating' => 'Rating',
        'loginRegister' => 'Authorization',
        'profile' => 'Profile'
    ),
    'parameters' => array(
        'closeIconAltText' => 'Close game selection parameters',
        'header' => 'Parameters',
        'playRandomOption' => 'play in random order',
        'playSuccOption' => 'play in succession',
        'unsolvedOnlyOption' => 'my unsolved hands only',
        'requestByIdLabel' => 'Enter hand number ({{0}}-{{1}}):',
        'commitBtnLabel' => 'Ok',
        'cancelBtnLabel' => 'Cancel'
    ),
    'parameters.solitaireVariant' => array(
        'variantTitle' => 'Solitaire type',
        'oneCard' => 'on one card',
        'threeCards' => 'on three cards',
    ),
    'parameters.category' => array(
        'header' => 'Hand category selection',
        'easy' => 'easy',
        'easyHint' => '({{0}}-{{1}} min)',
        'normal' => 'normal',
        'normalHint' => '({{0}}-{{1}} min)',
        'hard' => 'hard',
        'hardHint' => '(&gt;{{0}} min)',
        'all' => 'all',
        'unsolved' => 'solved by no one'
    ),
    'parameters.theme' => array(
        'header' => 'Select card theme',
        'themeClassic' => 'Classic (Windows)',
        'themeAmerican' => 'American',
    ),
    'history' => array(
        'closeIconAltText' => 'Close game history'
    ),
    'gameList' => array(
        'closeIconAltText' => 'Close game list',
        'loadingAltText' => 'Loading'
    ),
    'gameInfo' => array(
        'addToFavorites' => 'add to favorites',
        'peekSolution' => 'Peek at solution',
        'commitBtnLabel' => 'Commit',
        'cancelBtnLabel' => 'Cancel'
    ),
    'profile' => array(
        'header' => 'Your member area (&laquo;{{0}}&raquo;)',
        'noPhotoAltText' => 'Photo not uploaded',
        'editProfileBtnLabel' => 'Edit profile',
        'birthdayLabel' => 'Birthday:',
        'fromWhereLabel' => 'City:',
        'linkLabel' => 'Link:',
        'aboutLabel' => 'About self:',
        'photoLabel' => 'Photo:',
        'commitBtnLabel' => 'Commit',
        'cancelBtnLabel' => 'Cancel',
        'newMsgCountLabel' => 'New messages',
        'goToInbox' => 'View private messages',
        'doLogout' => 'Leave member area and play as guest',
        'goInvisible' => 'Don\'t show if I am online', // TODO <= Скрыть моё пребывание на сайте
        'writeAdmin' => 'Send message to admin',
        'changePass' => 'Change password',
        'email' => 'e-mail',
        'share' => 'share game'
    ),
    'guestBook' => array(
        'closeIconAltText' => 'Close guest book'
    ),
    'footer' => array(
        'activity' => 'Currently online — guests: {{0}}, registered users: {{1}} (of {{2}}).',
        'visitors' => '<p>Total unique visitors — yesterday: {{0}}, today: {{1}}</p>',
        'copyright' => 'Software product <a href="http://v6.spb.ru/" target="_blank">by Legal Center &laquo;Vosstaniya-6&raquo;</a>',
    ),

    'rating' => array(
        'yearChampionship' => 'champion of the year {{0}}'
    ),

    /* Gomoku localization part */

    'g_settings' => array(
        'moveorder_computer'        => 'Turn sequence in the game vs. computer ',
        'moveorder_first'           => 'Go first',
        'moveorder_second'          => 'Go second',
        'moveorder_first_to_second' => 'Take turns ',
        'diff_computer'             => 'Difficulty mode in the game vs. computer ',
        'diff_easy'                 => 'Easy',
        'diff_medium'               => 'Normal',
        'diff_hard'                 => 'Difficult ',
        'board_view'                => 'Board Type ',
        'board_xo_colored'          => 'Colored',
        'board_xo_bw'               => 'B/W',
        'board_stones_bw'           => 'Stones',
        'game_settings'             => 'Game Settings ',
        'game_1_takeback'           => 'Allow to make one move backwards',
        'game_advice_rival'         => 'Reveal threats of the opponent',
        'game_advice_your'          => 'Reveal my threats',
        'game_sound_enable'         => 'Turn on sound',
        'game_disable_invite'       => 'Forbid to invite me to the game ',
        'chat_settings'             => 'Chat settings',
        'chat_disable'              => 'Turn off chat',
        'chat_scroll_to_new'        => 'Always scroll to the new message ',
        'cancel'                    => 'Cancel'
    ),

    'g_history' => array(
        'games_all'         => 'all',
        'games_fav'         => 'favorites ',
        'search_by_name'    => 'search by name ',
        'date'              => 'Date',
        'rival'             => 'Opponent',
        'time'              => 'Time',
        'id'                => '№',
        'rating'            => 'Rating'
    ),

    'g_game' => array(
        'lose'              => 'Defeat',
        'lose_give_up'      => 'Defeat, you have surrendered',
        'lose_time'         => 'Defeat, you have ran out of time',
        'lose_leave_game'   => 'Defeat, you have left the game',
        'win'               => 'Victory',
        'win_give_up'       => 'Victory, the opponent has surrendered',
        'win_time'          => 'Victory, the opponent has ran out of time',
        'win_leave_game'    => 'Victory, the opponent has left the game',
        'draw'              => 'Draw',
        'draw_move_miss'    => 'Draw, the players have missed their turns',
        'username_comp'     => 'Computer',
        'takeback'          => 'Move<br>backwards',
        'takeforward'       => 'Move forward',
        'xo'                => 'Tic-tac-toe',
        'xo_2'                => 'Tic-tac-toe',
        'renju'             => 'Renju',
        'xo_training'                => 'Free<br>mode',
        'renju_training'             => 'Free<br>mode',
        'training_title'                => 'No ratings, no time limits, free take back',
        'newgame'           => 'New game',
        'free_rivals'       => 'Free',
        'ingame_rivals'     => 'Playing',
        'button_random_rival' => 'Play with a random opponent',
        'msg_loading' => 'Loading...',
        'list_search' => 'Search the list:',
        'list_expand' => 'Popout player list',
        'title_score_sum' => 'Total score',
        'title_move_limit' => 'If you fail to move for 1 minute, you will be awarded the defeat',
        'title_spectate_close' => 'Leave Spectate mode',
        'leave_game' => 'Leave<br>game',
        'button_draw' => 'Offer<br>a draw',
        'button_throw' => 'Throw'
    ),

    'g_coordinates' => array(
        0 => 'a', 1 => 'b', 2 => 'c', 3 => 'd', 4 => 'e', 5 => 'f', 6 => 'g', 7 => 'h',
        8 => 'i', 9 => 'j', 10 => 'k', 11 => 'l', 12 => 'm', 13 => 'n',
        14 => 'o', 15 => 'p', 16 => 'q', 17 => 'r', 18 => 's'
    ),

    'g_rating' => array(
        'you' => 'You',
        'placeBig' => 'Rank',
        'placeSmall' => 'rank',
        'column_elo' => 'Elo rating',
        'rating_changes' => 'rating dynamics',
        'all_players' => 'all players'
    ),

    'g_chat' => array(
        'common_chat' => 'General chat',
        'private_chat' => 'Private chat',
        'invite_player' => 'Invite',
        'show_profile' => 'Show profile',
        'ban_player' => 'Add to blacklist',
        'expand' => 'Popout chat',
        'send' => 'Send',
        'msg_delete' => 'Delete message',
        'msg_header' => 'Template messages',
        'msg_0' => 'Hi!',
        'msg_1' => 'Well done!',
        'msg_2' => 'Does anyone know how to play?',
        'msg_3' => 'Who is with me?',
        'msg_4' => 'Thanks!',
        'msg_5' => 'Thanks! Good game!',
        'msg_6' => 'Thanks, but I cannot play any longer. I am leaving now.',
        'msg_7' => 'Thanks! Good game! I surrender!',
        'msg_8' => 'Nice game. Thanks!',
        'msg_9' => 'You could have won',
        //'msg_10' => 'Ты могла выиграть',
        'msg_11' => 'Your move!',
        'msg_12' => 'Send me a link of your vkontakte page',
        'msg_13' => 'I tip my hat to you!',
        'msg_14' => 'Beautiful!',
        'msg_15' => 'I am impressed!',
        'msg_16' => 'Where did you learn to play like that?',
        'msg_17' => 'See you later!',
        'msg_18' => 'I am leaving after this round. Thanks!',
        'msg_19' => 'One minute, please',
        'by_admin' => 'as Admin',
        'rules' => 'Chat rules',
        'rules_header1' => 'The following are prohibited in the chat:',
        'rule_1' => 'using profanity and abusive terms',
        'rule_2' => 'rude and disparaging communication with other members',
        'rule_3' => 'multiple posting of senseless, vague or the same messages',
        'bans' => 'Bans',
        'bans_2' => 'are put: for 1 day, for 3 days, for 7 days, for a month or forever, depending on the gravity of the violation',
        'ban' => 'A ban',
        'ban_latency' => 'is removed automatically upon expiry'
    )
);
