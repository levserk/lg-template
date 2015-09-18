var contexts = [];

contexts['months'] = [];
contexts['months'][1] = "January";
contexts['months'][2] = "February";
contexts['months'][3] = "March";
contexts['months'][4] = "April";
contexts['months'][5] = "May";
contexts['months'][6] = "June";
contexts['months'][7] = "July";
contexts['months'][8] = "August";
contexts['months'][9] = "September";
contexts['months'][10] = "October";
contexts['months'][11] = "November";
contexts['months'][12] = "December";

contexts['monthsShort'] = [];
contexts['monthsShort'][1] = "January";
contexts['monthsShort'][2] = "February";
contexts['monthsShort'][3] = "March";
contexts['monthsShort'][4] = "April";
contexts['monthsShort'][5] = "May";
contexts['monthsShort'][6] = "June";
contexts['monthsShort'][7] = "July";
contexts['monthsShort'][8] = "August";
contexts['monthsShort'][9] = "September";contexts['monthsShort'][10] = "October";
contexts['monthsShort'][11] = "November";
contexts['monthsShort'][12] = "December";

contexts['monthsBeta'] = [];
contexts['monthsBeta'][1] = "January";
contexts['monthsBeta'][2] = "February";
contexts['monthsBeta'][3] = "March";
contexts['monthsBeta'][4] = "April";
contexts['monthsBeta'][5] = "May";
contexts['monthsBeta'][6] = "June";
contexts['monthsBeta'][7] = "July";
contexts['monthsBeta'][8] = "August";
contexts['monthsBeta'][9] = "September";
contexts['monthsBeta'][10] = "October";
contexts['monthsBeta'][11] = "November";
contexts['monthsBeta'][12] = "December";

contexts['games'] = [];
contexts['games'][KOSYNKA_GAME_VARIATION_ID] = "Klondike Solitaire";
contexts['games'][FREECELL_GAME_VARIATION_ID] = "Freecell Solitaire";
contexts['games'][CHESS_GAME_VARIATION_ID] = "Chess";
contexts['games'][SPIDER_1S_GAME_VARIATION_ID] = "Spider Solitaire  (1 suit)";
contexts['games'][SPIDER_2S_GAME_VARIATION_ID] = "Spider Solitaire (2 suits)";
contexts['games'][SPIDER_4S_GAME_VARIATION_ID] = "Spider Solitaire (4 suits)";
contexts['games'][SOKOBAN_GAME_VARIATION_ID] = "Sokoban";

contexts['shared'] = [];
contexts['shared']['locale'] = "en";
contexts['shared']['isLatin'] = true;
contexts['shared']['symbolMap'] = {"Ё" : "YO", "Й" : "I", "Ц" : "TS", "У" : "U", "К" : "K", "Е" : "E", "Н" : "N", "Г" : "G", "Ш" : "SH", "Щ" : "SCH", "З" : "Z", "Х" : "H", "Ъ" : "'", "ё" : "yo", "й" : "i", "ц" : "ts", "у" : "u", "к" : "k", "е" : "e", "н" : "n", "г" : "g", "ш" : "sh", "щ" : "sch", "з" : "z", "х" : "h", "ъ" : "'", "Ф" : "F", "Ы" : "I", "В" : "V", "А" : "a", "П" : "P", "Р" : "R", "О" : "O", "Л" : "L", "Д" : "D", "Ж" : "ZH", "Э" : "E", "ф" : "f", "ы" : "i", "в" : "v", "а" : "a", "п" : "p", "р" : "r", "о" : "o", "л" : "l", "д" : "d", "ж" : "zh", "э" : "e", "Я" : "Ya", "Ч" : "CH", "С" : "S", "М" : "M", "И" : "I", "Т" : "T", "Ь" : "'", "Б" : "B", "Ю" : "YU", "я" : "ya", "ч" : "ch", "с" : "s", "м" : "m", "и" : "i", "т" : "t", "ь" : "", "б" : "b", "ю" : "yu"}; // ь - '
contexts['shared']['loadingAltText'] = "Loading";
contexts['shared']['loadingAlert'] = "Loading";
contexts['shared']['auxScrollTop'] = "Scroll to Top";
contexts['shared']['auxClose'] = "Close";
contexts['shared']['dataLoadingErrorAlert'] = "Data load error. Try again later.";
contexts['shared']['daysShortSuffix'] = "d";
contexts['shared']['hoursShortSuffix'] = "h";
contexts['shared']['minutesShortSuffix'] = "m";
contexts['shared']['secondsShortSuffix'] = "s";
contexts['shared']['closeIconAltText'] = "Close";
contexts['shared']['notLoggedNotice'] = "Authorization was lost. Try reloading page."; // TODO
contexts['shared']['unknownLoadingErrorNotice'] = "Error occurred while loading data. Try reloading page."; // TODO
contexts['shared']['email'] = "e-mail";
contexts['shared']['btnUp'] = "UP";

