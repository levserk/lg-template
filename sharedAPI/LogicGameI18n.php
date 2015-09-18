<?php

//require_once($_SERVER['DOCUMENT_ROOT'] . "/sharedAPI/LogicGameAPI.php");

class LogicGameI18n
{
    public $locale;
    private $gameVariationId;

    public function __construct($locale, $gameVariationId)
    {
        $this->locale = $locale;
        $this->gameVariationId = $gameVariationId;
    }

    public function get($context, $alias, $index = null)
    {
        if (!is_array($this->locale[$context][$alias])) {
            return $this->locale[$context][$alias];
        } else {
            return $this->locale[$context][$alias][$this->gameVariationId];
        }
    }

    public function format($context, $alias)
    {
        $template = $this->get($context, $alias);

        $result = "";

        $state = 0;

        $buffer = "";

        for ($i = 0; $i < strlen($template); $i++) {
            $c = $template[$i];

            if ($c == '{' && $state == 0) {
                $state = 1;
            } else if ($c == '{' && $state == 1) {
                $state = 2;
            } else if ($c != '{' && $c != '}' && $state == 2) {
                $buffer += $c;
            } else if ($c == '}' && $state == 2) {
                $result .= func_get_arg(intval($buffer) + 2);
                $state = 1;
                $buffer = "";
            } else if ($c == '}' && $state == 1) {
                $state = 0;
            } else {
                $result .= $c;
            }
        }

        return $result;
    }
}