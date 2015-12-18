var fs = require('fs');
console.log('creating app folder');
fs.mkdir('../../app', function(err){
    fs.readFile('app/index.php', function(err, data){
        if (err){
            console.log('error!');
            console.log(err);
        }else {
            fs.writeFile('../../app/index.php', data, function(err){
                if (err) {
                    console.log('error!');
                    console.log(err);
                } else {
                    fs.lstat('../../app/snippets', function(err, stat){
                        if (!stat.isDirectory())fs.mkdir('../../app/snippets');
                    });
                    console.log('done!');
                }
            });
        }
    });
});
