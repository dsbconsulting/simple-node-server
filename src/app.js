var express = require('express');
var path = require('path');

var app = express();

app.configure(function(){
    app.use(express.bodyParser());
    app.listen(3000);
});

app.get('/test', function(req, res) {
    res.status(200).send('Awesome!');
});

app.use("/public", express.static(path.join(__dirname, 'public')));

require('./routes/asperaNodeAPI')(app);

require('./routes/asperaTester')(app);
require('./routes/userManager')(app);