contexts['time'] = [];
contexts['time']['daysShortSuffix'] = "d";
contexts['time']['hoursSuperShortSuffix'] = "h";
contexts['time']['minutesShortSuffix'] = "min";
contexts['time']['minutesSuperShortSuffix'] = "m";
contexts['time']['secondsShortSuffix'] = "sec";
contexts['time']['today'] = "today";

contexts['paginator'] = [];
contexts['paginator']['previousPrefix'] = "Previous";
contexts['paginator']['nextPrefix'] = "Next";
contexts['paginator']['rangeOf'] = "of";

contexts['loader'] = [];
contexts['loader']['loaderMorePrefix'] = 'More';
contexts['loader']['loaderMoreSuffix'] = [];
contexts['loader']['loaderMoreSuffix']['hands'] = "hands";
contexts['loader']['loaderMoreSuffix']['levels'] = "levels";
contexts['loader']['loaderMoreSuffix']['players'] = "players";
contexts['loader']['loaderShowAll'] = "Show all";
contexts['loader']['loaderOf'] = "of";

contexts['parameters'] = [];
contexts['parameters']['gameIdRangeAlert'] = "Enter number from {{0}} to {{1}}.";

contexts['gameList'] = [];
contexts['gameList']['gameIdLabel'] = 'Number';
contexts['gameList']['gameRatingLabel'] = 'Rating';
contexts['gameList']['gameRatingDescription'] = 'average time per solving player';
contexts['gameList']['winTimeAndRankLabel'] = 'Your time /<br />rank';
contexts['gameList']['winTimeAndRankDescription'] = 'time spent on solving';
contexts['gameList']['solvedLabel'] = 'Won';
contexts['gameList']['playedLabel'] = 'Played';
contexts['gameList']['noRatingAltText'] = 'no rating';
contexts['gameList']['sortByGameIdHint'] = "Sort by<br />hand id";
contexts['gameList']['sortByGameRatingHint'] = "Sort by average time<br />among all winners";
contexts['gameList']['sortByWinTimeHint'] = "Sort by<br />your solution time";
contexts['gameList']['sortByWonCountHint'] = "Sort by<br />winner count";
contexts['gameList']['sortByPlayedCountHint'] = "Sort by<br />players count";

contexts['history'] = [];
contexts['history']['gameIdLabel'] = [];
contexts['history']['gameIdLabel']['hand'] = 'Hand';
contexts['history']['gameIdLabel']['level'] = 'Level';
contexts['history']['commentLabel'] = 'Comment';
contexts['history']['wtLabel'] = 'Solution time / your rank for this hand';
contexts['history']['baLabel'] = 'Best attempt time / your rank for this hand';
contexts['history']['dateDaysLabel'] = 'Date/days';
contexts['history']['dateLabel'] = 'Date';
contexts['history']['noGamesByFilterAlert'] = "No games available for this filter setting.";
contexts['history']['noGamesAlert'] = "Your history contains no games so far.";
contexts['history']['filtersLabel'] = "Filters";
contexts['history']['allFilterLabel'] = "all";
contexts['history']['favoritesFilterLabel'] = "favorites";
contexts['history']['unsolvedFilterLabel'] = "unsolved";
contexts['history']['addToFavoritesCheckBoxLabel'] = "add to favorites";
contexts['history']['saveButtonLabel'] = "Save";
contexts['history']['dismissButtonLabel'] = "Cancel";
contexts['history']['pokeSolutionShortLabel'] = "see sol-n";

