console.log('loading', _gameVariationId, _userId, _username);

LogicGame.init(onInit);

function onInit(){
    console.log("init");
    console.log(controller.cs.isSuperUser());
    console.log(LogicGame.isSuperUser());
}

