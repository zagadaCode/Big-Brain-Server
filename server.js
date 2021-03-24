const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'test',
      database : 'big-brain'
    }
  });

knex.select('*').from('users').then(data => {
    console.log(data);
});

const app = express();

const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0, // used to count amount of image uploads made
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ],
    login: [
        {
            id: '987',
            hash: '',
            email: 'john@gmail.com'
        }
    ]
}

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send(database.users);
})

app.post('/signin', (req, res) => {
    bcrypt.compare("apples", '$2a$10$uqzn8IQblcLs0bnf1w1jdenkyKrAJsU5A9YsChYODg0YWpmVphp2a', function(err, res) {
        console.log('first guess', res);
    });
    bcrypt.compare("veggies", '$2a$10$uqzn8IQblcLs0bnf1w1jdenkyKrAJsU5A9YsChYODg0YWpmVphp2a', function(err, res) {
        console.log('second guess', res);
    });
    if (req.body.email === database.users[0].email &&
        req.body.password === database.users[0].password) {
            res.json(database.users[0]);
        } else {
            res.status(400).json('error logging in');
        }
    res.json('signing in!');
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    knex('users')
        .returning('*')
        .insert({
            email: email,
            name: name,
            joined: new Date()
        }).then(user => {
            res.json(user[0]);
        })
        .catch(err => res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    knex.select('*').from('users').where({id})
        .then(user => {
            if (user.length) {
                res.json(user[0]);
            } else {
                res.status(400).json('Not found');
            }
    })
    .catch(err => res.status(400).json('Error getting user'))
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    let found = false;
    database.users.forEach(user => {
        if (user.id === id) {
            found = true;
            user.entries++;
            return res.json(user.entries);
        }
    })
    if (!found) {
        res.status(400).json('no such user exists');
    }
})

app.listen(3000, () => {
    console.log('app is running on port 3000');
});


/*
/ --> res = this is working
/signin --> POST = success/fail
/register --> POST = user object
/profile/:userId --> GET = user
/image --> PUT --> user

*/