contexts['gameInfo'] = [];
contexts['gameInfo']['gameIdLabel'] = [];
contexts['gameInfo']['gameIdLabel']['hand'] = "Hand #";
contexts['gameInfo']['gameIdLabel']['level'] = "Level: ";
contexts['gameInfo']['byWinTimeLabel'] = "By solution time";
contexts['gameInfo']['byBestAttemptTimeLabel'] = "By best attempt";
contexts['gameInfo']['unsolvedListLabel'] = "Unsolved list";
contexts['gameInfo']['playerResultsHeader'] = "Player results";
contexts['gameInfo']['gameRatingLabel'] = "hand rating";
contexts['gameInfo']['wonCountLabel'] = "won count";
contexts['gameInfo']['playedCountLabel'] = "played count";
contexts['gameInfo']['commentLabel'] = "Comment";
contexts['gameInfo']['onlyForSignedUsersAlert'] = "ONLY FOR SIGNED USERS";

contexts['rating'] = [];
contexts['rating']['placeLabel'] = "Place";
contexts['rating']['usernameLabel'] = "User name";
contexts['rating']['searchByUsernameLabel'] = "Search";
contexts['rating']['regDateLabel'] = "Date";
contexts['rating']['solvedCountLabel'] = "Solved count";
contexts['rating']['playedCountLabel'] = "Total";
contexts['rating']['bestWinTimeCountLabel'] = "1st places<br />by<br />time";
contexts['rating']['bestWinTimeCountShortLabel'] = "1st places";
contexts['rating']['totalGameTimeShortLabel'] = "Tot. time";
contexts['rating']['averageWinTimeShortLabel'] = "Avg. time";
contexts['rating']['totalGameRatingShortLabel'] = "Tot. rate";
contexts['rating']['absoluteRatingMenuLabel'] = "absolute rating";
contexts['rating']['regForRatingAlert'] = "To participate in the rating you must <span id='rlReg' class='actionText'>enter a name</span>.";
contexts['rating']['sortByPlaceHint'] = "Sort by<br />rating position";
contexts['rating']['sortByDateHint'] = "Sort by<br />registration date";
contexts['rating']['sortBySolvedRatio'] = "Sort by<br />hands solved ratio";
contexts['rating']['userRowPrefix'] = "You";
contexts['rating']['yearChampionMarkAppx'] = "year";
contexts['rating']['segmentChampionMarkAppx'] = "series";
contexts['rating']['absoluteChampionMarkPrefix'] = "absolute";
contexts['rating']['championMark'] = "champion";
contexts['rating']['exChampionMark'] = "ex-champion";
contexts['rating']['placeSuffix'] = "place";
contexts['rating']['noviceMark'] = "novice";
contexts['rating']['averageWinTimeLabel'] = "Average solution time";
contexts['rating']['totalGameTimeLabel'] = "Game time";
contexts['rating']['playerResultHeader'] = "Result of player {{0}}"; // 0 - player name
contexts['rating']['userResultHeader'] = "Your result";
contexts['rating']['selfHistoryHint'] = "All hands you have played are available in the <span class='actionText2' id='pdShowHistory'>History</span>.";
contexts['rating']['wrongGameVariationAlert'] = "This game is from a wrong solitaire version and cannot be loaded.";
contexts['shared']['bestAttempt'] = "Best result: ";
contexts['shared']['YourAttempt'] = "Your result: ";
contexts['shared']['allResults'] = "Show all results";

