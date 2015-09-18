var contexts = [];

contexts['months'] = [];
contexts['months'][1] = "январь";
contexts['months'][2] = "февраль";
contexts['months'][3] = "март";
contexts['months'][4] = "апрель";
contexts['months'][5] = "май";
contexts['months'][6] = "июнь";
contexts['months'][7] = "июль";
contexts['months'][8] = "август";
contexts['months'][9] = "сентябрь";
contexts['months'][10] = "октябрь";
contexts['months'][11] = "ноябрь";
contexts['months'][12] = "декабрь";

contexts['monthsShort'] = [];
contexts['monthsShort'][1] = "янв";
contexts['monthsShort'][2] = "февр";
contexts['monthsShort'][3] = "март";
contexts['monthsShort'][4] = "апр";
contexts['monthsShort'][5] = "май";
contexts['monthsShort'][6] = "июнь";
contexts['monthsShort'][7] = "июль";
contexts['monthsShort'][8] = "авг";
contexts['monthsShort'][9] = "сент";
contexts['monthsShort'][10] = "окт";
contexts['monthsShort'][11] = "нояб";
contexts['monthsShort'][12] = "дек";

contexts['monthsBeta'] = [];
contexts['monthsBeta'][1] = "января";
contexts['monthsBeta'][2] = "февраля";
contexts['monthsBeta'][3] = "марта";
contexts['monthsBeta'][4] = "апреля";
contexts['monthsBeta'][5] = "мая";
contexts['monthsBeta'][6] = "июня";
contexts['monthsBeta'][7] = "июля";
contexts['monthsBeta'][8] = "августа";
contexts['monthsBeta'][9] = "сентября";
contexts['monthsBeta'][10] = "октября";
contexts['monthsBeta'][11] = "ноября";
contexts['monthsBeta'][12] = "декабря";

contexts['games'] = [];
contexts['games'][KOSYNKA_GAME_VARIATION_ID] = "Пасьянс «Косынка»";
contexts['games'][FREECELL_GAME_VARIATION_ID] = "Пасьянс «Солитёр»";
contexts['games'][CHESS_GAME_VARIATION_ID] = "Шахматы";
contexts['games'][SPIDER_1S_GAME_VARIATION_ID] = "Пасьянс «Паук» (1 масть)";
contexts['games'][SPIDER_2S_GAME_VARIATION_ID] = "Пасьянс «Паук» (2 масти)";
contexts['games'][SPIDER_4S_GAME_VARIATION_ID] = "Пасьянс «Паук» (4 масти)";
contexts['games'][SOKOBAN_GAME_VARIATION_ID] = "Сокобан";

contexts['shared'] = [];
contexts['shared']['locale'] = "ru";
contexts['shared']['isLatin'] = false;
contexts['shared']['loadingAltText'] = "Загрузка";
contexts['shared']['loadingAlert'] = "Загрузка";
contexts['shared']['auxScrollTop'] = "в начало";
contexts['shared']['auxClose'] = "закрыть";
contexts['shared']['dataLoadingErrorAlert'] = "При загрузке данных возникла ошибка. Повторите попытку позже.";
contexts['shared']['daysShortSuffix'] = "дн";
contexts['shared']['hoursShortSuffix'] = "ч";
contexts['shared']['minutesShortSuffix'] = "м";
contexts['shared']['secondsShortSuffix'] = "с";
contexts['shared']['closeIconAltText'] = "Закрыть";
contexts['shared']['notLoggedNotice'] = "Не выполнен вход в игру. Попробуйте перезагрузить страницу.";
contexts['shared']['unknownLoadingErrorNotice'] = "Во время загрузки произошла неизвестная ошибка. Попробуйте обновить страницу.";
contexts['shared']['email'] = "Электронная почта:";
contexts['shared']['btnUp'] = "Наверх";

contexts['time'] = [];
contexts['time']['daysShortSuffix'] = "дн";
contexts['time']['hoursSuperShortSuffix'] = "ч";
contexts['time']['minutesShortSuffix'] = "мин";
contexts['time']['minutesSuperShortSuffix'] = "м";
contexts['time']['secondsShortSuffix'] = "сек";
contexts['time']['today'] = "сегодня";

