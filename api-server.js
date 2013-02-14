// App Config
var application_root = __dirname,
  express = require('express'),
  path = require('path'),
  mongoose = require('mongoose');

var app = express();

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://tadbit.michgarbacz.com');
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
var mongoUri = process.env.MONGOLAB_URI || 
  'mongodb://localhost/tadbit_database';
mongoose.connect(mongoUri);

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

// Update Tags via MapReduce
var options = {};

options.map = function() {
  if (!this.tags)
    return;

  for (index in this.tags)
    emit(this.tags[index], 1);
}

options.reduce = function(previous, current) {
  var count = 0;

  for (index in current)
    count += current[index]

  return count;
}

options.out = "tags";

mapReduce = function() {
  CardModel.mapReduce(options, function(error, results) {
    if (error !== null) console.log(error);
  });
}

// API spec
// tags
app.get('/tags', function(req, res) {
  console.log('GET tags all');
  mapReduce();
  return TagModel.find().sort('-value').exec(function(error, tags) {
    if (!error) {
      console.log('Tags read successfully');
      return res.send(tags);
    } else {
      return console.log(error);
    }
  });
});

app.post('/tags', function(req, res) {
  console.log('POST tag new');
  console.log(req.body);
  var tag = new TagModel({
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
  console.log('GET cards all');
  return CardModel.find(function(error, cards) {
    if (!error) {
      console.log('Cards read successfully');
      return res.send(cards);
    } else {
      return console.log(error);
    }
  });
});

app.post('/cards', function(req, res) {
  console.log('POST card new ');
  console.log(req.body);
  var card = new CardModel({
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
  console.log('GET card '+ req.params.id);
  return CardModel.findById(req.params.id, function(error, card) {
    if (!error) {
      console.log('Card read successfully');
      return res.send(card);
    } else {
      return console.log(error);
    }
  });
});

app.put('/cards/:id', function(req, res) {
  console.log('PUT card ' + req.params.id);
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
  console.log('DELETE card ' + req.params.id);
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
  console.log('GET cards ' + req.params.tags);
  return CardModel
    .find().where('tags').in([req.params.tags]).exec(function(error, card) {
    if (!error) {
      console.log('Cards read successfully');
      return res.send(card);
    } else {
      return console.log(error);
    }
  });
});

var port = process.env.PORT || 8124;
app.listen(port, function() {
  console.log('Listening on ' + port);
});

