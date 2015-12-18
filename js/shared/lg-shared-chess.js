function formatDateRu2(time) {
    var formattedDate = formatDateRu(time);
    var formattedNow = formatDateRu(nowTS());

    if (formattedDate == formattedNow) {
        return "сегодня";
    } else {
        return formattedDate;
    }
}