// App Config
var application_root = __dirname,
    express = require('express'),
    path = require('path'),
    mongoose = require('mongoose');

var app = express.createServer();

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(application_root, 'public')));
    app.use(express.errorHandler({dumpException: 'true', 
                                  showStack: 'true'}));
});

// Database
mongoose.connect('mongodb://localhost/tadbit_database');

var Schema = mongoose.Schema;

var Tag = new Schema({
    name: String
});

var Card = new Schema({
    question: String,
    answer: String,
    tags: [Tag]
});

var TagModel = mongoose.model('Tag', Tag);
var CardModel = mongoose.model('Card', Card);

// API spec
app.get('/tags', function(request, response) {
    return TagModel.find(function(error, tags) {
        if (!error) {
            return response.send(tags);
        } else {
            return console.log(error);
        }
    });
});

app.post('/tags', function(request, response) {
    var tag;
    console.log('POST: ');
    console.log(request.body);
    tag = new TagModel({
        name: request.body.name
    });
    tag.save(function(error) {
        if (!error) {
            console.log('Tag created successfully');
        } else {
            return console.log(error);
        }
    });
    return response.send(tag);
});

app.get('/cards', function(request, response) {
    return CardModel.find(function(error, cards) {
        if (!error) {
            return response.send(cards);
        } else {
            return console.log(error);
        }
    });
});

app.post('/cards', function(request, response) {
    var card;
    console.log('POST: ');
    console.log(request.body);
    card = new CardModel({
        question: request.body.question,
        answer: request.body.answer,
        tags: request.body.tags
    });
    card.save(function(error) {
        if (!error) {
            console.log('Card created successfully');
        } else {
            return console.log(error);
        }
    });
    return response.send(card);
});

app.get('/cards/:id', function(request, response, next) {
    return CardModel.findById(request.params.id, function(error, card) {
        if (!error) {
            return response.send(card);
        } else {
            return console.log(error);
        }
    });
});

app.put('/cards/:id', function(request, response) {
    return CardModel.findById(request.params.id, function(error, card) {
        card.question = request.body.question,
        card.answer = request.body.answer,
        card.tags = request.body.tags
        return card.save(function(error) {
            if (!error) {
                console.log('Card updated successfully');
                return response.send('');
            } else {
                return console.log(error);
            }
        });
    });
});

app.delete('/cards/:id', function(request, response) {
    return CardModel.findById(request.params.id, function(error, card) {
        return card.remove(function(error) {
            if (!error) {
                console.log('Card removed successfully');
            } else {
                return console.log(error);
            }
        });
    });
});

app.listen(8124);

console.log('Server running at http://127.0.0.1:8124/');