contexts['profile'] = [];
contexts['profile']['sideActivityHeader'] = "This user name on other computers";
contexts['profile']['inboxHeader'] = "Conversations";
contexts['profile']['sendMsgMenuAction'] = "Send message";
contexts['profile']['noDialogsAlert'] = "You have not started a conversation yet.";
contexts['profile']['opponentLabel'] = "Recipient";
contexts['profile']['msgTextLabel'] = "Text of last message";
contexts['profile']['sentDateTimeLabel'] = "Sent";
contexts['profile']['conversationWithPrefix'] = "Conversation with";
contexts['profile']['replyButtonLabel'] = "Send message";
contexts['profile']['msgRecipientPrefix'] = "Message for";
contexts['profile']['sendReplyButtonLabel'] = "Send";
contexts['profile']['emptyMsgAlert'] = "Message text cannot be empty.";
contexts['profile']['sendPMHeader'] = "Send private message";
contexts['profile']['selectRecipientsButtonLabel'] = "Choose message recipients";
contexts['profile']['sendMsgButtonLabel'] = "Send message";
contexts['profile']['noRecipientAlert'] = "You must choose at least one recipient.";
contexts['profile']['msgSentSuccessfullyAlert'] = "Message was sent successfully.";
contexts['profile']['newMessagesLabel'] = "New messages";
contexts['profile']['birthdayLabel'] = "Date&nbsp;of birth";
contexts['profile']['fromwhereLabel'] = "City";
contexts['profile']['linkLabel'] = "Link";
contexts['profile']['aboutLabel'] = "About";
contexts['profile']['regDateLabel'] = "Registration date";
contexts['profile']['emptyFieldStub'] = "unspecified";
contexts['profile']['pdSendPMButtonLabel'] = "Send private message";
contexts['profile']['pdRecipientHeaderPrefix'] = "Message to player being sent";
contexts['profile']['pdSendButtonLabel'] = "Send message";

contexts['bonus'] = [];
contexts['bonus']['fastestBonus'] = "You have won this hand faster than anyone.";
contexts['bonus']['firstBonus'] = "You are the first player to win this hand.";
contexts['bonus']['lessThanAveragePrefix'] = "less than average by";
contexts['bonus']['greaterThanAveragePrefix'] = "greater than average by";
contexts['bonus']['winTimeRankLabel'] = "Win time rank";
contexts['bonus']['bestAttemptBonus'] = "This attempt had the best time.";
contexts['bonus']['betterAttemptBonus'] = "You have improved your best try time.";
contexts['bonus']['bestAttemptRankLabel'] = "Best attempt rank";
contexts['bonus']['bestAttemptRankNoChangeNotice'] = "Your position in the best attempt rank has not changed.";
contexts['bonus']['rangeFromPrepositionAlpha'] = "с";
contexts['bonus']['rangeFromPrepositionBeta'] = "со";
contexts['bonus']['bestAttemptRankChangeNotice'] = "<p>You have gone up in the best<br />"
    + "attempt rank {{2}} {{0}} to {{1}} position.</p>";
contexts['bonus']['ratingRankChangeNotice'] = "<p style='margin-top: 15px;'>You have gone up in the general rating "
    + " {{2}} {{0}} to {{1}} position.</p>";

contexts['guestBook'] = [];
contexts['guestBook']['noMessagesAlert'] = "No one has left a message yet.";
contexts['guestBook']['isAdminPostLabel'] = "from admin";
contexts['guestBook']['postLoadingAltText'] = "Message being sent";
contexts['guestBook']['postButtonLabel'] = "Add message";
contexts['guestBook']['header'] = "Questions and comments";
contexts['guestBook']['emptyMsgAlert'] = "You have not entered a message!";
contexts['guestBook']['adminUsername'] = "Admin";
contexts['guestBook']['saveChangesButtonLabel'] = "Save";