contexts['paginator'] = [];
contexts['paginator']['previousPrefix'] = "Предыдущие";
contexts['paginator']['nextPrefix'] = "Следующие";
contexts['paginator']['rangeOf'] = "из";

contexts['loader'] = [];
contexts['loader']['loaderMorePrefix'] = 'Ещё';
contexts['loader']['loaderMoreSuffix'] = [];
contexts['loader']['loaderMoreSuffix']['hands'] = "раскладов";
contexts['loader']['loaderMoreSuffix']['levels'] = "уровней";
contexts['loader']['loaderMoreSuffix']['players'] = "игроков";
contexts['loader']['loaderShowAll'] = "Показать все";
contexts['loader']['loaderOf'] = "из";

contexts['parameters'] = [];
contexts['parameters']['gameIdRangeAlert'] = "Введите номер от {{0}} до {{1}}.";

contexts['gameList'] = [];
contexts['gameList']['gameIdLabel'] = 'Номер';
contexts['gameList']['gameRatingLabel'] = 'Рейтинг';
contexts['gameList']['gameRatingDescription'] = 'среднее время решивших игроков';
contexts['gameList']['winTimeAndRankLabel'] = 'Ваше время /<br />место';
contexts['gameList']['winTimeAndRankDescription'] = 'время решения';
contexts['gameList']['solvedLabel'] = 'Выиграло';
contexts['gameList']['playedLabel'] = 'Играло';
contexts['gameList']['noRatingAltText'] = 'нет рейтинга';
contexts['gameList']['sortByGameIdHint'] = "Сортировать по<br />номеру расклада";
contexts['gameList']['sortByGameRatingHint'] = "Сортировать по среднему времени<br />среди всех решивших";
contexts['gameList']['sortByWinTimeHint'] = "Сортировать по<br />вашему времени решения";
contexts['gameList']['sortByWonCountHint'] = "Сортировать по<br />количеству выигравших";
contexts['gameList']['sortByPlayedCountHint'] = "Сортировать по<br />количеству игравших";

contexts['history'] = [];
contexts['history']['gameIdLabel'] = [];
contexts['history']['gameIdLabel']['hand'] = 'Расклад';
contexts['history']['gameIdLabel']['level'] = 'Уровень';
contexts['history']['commentLabel'] = 'Комментарий';
contexts['history']['wtLabel'] = 'Время решения / ваше место в этом раскладе';
contexts['history']['baLabel'] = 'Время лучшей попытки / ваше место в этом раскладе';
contexts['history']['dateDaysLabel'] = 'Дата/дней';
contexts['history']['dateLabel'] = 'Дата';
contexts['history']['noGamesByFilterAlert'] = "По этому фильтру нет ни одной игры.";
contexts['history']['noGamesAlert'] = "В вашей истории пока нет ни одной игры.";
contexts['history']['filtersLabel'] = "Фильтры";
contexts['history']['allFilterLabel'] = "все";
contexts['history']['favoritesFilterLabel'] = "избранные";
contexts['history']['unsolvedFilterLabel'] = "нерешённые";
contexts['history']['addToFavoritesCheckBoxLabel'] = "в избранное";
contexts['history']['saveButtonLabel'] = "Сохранить";
contexts['history']['dismissButtonLabel'] = "Отмена";
contexts['history']['pokeSolutionShortLabel'] = "см. реш.";

contexts['gameInfo'] = [];
contexts['gameInfo']['gameIdLabel'] = [];
contexts['gameInfo']['gameIdLabel']['hand'] = "Расклад #";
contexts['gameInfo']['gameIdLabel']['level'] = "Уровень: ";
contexts['gameInfo']['byWinTimeLabel'] = "По времени решения";
contexts['gameInfo']['byBestAttemptTimeLabel'] = "По лучшей попытке";
contexts['gameInfo']['unsolvedListLabel'] = "Список нерешивших";
contexts['gameInfo']['playerResultsHeader'] = "Результаты игроков";
contexts['gameInfo']['gameRatingLabel'] = "рейтинг расклада";
contexts['gameInfo']['wonCountLabel'] = "выиграло";
contexts['gameInfo']['playedCountLabel'] = "играло";
contexts['gameInfo']['commentLabel'] = "Комментарий";
contexts['gameInfo']['onlyForSignedUsersAlert'] = "ТОЛЬКО ДЛЯ ЗАРЕГИСТРИРОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ";

