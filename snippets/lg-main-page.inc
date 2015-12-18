<?php
$lang = 'ru';
if (isset($_GET['lang'])) $lang = $_GET['lang'];
else if (isset($_COOKIE['lang'])) $lang = $_COOKIE['lang'];
$lang = strtolower($lang);
if ($lang != 'ru' && $lang != 'en') $lang = 'ru';
$locale = null;
require_once('sharedAPI/lang/Lang.' . $lang . '.php');

$isSU = false;
if (isset($_COOKIE['userId'])) {
    $userId = intval($_COOKIE['userId']);
    $isSU = $userId == 40 ||
        $userId == 49 ||
        $userId == 144 ||
        $userId == 19729 ||
        $userId == 18136 ||
        $userId == 448039 ||
        $userId == 708734 ||
        $userId == 1789464 ||
        $userId == 11620560 ||
        $userId == 55165;
    if ($userId == 8 || $userId == 448039) {
        ini_set("display_errors", "1");
        ini_set("display_startup_errors", "1");
        ini_set("html_errors", "1");
    }
}
echo '<!--' . $locale['titleBand']['title'][1] . '-->';

//__ REDIS
require_once($_SERVER['DOCUMENT_ROOT'] . "/lib/predis/src/Autoloader.php");
Predis\Autoloader::register();

class LogicGame
{
    public $imgCache = '1';
    public $games = array(
        'kosynka' => array(
            'title' => 'Косынка',
            'type' => 1,
            'gameVariationId' => 1,
            'gameVariationIdList' => array(1, 10),
            'link' => 'kosynka',
            'img' => 'kosynka.jpg',
            'new' => false
        ),
        'freecell' => array(
            'title' => 'Солитёр',
            'type' => 1,
            'gameVariationId' => 2,
            'link' => 'freecell',
            'img' => 'freecell.jpg',
            'new' => false
        ),
        'spider' => array(
            'title' => 'Паук',
            'type' => 1,
            'gameVariationId' => 4,
            'gameVariationIdList' => array(4, 5, 6),
            'link' => 'spider',
            'img' => 'spider.jpg',
            'new' => false
        ),
        'chess' => array(
            'title' => 'Шахматы',
            'type' => 2,
            'gameVariationId' => 3,
            'link' => 'chess',
            'img' => 'chess.jpg',
            'new' => true
        ),
        'sokoban' => array(
            'title' => 'Сокобан',
            'type' => 3,
            'gameVariationId' => 7,
            'link' => 'sokoban',
            'img' => 'sokoban.jpg',
            'new' => false
        ),
        'gomoku' => array(
            'title' => 'Крестики-нолики',
            'type' => 2,
            'gameVariationId' => 8,
            'link' => 'gomoku',
            'img' => 'gomoku.jpg',
            'new' => false
        ),
        'iq' => array(
            'title' => 'Тест IQ',
            'type' => 4,
            'gameVariationId' => 9,
            'link' => 'tests/IQ.php',
            'img' => 'tests.jpg',
            'new' => false
        ),
        'baker' => array(
            'title' => 'Дюжина пекаря',
            'type' => 1,
            'gameVariationId' => 11,
            'link' => 'baker',
            'img' => 'baker.jpg',
            'new' => false
        ),
        'sudoku' => array(
            'title' => 'Судоку',
            'type' => 3,
            'gameVariationId' => 12,
            'link' => 'sudoku',
            'img' => 'sudoku.jpg',
            'new' => false
        ),
        'skiff' => array(
            'title' => 'Лестница cкифов',
            'type' => 4,
            'gameVariationId' => 13,
            'link' => 'skiff',
            'img' => 'skiff.jpg',
            'new' => false
        ),
        'poker' => array(
            'title' => 'Покер',
            'type' => 2,
            'gameVariationId' => 14,
            'link' => 'poker',
            'img' => 'poker.jpg',
            'new' => false
        ),
        'speed' => array(
            'title' => 'Кто быстрее',
            'type' => 4,
            'gameVariationId' => 15,
            'link' => 'speed',
            'img' => 'speed.jpg',
            'new' => false
        ),
        'memory' => array(
            'title' => 'Тест на память',
            'type' => 4,
            'gameVariationId' => 16,
            'link' => 'memory',
            'img' => 'memory.jpg',
            'new' => false
        ),
        'checkers' => array(
            'title' => 'Шашки',
            'type' => 2,
            'gameVariationId' => 17,
            'link' => 'checkers',
            'img' => 'checkers.jpg',
            'new' => false
        ),
        'battleship' => array(
            'title' => 'Морской бой',
            'type' => 2,
            'gameVariationId' => 18,
            'link' => 'battleship',
            'img' => 'battleship.jpg',
            'new' => false
        ),
        'lines' => array(
            'title' => 'Шарики',
            'type' => 3,
            'gameVariationId' => 19,
            'link' => 'lines',
            'img' => 'lines.jpg',
            'new' => false
        ),
        'knb' => array(
            'title' => 'Камень, ножницы',
            'type' => 4,
            'gameVariationId' => 20,
            'link' => 'rsp',
            'img' => 'knb.jpg',
            'new' => false
        ),
        'othello' => array(
            'title' => 'Реверси',
            'type' => 2,
            'gameVariationId' => 21,
            'link' => 'othello',
            'img' => 'othello.jpg',
            'new' => false
        ),
        'tetris' => array(
            'title' => 'Тетрис',
            'type' => 3,
            'gameVariationId' => 22,
            'link' => 'tetris',
            'img' => 'tetris.jpg',
            'new' => false
        ),

        'match3' => array(
            'title' => 'Три в ряд',
            'type' => 3,
            'gameVariationId' => 23,
            'link' => 'match3',
            'img' => 'match3.jpg',
            'new' => false
        ),
        'arcanoid' => array(
            'title' => 'Арканоид',
            'type' => 4,
            'gameVariationId' => 24,
            'link' => 'arkanoid',
            'img' => 'arcanoid.jpg',
            'new' => false
        ),
        'dots' => array(
            'title' => 'Точки',
            'type' => 2,
            'gameVariationId' => 25,
            'link' => 'dots',
            'img' => 'dots.jpg',
            'new' => false
        ),
        'pyramid' => array(
            'title' => 'Пирамида',
            'type' => 1,
            'gameVariationId' => 27,
            'link' => 'pyramid',
            'img' => 'pyramid.jpg',
            'new' => false
        ),
        'fool' => array(
            'title' => 'Дурак',
            'type' => 2,
            'gameVariationId' => 28,
            'link' => 'fool',
            'img' => 'fool.jpg',
            'new' => false
        ),
        'snake' => array(
            'title' => 'Змейка',
            'type' => 4,
            'gameVariationId' => 29,
            'link' => 'snake',
            'img' => 'snake.jpg',
            'new' => false
        ),
        'balda' => array(
            'title' => 'Балда',
            'type' => 2,
            'gameVariationId' => 30,
            'link' => 'balda',
            'img' => 'balda.jpg',
            'new' => false
        ),
        'minesweeper' => array(
            'title' => 'Сапер',
            'type' => 2,
            'gameVariationId' => 31,
            'link' => 'minesweeper',
            'img' => 'minesweeper.jpg',
            'new' => false
        ),
        'nim' => array(
            'title' => 'Ним',
            'type' => 4,
            'gameVariationId' => 32,
            'link' => 'nim',
            'img' => 'nim.jpg',
            'new' => false
        ),
        'pacman' => array(
            'title' => 'Пакман',
            'type' => 4,
            'gameVariationId' => 33,
            'link' => 'pacman',
            'img' => 'pacman.jpg',
            'new' => false
        ),
        'mat' => array(
            'title' => 'Коврик',
            'type' => 1,
            'gameVariationId' => 34,
            'link' => 'mat',
            'img' => 'mat.jpg',
            'new' => false
        ),
        'tripeaks' => array(
            'title' => 'Три пика',
            'type' => 1,
            'gameVariationId' => 35,
            'link' => 'tripeaks',
            'img' => 'tripeaks.jpg',
            'new' => false
        ),
        'math_test' => array(
            'title' => 'ЕГЭ по математике',
            'type' => 4,
            'gameVariationId' => 36,
            'link' => 'math_test/tests/math',
            'img' => 'ege.jpg',
            'new' => false
        ),
        'scorpion' => array(
            'title' => 'Скорпион',
            'type' => 1,
            'gameVariationId' => 37,
            'link' => 'scorpion',
            'img' => 'scorpion.jpg',
            'new' => true
        ),
        'fillword' => array(
            'title' => 'Fillword',
            'type' => 1,
            'gameVariationId' => 38,
            'link' => 'scorpion',
            'img' => 'scorpion.jpg',
            'new' => true
        ),
        'pdd' => array(
            'title' => 'Pdd',
            'type' => 4,
            'gameVariationId' => 39,
            'link' => 'math_test/tests/pdd',
            'img' => 'pdd.jpg',
            'new' => true
        )
    );
    public $client = null;

