// App Config
var application_root = __dirname,
    express = require('express'),
    path = require('path'),
    mongoose = require('mongoose');

var app = express();

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(application_root, 'public')));
    app.use(express.errorHandler(
        { dumpException: 'true', showStack: 'true' }));
});

// Database
mongoose.connect('mongodb://localhost/tadbit_database');

var Schema = mongoose.Schema;

var Tag = new Schema({
    _id: String,
    value: { type: Number, default: 0 }
});

var Card = new Schema({
    question: String,
    answer: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    tags: [Tag]
});

var TagModel = mongoose.model('Tag', Tag);
var CardModel = mongoose.model('Card', Card);

// API spec
// tags
app.get('/tags', function(request, response) {
    return TagModel.find().desc('value').exec(function(error, tags) {
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
        _id: request.body._id
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

// cards
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
        difficulty: request.body.difficulty,
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

// cards by id
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
        card.question = request.body.question;
        card.answer = request.body.answer;
        card.difficulty = request.body.difficulty;
        card.tags = request.body.tags;
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

// cards by tags
app.get('/cards/:tags', function(request, response, next) {
    return CardModel.find().where('tags').in([request.params.tags])
                    .exec(function(error, card) {
        if (!error) {
            return response.send(card);
        } else {
            return console.log(error);
        }
    });
});

app.listen(8124);

console.log('Server running at http://127.0.0.1:8124/');