contexts['rating'] = [];
contexts['rating']['placeLabel'] = "Место";
contexts['rating']['usernameLabel'] = "Имя";
contexts['rating']['searchByUsernameLabel'] = "Поиск";
contexts['rating']['regDateLabel'] = "Дата";
contexts['rating']['solvedCountLabel'] = "Решено";
contexts['rating']['playedCountLabel'] = "Всего";
contexts['rating']['bestWinTimeCountLabel'] = "1-х мест<br />по<br />времени";
contexts['rating']['bestWinTimeCountShortLabel'] = "1-x мест";
contexts['rating']['totalGameTimeShortLabel'] = "Общ вр";
contexts['rating']['averageWinTimeShortLabel'] = "Ср вр";
contexts['rating']['totalGameRatingShortLabel'] = "Сумм рейт";
contexts['rating']['absoluteRatingMenuLabel'] = "абсолютный рейтинг";
contexts['rating']['regForRatingAlert'] = "Для участия в рейтинге вам необходимо <span id='rlReg' class='actionText'>ввести имя</span>.";
contexts['rating']['sortByPlaceHint'] = "Сортировать по<br />месту в рейтинге";
contexts['rating']['sortByDateHint'] = "Сортировать по<br />дате регистрации";
contexts['rating']['sortBySolvedRatio'] = "Сортировать по<br />проценту выигранных раскладов";
contexts['rating']['userRowPrefix'] = "Вы";
contexts['rating']['yearChampionMarkAppx'] = "года";
contexts['rating']['segmentChampionMarkAppx'] = "серии";
contexts['rating']['absoluteChampionMarkPrefix'] = "абсолютный";
contexts['rating']['championMark'] = "чемпион";
contexts['rating']['exChampionMark'] = "экс-чемпион";
contexts['rating']['placeSuffix'] = "место";
contexts['rating']['noviceMark'] = "новичок";
contexts['rating']['averageWinTimeLabel'] = "Среднее время решения";
contexts['rating']['totalGameTimeLabel'] = "Игровое время";
contexts['rating']['playerResultHeader'] = "Результат игрока {{0}}"; // 0 - имя игрока
contexts['rating']['userResultHeader'] = "Ваш результат";
contexts['rating']['selfHistoryHint'] = "Все сыгранные Вами расклады Вы можете найти в <span class='actionText2' id='pdShowHistory'>Истории</span>.";
contexts['rating']['wrongGameVariationAlert'] = "Эта игра из другой версии пасьянса и поэтому не может быть загружена.";
contexts['shared']['bestAttempt'] = "Лучший результат: ";
contexts['shared']['YourAttempt'] = "Ваш результат:";
contexts['shared']['allResults'] = "Показать весь список";


contexts['profile'] = [];
contexts['profile']['sideActivityHeader'] = "Это имя пользователя на других компьютерах";
contexts['profile']['inboxHeader'] = "Диалоги";
contexts['profile']['sendMsgMenuAction'] = "Отправить сообщение";
contexts['profile']['noDialogsAlert'] = "Вы ещё ни с кем не переписывались.";
contexts['profile']['opponentLabel'] = "С кем";
contexts['profile']['msgTextLabel'] = "Текст последнего сообщения";
contexts['profile']['sentDateTimeLabel'] = "Отправлено";
contexts['profile']['conversationWithPrefix'] = "Переписка с";
contexts['profile']['replyButtonLabel'] = "Отправить сообщение";
contexts['profile']['msgRecipientPrefix'] = "Сообщение для";
contexts['profile']['sendReplyButtonLabel'] = "Отправить";
contexts['profile']['emptyMsgAlert'] = "Текст сообщения не может быть пустым.";
contexts['profile']['sendPMHeader'] = "Отправить личное сообщение";
contexts['profile']['selectRecipientsButtonLabel'] = "Выбор получателей сообщения";
contexts['profile']['sendMsgButtonLabel'] = "Отправить сообщение";
contexts['profile']['noRecipientAlert'] = "Вы не выбрали ни одного получателя.";
contexts['profile']['msgSentSuccessfullyAlert'] = "Сообщение успешно отправлено.";
contexts['profile']['newMessagesLabel'] = "Новых сообщений";
contexts['profile']['birthdayLabel'] = "Дата&nbsp;рождения";
contexts['profile']['fromwhereLabel'] = "Город";
contexts['profile']['linkLabel'] = "Ссылка в соц-сети";
contexts['profile']['aboutLabel'] = "О себе";
contexts['profile']['regDateLabel'] = "Дата регистрации";
contexts['profile']['emptyFieldStub'] = "не указано";
contexts['profile']['pdSendPMButtonLabel'] = "Отправить личное сообщение";
contexts['profile']['pdRecipientHeaderPrefix'] = "Отправка сообщения игроку";
contexts['profile']['pdSendButtonLabel'] = "Отправить сообщение";

