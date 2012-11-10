// App Config
var application_root = __dirname,
  express = require('express'),
  path = require('path'),
  mongoose = require('mongoose');

var app = express();

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(allowCrossDomain);
  app.use(app.router);
  app.use(express.static(path.join(application_root, 'public')));
  app.use(express.errorHandler({ dumpException: 'true', showStack: 'true' }));
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
  tags: [String]
});

var TagModel = mongoose.model('Tag', Tag);
var CardModel = mongoose.model('Card', Card);

// API spec
// tags
app.get('/tags', function(req, res) {
  return TagModel.find().desc('value').exec(function(error, tags) {
    if (!error) {
      return res.send(tags);
    } else {
      return console.log(error);
    }
  });
});

app.post('/tags', function(req, res) {
  var tag;
  console.log('POST: ');
  console.log(req.body);
  tag = new TagModel({
    _id: req.body._id
  });
  tag.save(function(error) {
    if (!error) {
      console.log('Tag created successfully');
    } else {
      return console.log(error);
    }
  });
  return res.send(tag);
});

// cards
app.get('/cards', function(req, res) {
  return CardModel.find(function(error, cards) {
    if (!error) {
      return res.send(cards);
    } else {
      return console.log(error);
    }
  });
});

app.post('/cards', function(req, res) {
  var card;
  console.log('POST: ');
  console.log(req.body);
  card = new CardModel({
    question: req.body.question,
    answer: req.body.answer,
    difficulty: req.body.difficulty,
    tags: req.body.tags
  });
  card.save(function(error) {
    if (!error) {
      console.log('Card created successfully');
    } else {
      return console.log(error);
    }
  });
  return res.send(card);
});

// cards by id
app.get('/cards/:id', function(req, res, next) {
  return CardModel.findById(req.params.id, function(error, card) {
    if (!error) {
      return res.send(card);
    } else {
      return console.log(error);
    }
  });
});

app.put('/cards/:id', function(req, res) {
  return CardModel.findById(req.params.id, function(error, card) {
    card.question = req.body.question;
    card.answer = req.body.answer;
    card.difficulty = req.body.difficulty;
    card.tags = req.body.tags;
    return card.save(function(error) {
      if (!error) {
        console.log('Card updated successfully');
        return res.send('');
      } else {
        return console.log(error);
      }
    });
  });
});

app.delete('/cards/:id', function(req, res) {
  return CardModel.findById(req.params.id, function(error, card) {
    return card.remove(function(error) {
      if (!error) {
        console.log('Card removed successfully');
        return res.send('');
      } else {
        return console.log(error);
      }
    });
  });
});

// cards by tags
app.get('/cards/:tags', function(req, res, next) {
  return CardModel.find().where('tags').in([req.params.tags])
                  .exec(function(error, card) {
    if (!error) {
      return res.send(card);
    } else {
      return console.log(error);
    }
  });
});

app.listen(8124);

console.log('Server running at http://127.0.0.1:8124/');