contexts['loginRegister'] = [];
contexts['loginRegister']['loginPasswdNoMatchNotice'] = "The entered login/password combination has not been found.";
contexts['loginRegister']['minUsernameLengthNotice'] = "Name must be at least 3 symbols long.";
contexts['loginRegister']['maxUsernameLengthNotice'] = "Maximum length is 25 symbols.";
contexts['loginRegister']['minPasswdLengthNotice'] = "Password must be at least 5 symbols long.";
contexts['loginRegister']['maxPasswdLengthNotice'] = "Maximum length is 25 symbols.";
contexts['loginRegister']['passwdsDontMatchNotice'] = "The passwords entered do not match.";
contexts['loginRegister']['passwdsDoMatchNotice'] = "Passwords match.";
contexts['loginRegister']['usernameTakenNotice'] = "This username is taken.";
contexts['loginRegister']['usernameAvailableNotice'] = "This username is available.";
contexts['loginRegister']['usernameRequiredNotice'] = "You have not specified a user name.";
contexts['loginRegister']['passwdRequiredNotice'] = "You have not specified a password.";

contexts['controller'] = [];
contexts['controller']['startPrevGamePrompt'] = "Return to previous game?";
contexts['controller']['startNewGamePrompt'] = "Start new game?";
contexts['controller']['replayGamePrompt'] = "Replay game?";
contexts['controller']['noGamesBySpecifiedParametersNotice'] = "No games with given parameters have been found.";

contexts['ui'] = [];
contexts['ui']['loadingNotice'] = "Loading";
contexts['ui']['ascOrderHint'] = "asc. order";
contexts['ui']['descOrderHint'] = "desc. order";
contexts['ui']['ratingLabel'] = "rate";
contexts['ui']['ratingFullLabel'] = "rating";
contexts['ui']['historyLengthLabel'] = "moves";
contexts['ui']['historyLengthLabel'] = "length";
contexts['ui']['attemptTimeLabel'] = "time";
contexts['ui']['gameTimeLabel'] = "tot.time";
contexts['ui']['gameTimeFullLabel'] = "total time";
contexts['ui']['attemptsLabel'] = "Attempts";
contexts['ui']['closeIconAltText'] = "Close";
contexts['ui']['forUsersOnlyNotice'] = "To use this feature you must first register or sign in.";
contexts['ui']['logoutConfirmation'] = "Are you sure you want to sign out?";
contexts['ui']['gameIsLoadingNotice'] = "Game loading...";
contexts['ui']['isComputerSolutionHint'] = "solution suggested by computer";
contexts['ui']['specialMoveActionHint'] = "Select card or press ESC to cancel.";
contexts['ui']['noSolutionAvailableNotice'] = "No pre-saved solution available for this hand.";
contexts['ui']['solutionLoadingFailureNotice'] = "Error during solution load.";

contexts['beacon'] = [];
contexts['beacon']['activityString'] =
    "Currently online — guests: {{0}}, registered users: {{1}} (of {{2}}).";
contexts['beacon']['noConnectionNotice'] = "Cannot establish connection to server. " +
    "The current game result may not be saved.";

contexts['kosynka'] = [];
contexts['kosynka']['deckContainsDuplicatesError'] = "Game cannot be created: the deck contains duplicates";
contexts['kosynka']['deckWrongCardCountError'] = "The game cannot be created: the number of cards in the deck is not 52";

contexts['card'] = [];
contexts['card']['specialMove'] = "Special move";
contexts['card']['specialMoveCancel'] = "Cancel special move";

// arkanoid, lines

contexts['ui']['points'] = "points"
contexts['ui']['points2'] = "Points"
contexts['ui']['pause'] = "Pause"
contexts['ui']['playothergames'] =       "Play other games"
contexts['ui']['questionsandcomments'] = "Questions and comments"
contexts['ui']['description'] =          "Description"

contexts['ui']['game_arkanoid'] = "Arkanoid"
contexts['ui']['game_lines'] = "Lines"
contexts['ui']['game_tetris'] = "Tetris"
contexts['ui']['game_match3'] = "Match 3"

contexts['ui']['yourrecord'] = "Your record"
contexts['ui']['showhelp'] = "Show help"
contexts['ui']['hidehelp'] = "Hide help"
contexts['ui']['maxpointspergame'] = "Max. points per game"
contexts['ui']['timeinbestgame'] = "Time in best game/moves back"
contexts['ui']['averagepoints'] = "Average points"
contexts['ui']['totalgames'] = "Total games"
contexts['ui']['totalmoves'] = "Total moves"
contexts['ui']['gametime'] = "Game time"
contexts['ui']['gametime2'] = "Time"

