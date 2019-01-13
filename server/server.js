var express = require('express');
var bodyParser = require('body-parser');
var { ObjectID } = require('mongodb');
var _ = require('lodash');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then(
        doc => {
            res.send(doc);
        },
        err => {
            res.status(400).send(err);
        }
    );
});

app.get('/todos', (req, res) => {
    Todo.find().then(
        todos => {
            res.send({ todos });
        },
        err => {
            res.status(400).send(err);
        }
    );
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id).then(
        todo => {
            if (!todo) {
                return res.status(404).send();
            }

            return res.send({ todo });
        },
        err => {
            return res.status(400).send(err);
        }
    );
});

app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findByIdAndDelete(id).then(
        todo => {
            if (!todo) {
                return res.status(404).send();
            }

            res.send(todo);
        },
        err => {
            res.status(400).send(err);
        }
    );
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    var body = _.pick(req.body, ['text', 'completed']);

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
        .then(todo => {
            if (!todo) {
                return res.status(404).send();
            }

            res.send(todo);
        })
        .catch(err => {
            res.status(400).send();
        });
});

app.listen(port, () => {
    console.log(`App listening on ${port}`);
});