contexts['bonus'] = [];
contexts['bonus']['fastestBonus'] = "Вы сложили этот расклад быстрее всех.";
contexts['bonus']['firstBonus'] = "Вы первый игрок, решивший этот расклад.";
contexts['bonus']['lessThanAveragePrefix'] = "меньше среднего на";
contexts['bonus']['greaterThanAveragePrefix'] = "больше среднего на";
contexts['bonus']['winTimeRankLabel'] = "Место по времени до решения";
contexts['bonus']['bestAttemptBonus'] = "Эта попытка является лучшей по времени.";
contexts['bonus']['betterAttemptBonus'] = "Вы улучшили время по самой быстрой попытке.";
contexts['bonus']['bestAttemptRankLabel'] = "Место по лучшей попытке";
contexts['bonus']['bestAttemptRankNoChangeNotice'] = "Ваше место в рейтинге по лучшей попытке не изменилось.";
contexts['bonus']['rangeFromPrepositionAlpha'] = "с";
contexts['bonus']['rangeFromPrepositionBeta'] = "со";
contexts['bonus']['bestAttemptRankChangeNotice'] = "<p>Вы поднялись в рейтинге расклада по<br />"
    + "лучшей попытке {{2}} {{0}} на {{1}} место.</p>";
contexts['bonus']['ratingRankChangeNotice'] = "<p style='margin-top: 15px;'>Вы поднялись в общем рейтинге "
    + " {{2}} {{0}} на {{1}} место.</p>";

contexts['guestBook'] = [];
contexts['guestBook']['noMessagesAlert'] = "Пока никто не оставил сообщений.";
contexts['guestBook']['isAdminPostLabel'] = "от админа";
contexts['guestBook']['postLoadingAltText'] = "Отправка сообщения";
contexts['guestBook']['postButtonLabel'] = "Добавить сообщение";
contexts['guestBook']['header'] = "Вопросы и отзывы";
contexts['guestBook']['emptyMsgAlert'] = "Вы не ввели сообщение!";
contexts['guestBook']['adminUsername'] = "Админ";
contexts['guestBook']['saveChangesButtonLabel'] = "Сохранить";

contexts['loginRegister'] = [];
contexts['loginRegister']['loginPasswdNoMatchNotice'] = "Введённая пара логин/пароль не найдена.";
contexts['loginRegister']['minUsernameLengthNotice'] = "Минимальная длина 3 символа.";
contexts['loginRegister']['maxUsernameLengthNotice'] = "Максимальная длина 25 символов.";
contexts['loginRegister']['minPasswdLengthNotice'] = "Минимальная длина 5 символа.";
contexts['loginRegister']['maxPasswdLengthNotice'] = "Максимальная длина 25 символов.";
contexts['loginRegister']['passwdsDontMatchNotice'] = "Введённые пароли не совпадают.";
contexts['loginRegister']['passwdsDoMatchNotice'] = "Пароли совпадают.";
contexts['loginRegister']['usernameTakenNotice'] = "Имя пользователя занято.";
contexts['loginRegister']['usernameAvailableNotice'] = "Имя пользователя свободно.";
contexts['loginRegister']['usernameRequiredNotice'] = "Вы не указали имя пользователя.";
contexts['loginRegister']['passwdRequiredNotice'] = "Вы не указали пароль.";

contexts['controller'] = [];
contexts['controller']['startPrevGamePrompt'] = "Вернуться к предыдущей игре?";
contexts['controller']['startNewGamePrompt'] = "Начать новую игру?";
contexts['controller']['replayGamePrompt'] = "Начать сначала?";
contexts['controller']['noGamesBySpecifiedParametersNotice'] = "Игр по заданным параметрам не найдено.";