contexts['ui']['parameters'] = "Parameters"

contexts['ui']['movinganimation'] = "Moving animation"
contexts['ui']['showpath'] = "Show path"
contexts['ui']['showpath2'] = "Show path"
contexts['ui']['stepbystep'] = "Step by step"
contexts['ui']['withoutanimation'] = "Without animation"
contexts['ui']['selectedball'] = "Selected ball"
contexts['ui']['highlight'] = "Highlight"
contexts['ui']['showanimation'] = "Show animation"
contexts['ui']['gametype'] = "Game type (Start new game)"
contexts['ui']['defaulttype'] = "Default (+3 balls)"
contexts['ui']['type2'] = "+2 balls (without rating)"
contexts['ui']['type4'] = "+4 balls (without rating)"
contexts['ui']['showbg'] = "Show background"
contexts['ui']['appearance'] = "Appearance"
contexts['ui']['solid_shape'] = "Solid shape"
contexts['ui']['flat_shape'] = "Flat shape"
contexts['ui']['color'] = "Color"
contexts['ui']['color2'] = "Color"
contexts['ui']['active_color'] = "Active color"
contexts['ui']['gray'] = "Gray"

contexts['ui']['cancel'] = "Cancel"

contexts['ui']['yes'] = "Yes"
contexts['ui']['no'] = "No"

contexts['ui']['savegame'] = "Save game?"

contexts['ui']['allplayers'] = "All Players"
contexts['ui']['onlineplayers'] = "Online"

contexts['ui']['movesback'] = "Moves back"

contexts['ui']['background'] = "Background"
contexts['ui']['gamearea'] = "Game Area"
contexts['ui']['textcolor'] = "Text color"

contexts['ui']['label_best'] = "Best"

/* Gomoku */
contexts['g_button'] = [];
contexts['g_button']['takeback'] = "Move<br>backwards";
contexts['g_button']['takeforward'] = "Move<br>forward";
contexts['g_button']['xo'] = "Tic-tac-toe";
contexts['g_button']['renju'] = "Renju";
contexts['g_button']['newgame'] = "New game";
contexts['g_button']['draw_offer'] = "Request draw";
contexts['g_button']['spectate_leave'] = "Leave Spectator mode";
contexts['g_button']['spectate'] = "Spectator mode";
contexts['g_button']['surrend'] = "Surrender";
contexts['g_button']['fav_delete'] = "Remove from favourite";
contexts['g_button']['fav_add'] = "Add to favourite";

contexts['g_game'] = [];
contexts['g_game']['novice'] = "Easy";
contexts['g_game']['medium'] = "Normal";
contexts['g_game']['hard'] = "Difficult";
contexts['g_game']['your_move'] = "Your turn";
contexts['g_game']['rival_move'] = "Opponent's turn";
contexts['g_game']['rival_wait'] = "Wait...";
contexts['g_game']['rival_miss_move'] = "Your turn, opponent have missed turn";
contexts['g_game']['defeat'] = "Defeat";
contexts['g_game']['defeat_surrended'] = "Defeat, you have surrendered";
contexts['g_game']['defeat_timeleft'] = "Defeat, you have ran out of time";
contexts['g_game']['defeat_leavegame'] = "Defeat, you have left the game";
contexts['g_game']['win'] = "Victory";
contexts['g_game']['win_surrended'] = 'Victory, the opponent has surrendered';
contexts['g_game']['win_timeleft'] = 'Victory, the opponent has ran out of time';
contexts['g_game']['win_leavegame'] = 'Victory, the opponent has left the game';
contexts['g_game']['draw'] = 'Draw';
contexts['g_game']['draw_miss_move'] = 'Draw, the players have missed their turns ';
contexts['g_game']['status_lose'] = "Defeat";
contexts['g_game']['status_win'] = "Congratulations! You won";
contexts['g_game']['no_games'] = "No games";
contexts['g_game']['not_found_with_opp'] = "Not found: games with";
contexts['g_game']['computer'] = "Computer";


