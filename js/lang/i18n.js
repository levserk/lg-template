function I18n() {
    var that = this;

    var translation = null;

    this.setContext = function (context) {
        translation = contexts[context];
    }

    this.get = function (id, variation) {
        if (translation) {
            if (isDef(translation[id])) {
                if (isDef(variation)) {
                    return translation[id][variation];
                } else {
                    return translation[id];
                }
            }
            if (isDef(contexts["shared"][id])) {
                if (isDef(variation)) {
                    return contexts["shared"][id][variation];
                } else {
                    return contexts["shared"][id];
                }
            }
        } else {
            return "";
        }
    }

    this.format = function (id) {
        var template = that.get(id);

        var result = "";

        var state = 0;

        var buffer = "";

        for (var i = 0; i < template.length; i++) {
            var c = template.charAt(i);

            if (c == '{' && state == 0) {
                state = 1;
            } else if (c == '{' && state == 1) {
                state = 2;
            } else if (c != '{' && c != '}' && state == 2) {
                buffer += c;
            } else if (c == '}' && state == 2) {
                result += arguments[parseInt(buffer) + 1];
                state = 1;
                buffer = "";
            } else if (c == '}' && state == 1) {
                state = 0;
            } else {
                result += c;
            }
        }

        return result;
    }

    this.transliterate = function (s) {
        if (!I18n.get("isLatin")) {
            return s;
        }

        var map = I18n.get("symbolMap");

        return s.replace("Гость", "Guest").split('').map(function (char) {
            return ifDef(map[char], char);
        }).join("");
    }

    this.getMonth = function (monthNumber) {
        return contexts["months"][monthNumber];
    }

    this.getMonthShort = function (monthNumber) {
        return contexts["monthsShort"][monthNumber];
    }

    this.getMonthBeta = function (monthNumber) {
        return contexts["monthsBeta"][monthNumber];
    }
}

I18n.get = function (id) {
    if (isDef(contexts["shared"][id])) {
        return contexts["shared"][id];
    } else {
        return "";
    }
}

I18n.contextGet = function (context, id) {
    if (isDef(contexts[context]) && isDef(contexts[context][id])) {
        return contexts[context][id];
    } else {
        return "";
    }
}

I18n.JANUARY = 1;
I18n.FEBRUARY = 2;
I18n.MARCH = 3;
I18n.APRIL = 4;
I18n.MAY = 5;
I18n.JUNE = 6;
I18n.JULY = 7;
I18n.AUGUST = 8;
I18n.SEPTEMBER = 9;
I18n.OCTOBER = 10;
I18n.NOVEMBER = 11;
I18n.DECEMBER = 12;