contexts['ui'] = [];
contexts['ui']['loadingNotice'] = "Загрузка";
contexts['ui']['ascOrderHint'] = "по возр.";
contexts['ui']['descOrderHint'] = "по убыв.";
contexts['ui']['ratingLabel'] = "рейт";
contexts['ui']['ratingFullLabel'] = "рейтинг";
contexts['ui']['historyLengthLabel'] = "ходов";
contexts['ui']['solutionLengthLabel'] = "длина";
contexts['ui']['attemptTimeLabel'] = "время";
contexts['ui']['gameTimeLabel'] = "общ вр";
contexts['ui']['gameTimeFullLabel'] = "общee врeмя";
contexts['ui']['attemptsLabel'] = "Попытки";
contexts['ui']['closeIconAltText'] = "Закрыть";
contexts['ui']['forUsersOnlyNotice'] = "Для использования этой возможности вам необходимо зарегистрироваться или выполнить вход.";
contexts['ui']['logoutConfirmation'] = "Вы действительно хотите выйти?";
contexts['ui']['gameIsLoadingNotice'] = "Загрузка игры...";
contexts['ui']['isComputerSolutionHint'] = "решение, предложенное компьютером";
contexts['ui']['specialMoveActionHint'] = "Выберите карту или нажмите ESC для отмены.";
contexts['ui']['noSolutionAvailableNotice'] = "Для этого расклада нет предсохранённого решения.";
contexts['ui']['solutionLoadingFailureNotice'] = "При загрузке решения возникла ошибка.";

contexts['beacon'] = [];
contexts['beacon']['activityString'] =
    "Сейчас на сайте — гостей: {{0}}, зарегистрированных пользователей: {{1}} (из {{2}}).";
contexts['beacon']['noConnectionNotice'] = "Невозможно установить соединение с сервером. " +
    "Возможно результат текущей игры не будет сохранён.";

contexts['kosynka'] = [];
contexts['kosynka']['deckContainsDuplicatesError'] = "Игра не может быть создана: колода содержит дубли";
contexts['kosynka']['deckWrongCardCountError'] = "Игра не может быть создана: в колоде отличное от 52 число карт";

contexts['card'] = [];
contexts['card']['specialMove'] = "Спецход";
contexts['card']['specialMoveCancel'] = "Отменить спецход";


// arkanoid, lines

contexts['ui']['points'] = "очков"
contexts['ui']['points2'] = "Очки"
contexts['ui']['pause'] = "Пауза"
contexts['ui']['playothergames'] =       "Перейти на другие игры"
contexts['ui']['questionsandcomments'] = "Вопросы и отзывы"
contexts['ui']['description'] =          "Описание"

contexts['ui']['game_arkanoid'] = "Арканоид"
contexts['ui']['game_lines'] = "Линии"
contexts['ui']['game_tetris'] = "Тетрис"
contexts['ui']['game_match3'] = "Три в ряд"

contexts['ui']['yourrecord'] = "Ваш рекорд"
contexts['ui']['showhelp'] = "Показать подсказку"
contexts['ui']['hidehelp'] = "Скрыть подсказку"
contexts['ui']['maxpointspergame'] = "Макс. кол-во очков за игру"
contexts['ui']['timeinbestgame'] = "Вр. в лучш. игре / ходов назад"
contexts['ui']['averagepoints'] = "Сред.кол-во очков"
contexts['ui']['totalgames'] = "Всего игр"
contexts['ui']['totalmoves'] = "Всего ходов"
contexts['ui']['gametime'] = "Время в игре"
contexts['ui']['gametime2'] = "Время"


contexts['ui']['parameters'] = "Параметры"