contexts['g_message'] = [];
contexts['g_message']['wait_30_sec'] = "You will be able to offer a draw within 30 seconds";
contexts['g_message']['player_0'] = "Player "; // начало фразы
contexts['g_message']['won_game_0'] = " won the game"; // начало фразы
contexts['g_message']['training'] = "Training mode";
contexts['g_message']['mode_chaning'] = "Wait...";
contexts['g_message']['start_new_game'] = "Yes, start new game";
contexts['g_message']['leave_game'] = "Not, leave game";
contexts['g_message']['accept'] = "Accept";
contexts['g_message']['decline'] = "Decline";
contexts['g_message']['takeback_option0'] = ", move backwards <b>without the corresponding consent of the opponent</b>";
contexts['g_message']['takeback_option1'] = ", move backwards <b>with the corresponding consent of the opponent</b>";
contexts['g_message']['gamemode0'] = "Tic-tac-toe";
contexts['g_message']['gamemode1'] = "<span style='color:#069;'>Renju</span>";
contexts['g_message']['takeback_request'] = " want to take back. Allow?";
contexts['g_message']['surrended'] = "Surrended<br>";
contexts['g_message']['already_leave_game'] = "Player leave game, sorry";
contexts['g_message']['leave_game_0'] = "leave game!";
contexts['g_message']['spectate_leave_0'] = "You leave spectator mode";
contexts['g_message']['surrended_0'] = "surrended";
contexts['g_message']['win_0'] = ", you won.";
contexts['g_message']['lose_0'] = ", you lose.";
contexts['g_message']['you_inactive_minute'] = "Out of game last 1 minute";
contexts['g_message']['rival_inactive_minute'] = "Opponent out of game last 1 minute";
contexts['g_message']['player_re-move'] = "Player change his last move";
contexts['g_message']['game_not_found'] = "Game not found";
contexts['g_message']['player_reject_takeback'] = "Player reject your takeback request";
contexts['g_message']['leave_game_q'] = "Leave current game?";
contexts['g_message']['lose_if_exit'] = " You will be awarded the defeat in current game";
contexts['g_message']['rating_newbie_0'] = "Your rank is";
contexts['g_message']['rating_newbie_1'] = "";
contexts['g_message']['rating_rise_0'] = "Your rank has changed from";
contexts['g_message']['rating_rise_2'] = 'to';
contexts['g_message']['rating_rise_1'] = "";
contexts['g_message']['rating_fall_0'] = "Your rank has changed from";
contexts['g_message']['rating_points'] = 'points';
contexts['g_message']['rating_current_rank'] = "You current rank";
contexts['g_message']['play_again_q'] = "once again?";
contexts['g_message']['play_again'] = "Play with";
contexts['g_message']['time_left'] = "Time left: ";
contexts['g_message']['draw_request_q'] = "request draw. Confirm draw?";
contexts['g_message']['draw_decline'] = "decline draw request";
contexts['g_message']['draw_agree'] = "accept draw request.";
contexts['g_message']['server_update'] = "New games temporarily unavailable";
contexts['g_message']['history_mode'] = "History in ";


contexts['g_chat'] = [];
contexts['g_chat']['type_your_message'] = "Type your message...";
contexts['g_chat']['message_banned'] = "You cannot write messages in the chat, because you have been blacklisted for using foul language and/or spamming";
contexts['g_chat']['message_bad_words'] = "Using profanity and abusive terms is prohibited in the chat";
contexts['g_chat']['message_length_limit'] = "The message is too long (max. length is 128 characters). Shorten it and try again.";
contexts['g_chat']['message_send_limit'] = "Too many messages at a time";
contexts['g_chat']['type_new_message'] = "Type first message";
contexts['g_chat']['username_admin'] = "Admin";
contexts['g_chat']['user_0'] = "Player";
contexts['g_chat']['added_to_bl'] = "added to blacklist";
contexts['g_chat']['delete_message'] = "Delete message";
contexts['g_chat']['message_deleted'] = "The message has been deleted";
contexts['g_chat']['message_delete_time_passed'] = "A message may only be deleted within first 5 minutes";
contexts['g_chat']['player_in_game'] = "in game";
contexts['g_chat']['already_banned'] = "already banned";
contexts['g_chat']['expand'] = "Popout chat";
contexts['g_chat']['hide'] = "Collapse the chat";
contexts['g_chat']['template_header'] = "Template messages";