    public function __construct($client, $locale)
    {
        $this->client = $client;

        foreach ($this->games as &$game) {
            $game['title'] = $locale['titleBand']['title'][$game['gameVariationId']];
        }
    }

    public function getOnlineCount($game)
    {
        $val = null;
        if ($game['gameVariationId'] == 1) {
            $val = $this->client->get('logic:guestCount:' . '1') + $this->client->get('logic:loggedCount:' . '1') +
                $this->client->get('logic:guestCount:' . '10') + $this->client->get('logic:loggedCount:' . '10');

        } else if ($game['gameVariationId'] == 4) {
            $val = $this->client->get('logic:guestCount:' . '4') + $this->client->get('logic:loggedCount:' . '4') +
                $this->client->get('logic:guestCount:' . '5') + $this->client->get('logic:loggedCount:' . '5') +
                $this->client->get('logic:guestCount:' . '6') + $this->client->get('logic:loggedCount:' . '6');
        } else {
            $val = $this->client->get('logic:guestCount:' . $game['gameVariationId']) +
                $this->client->get('logic:loggedCount:' . $game['gameVariationId']);
        }
        if ($val == null) $val = 0;
        return $val;
    }

    public function getGameIcon($name)
    {
        $game = $this->games[$name];
        $title = $game['title'];
        $online = $this->getOnlineCount($game);
        $link = $game['link'];
        $img = 'img/games/site/' . $game['img'];
        $new = $game['new'] ? '<span class="newGame">NEW</span>' : '';
        $online = $this->getOnlineCount($game);
        return "<div class='game'><a href='$link'><span class='gameTitle'> <span>$title</span><span class='onlineCount'>($online)</span> </span> </a>" .
        "<div><a href='$link'>$new <img src='$img?v=$this->imgCache'></a></div></div>";
    }

    public function getGameTypes()
    {
        $arr = "";
        foreach ($this->games as $game) {
            if ($arr != "") $arr = $arr . ', ';
            $arr = $arr . '"' . str_replace(' ', '', mb_convert_case($game['title'], MB_CASE_LOWER, "UTF-8")) . '":' . $game['type'];
        }

        return $arr;
    }
}

require_once($_SERVER['DOCUMENT_ROOT'] . "/redis_connect.php");
$logic = new LogicGame(new Predis\Client($redis_url), $locale);
$gameTypes = $logic->getGameTypes();
?>