contexts['ui']['movinganimation'] = "Выбор анимации перехода"
contexts['ui']['showpath'] = "Показывать путь"
contexts['ui']['showpath2'] = "Показывать место приземления фигуры"
contexts['ui']['stepbystep'] = "Показывать в движении"
contexts['ui']['withoutanimation'] = "Без анимации"
contexts['ui']['selectedball'] = "Выбранный шар"
contexts['ui']['highlight'] = "Выделить"
contexts['ui']['showanimation'] = "Показать анимацию"
contexts['ui']['gametype'] = "Тип игры (начнется новая игра)"
contexts['ui']['defaulttype'] = "Обычная (+3 шара)"
contexts['ui']['type2'] = "+2 шара (без записи в рейтинг)"
contexts['ui']['type4'] = "+4 шара (без записи в рейтинг)"
contexts['ui']['showbg'] = "Поле в клетку"
contexts['ui']['appearance'] = "Внешний вид"
contexts['ui']['solid_shape'] = "Обьемные фигуры"
contexts['ui']['flat_shape'] = "Плоские фигуры"
contexts['ui']['color'] = "Цветные"
contexts['ui']['color2'] = "Цвет"
contexts['ui']['active_color'] = "Активные цветные"
contexts['ui']['gray'] = "Однотонные"

contexts['ui']['cancel'] = "Отмена"

contexts['ui']['yes'] = "Да"
contexts['ui']['no'] = "Нет"

contexts['ui']['savegame'] = "Сохранить текущую игру?"

contexts['ui']['allplayers'] = "все игроки"
contexts['ui']['onlineplayers'] = "сейчас на сайте"

contexts['ui']['movesback'] = "Ходов назад"

contexts['ui']['background'] = "Фон"
contexts['ui']['gamearea'] = "Игровое поле"
contexts['ui']['textcolor'] = "Цвет текста игрового поля"

contexts['ui']['label_best'] = "Лучший"


// end

/* Gomoku */
contexts['g_button'] = [];
contexts['g_button']['takeback'] = "Ход назад";
contexts['g_button']['takeforward'] = "Ход вперед";
contexts['g_button']['xo'] = "Крестики-нолики";
contexts['g_button']['renju'] = "Рэндзю";
contexts['g_button']['newgame'] = "Новая игра";
contexts['g_button']['draw_offer'] = "Предложить ничью";
contexts['g_button']['spectate_leave'] = "Покинуть режим просмотра";
contexts['g_button']['spectate'] = "Режим просмотра";
contexts['g_button']['surrend'] = "Сдаться";
contexts['g_button']['fav_delete'] = "Удалить из избранного";
contexts['g_button']['fav_add'] = "Добавить в избранное";

contexts['g_game'] = [];
contexts['g_game']['novice'] = "Простой";
contexts['g_game']['medium'] = "Средний";
contexts['g_game']['hard'] = "Сложный";
contexts['g_game']['your_move'] = "Ваш ход";
contexts['g_game']['rival_move'] = "Ход соперника";
contexts['g_game']['rival_wait'] = "Подождите соперника...";
contexts['g_game']['rival_miss_move'] = "Ваш ход, соперник пропустил ход";
contexts['g_game']['defeat'] = "Поражение";
contexts['g_game']['defeat_surrended'] = "Поражение, вы сдались";
contexts['g_game']['defeat_timeleft'] = "Поражение, у вас истекло время";
contexts['g_game']['defeat_leavegame'] = "Поражение, вы покинули игру";
contexts['g_game']['win'] = "Победа";
contexts['g_game']['win_surrended'] = 'Победа, соперник сдался';
contexts['g_game']['win_timeleft'] = 'Победа, у соперника истекло время';
contexts['g_game']['win_leavegame'] = 'Победа, соперник покинул игру';
contexts['g_game']['draw'] = 'Ничья';
contexts['g_game']['draw_miss_move'] = 'Ничья, игроки пропустили ходы';
contexts['g_game']['status_lose'] = "Вы проиграли партию";
contexts['g_game']['status_win'] = "Поздравляем! Вы выиграли партию";
contexts['g_game']['no_games'] = "Сохранения отсутствуют";
contexts['g_game']['not_found_with_opp'] = "Не найдено игр с";
contexts['g_game']['computer'] = "Компьютер";