contexts['g_pl'] = [];
contexts['g_pl']['msg_disconnected'] = "No server connection";
contexts['g_pl']['msg_reconnect'] = "Reconnect";
contexts['g_pl']['msg_second_window'] = "A second copy of the game is running";
contexts['g_pl']['no_players'] = "No players";
contexts['g_pl']['msg_player_not_found'] = "Player not found";
contexts['g_pl']['rating_rank'] = "rank";
contexts['g_pl']['username_guest'] = "Guest";
contexts['g_pl']['button_invite'] = "Invite";
contexts['g_pl']['button_cancel_invite'] = "Cancel";
contexts['g_pl']['rating_no_rank'] = "have no rank";
contexts['g_pl']['expand'] = "Popout player list";
contexts['g_pl']['hide'] = "Collapse the player list";
contexts['g_pl']['msg_invite_to_game'] = "invites to play a game";
contexts['g_pl']['msg_renju'] = "(renju)";
contexts['g_pl']['msg_game_saved'] = "The current game will be saved. You can resume it by loading from History.";
contexts['g_pl']['button_random_rival'] = "Play with a random opponent";
contexts['g_pl']['waiting_for_rival'] = "Waiting for opponent...";
contexts['g_pl']['invite_decline'] = "has  declined your invitation to play";
contexts['g_pl']['invite_waiting_limit'] = "has increased the waiting limit by";
contexts['g_pl']['already_invited'] = "has already been invited to the game by another user";
contexts['g_pl']['seconds'] = "seconds";

contexts['g_rating'] = [];
contexts['g_rating']['all_players'] = "all players";
contexts['g_rating']['online_players'] = "online";
contexts['g_rating']['admin_button'] = "admin";
contexts['g_rating']['profiles_button'] = "profiles";
contexts['g_rating']['rank'] = "Rank";
contexts['g_rating']['username'] = "Username";
contexts['g_rating']['elo'] = "Elo<br>rating";
contexts['g_rating']['games_win'] = "Won from his opponents";
contexts['g_rating']['games_win_percent'] = "%";
contexts['g_rating']['games_win_comp'] = "Won from the computer";
contexts['g_rating']['reg_date'] = "Reg.<br>date";
contexts['g_rating']['you'] = "You:";
contexts['g_rating']['your_rank'] = "rank";
contexts['g_rating']['search'] = "Search:";
contexts['g_rating']['scroll_to_top'] = "scroll to top";
contexts['g_rating']['close'] = "close";
contexts['g_rating']['newbie'] = "newbie";
contexts['g_rating']['title_sort_win_online'] = "Sort by the number of online games won";
contexts['g_rating']['title_sort_percent'] = "Sort by the percentage of wins";
contexts['g_rating']['title_sort_comp'] = "Sort by the number of games won from the computer";
contexts['g_rating']['title_sort_regdate'] = "Sort by registration date";
contexts['g_rating']['title_sort_elo'] = "Sort by Elo rating";
contexts['g_rating']['title_win'] = "won";
contexts['g_rating']['title_lose'] = "lose";
contexts['g_rating']['title_close_rating'] = "Close";
contexts['g_rating']['more_0'] = "More: ";
contexts['g_rating']['players_0'] = "players";
contexts['g_rating']['average_game_time'] = "Average game time:";
contexts['g_rating']['total_game_time'] = "Total game time:";
contexts['g_rating']['total_score'] = "Total score:";

// end