contexts['g_message'] = [];
contexts['g_message']['wait_30_sec'] = "Возможность предложить ничью появится в течение 30 секунд";
contexts['g_message']['player_0'] = "Игрок "; // начало фразы
contexts['g_message']['won_game_0'] = " выиграл партию"; // начало фразы
contexts['g_message']['training'] = "Тренировочный режим: игра без учета очков и времени";
contexts['g_message']['mode_chaning'] = "Смена режима игры...";
contexts['g_message']['start_new_game'] = "Да, начать новую игру";
contexts['g_message']['leave_game'] = "Нет, выйти";
contexts['g_message']['accept'] = "Принять";
contexts['g_message']['decline'] = "Отклонить";
contexts['g_message']['takeback_option0'] = "c правом сделать ход назад <b>без согласия соперника</b>";
contexts['g_message']['takeback_option1'] = "с правом сделать ход назад <b>с согласия соперника</b>";
contexts['g_message']['gamemode0'] = "в крестики-нолики";
contexts['g_message']['gamemode1'] = "<span style='color:#069;'>в рэндзю</span>";
contexts['g_message']['takeback_request'] = " просит отменить ход. Разрешить ему?";
contexts['g_message']['surrended'] = "Вы сдались<br>";
contexts['g_message']['already_leave_game'] = "Игрок уже покинул игру, извините";
contexts['g_message']['leave_game_0'] = "покинул игру!";
contexts['g_message']['spectate_leave_0'] = "Вы вышли из режима просмотра";
contexts['g_message']['surrended_0'] = "сдался";
contexts['g_message']['win_0'] = ", вам засчитана победа.";
contexts['g_message']['lose_0'] = ", вам засчитано поражение.";
contexts['g_message']['you_inactive_minute'] = "Вы не участвуете в игре в течение минуты";
contexts['g_message']['rival_inactive_minute'] = "Соперник бездействует в течение минуты";
contexts['g_message']['player_re-move'] = "Игрок переходил";
contexts['g_message']['game_not_found'] = "Игра не найдена";
contexts['g_message']['player_reject_takeback'] = "Игрок отклонил вашу просьбу об отмене последнего хода";
contexts['g_message']['leave_game_q'] = "Покинуть текущую игру?";
contexts['g_message']['lose_if_exit'] = " Вам будет засчитано поражение в текущей партии";
contexts['g_message']['rating_newbie_0'] = "Вы появились в рейтинге на";
contexts['g_message']['rating_newbie_1'] = "месте.";
contexts['g_message']['rating_rise_0'] = "Вы поднялись в общем рейтинге с";
contexts['g_message']['rating_rise_2'] = 'на';
contexts['g_message']['rating_rise_1'] = "место.";
contexts['g_message']['rating_fall_0'] = "Вы опустились в общем рейтинге с";
contexts['g_message']['rating_points'] = 'очков';
contexts['g_message']['rating_current_rank'] = "Вы находитесь в рейтинге на";
contexts['g_message']['play_again_q'] = "еще раз?";
contexts['g_message']['play_again'] = "Сыграть с";
contexts['g_message']['time_left'] = "Осталось:";
contexts['g_message']['draw_request_q'] = "предложил ничью. Вы согласны?";
contexts['g_message']['draw_decline'] = "не согласен на ничью";
contexts['g_message']['draw_agree'] = "согласен на ничью.";
contexts['g_message']['server_update'] = "Готовится обновление сервера, новые игры временно недоступны";
contexts['g_message']['history_mode'] = "История игр в режиме";

contexts['g_chat'] = [];
contexts['g_chat']['type_your_message'] = "Введите ваше сообщение...";
contexts['g_chat']['message_banned'] = "Вы не можете писать сообщения в чате, т.к. добавлены в черный список за употребление нецензурных выражений и/или спам.";
contexts['g_chat']['message_bad_words'] = "В чате запрещено использование ненормативной лексики и оскорбительных выражений";
contexts['g_chat']['message_length_limit'] = "Сообщение слишком длинное (максимальная длина - 128 символов). Сократите его попробуйте снова";
contexts['g_chat']['message_send_limit'] = "Слишком много сообщений одновременно";
contexts['g_chat']['type_new_message'] = "Напишите первое сообщение";
contexts['g_chat']['username_admin'] = "Админ";
contexts['g_chat']['user_0'] = "Пользователь";
contexts['g_chat']['added_to_bl'] = "добавлен в черный список";
contexts['g_chat']['delete_message'] = "Удалить сообщение";
contexts['g_chat']['message_deleted'] = "Сообщение удалено";
contexts['g_chat']['message_delete_time_passed'] = "Сообщение можно удалить только в течение первых 5 минут";
contexts['g_chat']['player_in_game'] = "находится в игре";
contexts['g_chat']['already_banned'] = "уже забанен";
contexts['g_chat']['already_banned'] = "уже забанен";
contexts['g_chat']['expand'] = "Развернуть чат";
contexts['g_chat']['hide'] = "Свернуть чат";
contexts['g_chat']['template_header'] = "Готовые сообщения";

contexts['g_pl'] = [];
contexts['g_pl']['msg_disconnected'] = "Соединение с сервером отсутствует";
contexts['g_pl']['msg_reconnect'] = "Переподключиться";
contexts['g_pl']['msg_second_window'] = "Запущена вторая копия игры";
contexts['g_pl']['no_players'] = "Игроков нет";
contexts['g_pl']['msg_player_not_found'] = "Игрок не найден";
contexts['g_pl']['rating_rank'] = "место в рейтинге";
contexts['g_pl']['username_guest'] = "Гость";
contexts['g_pl']['button_invite'] = "Пригласить";
contexts['g_pl']['button_cancel_invite'] = "Отмена";
contexts['g_pl']['rating_no_rank'] = "отсутствует в рейтинге";
contexts['g_pl']['expand'] = "Развернуть список игроков";
contexts['g_pl']['hide'] = "Свернуть список игроков";
contexts['g_pl']['msg_invite_to_game'] = "предлагает сыграть партию";
contexts['g_pl']['msg_renju'] = "в рэндзю";
contexts['g_pl']['msg_game_saved'] = "Текущая партия будет сохранена. Вы можете доиграть ее, загрузив из Истории.";
contexts['g_pl']['button_random_rival'] = "Играть с любым";
contexts['g_pl']['waiting_for_rival'] = "Ожидание игрока...";
contexts['g_pl']['invite_decline'] = "отклонил ваше предложение об игре";
contexts['g_pl']['invite_waiting_limit'] = "превысил лимит ожидания в";
contexts['g_pl']['already_invited'] = "уже приглашен в игру другим пользователем";
contexts['g_pl']['seconds'] = "секунд";

contexts['g_rating'] = [];
contexts['g_rating']['all_players'] = "все игроки";
contexts['g_rating']['online_players'] = "сейчас на сайте";
contexts['g_rating']['admin_button'] = "Админка";
contexts['g_rating']['profiles_button'] = "профили";
contexts['g_rating']['rank'] = "Место";
contexts['g_rating']['username'] = "Имя";
contexts['g_rating']['elo'] = "Рейтинг<br>Эло";
contexts['g_rating']['games_win'] = "Выиграл<br>у соперников";
contexts['g_rating']['games_win_percent'] = "%";
contexts['g_rating']['games_win_comp'] = "Выиграл<br>у компьютера";
contexts['g_rating']['reg_date'] = "Дата<br>рег-ции";
contexts['g_rating']['you'] = "Вы";
contexts['g_rating']['your_rank'] = "место";
contexts['g_rating']['search'] = "Поиск:";
contexts['g_rating']['scroll_to_top'] = "в начало рейтинга";
contexts['g_rating']['close'] = "закрыть";
contexts['g_rating']['newbie'] = "новичок";
contexts['g_rating']['title_sort_win_online'] = "Сортировать по кол-ву выигранных партий в онлайне";
contexts['g_rating']['title_sort_percent'] = "Сортировать по проценту побед";
contexts['g_rating']['title_sort_comp'] = "Сортировать по кол-ву выигранных партий у компьютера";
contexts['g_rating']['title_sort_regdate'] = "Сортировать по дате регистрации";
contexts['g_rating']['title_sort_elo'] = "Сортировать по рейтингу Эло";
contexts['g_rating']['title_win'] = "выиграл";
contexts['g_rating']['title_lose'] = "проиграл";
contexts['g_rating']['title_close_rating'] = "Закрыть окно рейтинга";
contexts['g_rating']['more_0'] = "Еще";
contexts['g_rating']['players_0'] = "игроков";
contexts['g_rating']['average_game_time'] = "Среднее время игры:";
contexts['g_rating']['total_game_time'] = "Игровое время:";
contexts['g_rating']['total_score'] = "Общий счет с этим игроком:";