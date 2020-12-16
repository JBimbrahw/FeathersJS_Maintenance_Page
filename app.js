const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

// A usernames service that allows to create new
// and return all existing usernames
class usernameService {
  constructor() {
    this.usernames = []
    this.path = ""
  }

  async find () {
    // Just return all our usernames
    return this.usernames;
  }

  async create (data) {
    console.log("calling create")

    // The new username is the data merged with a unique identifier
    // using the usernames length since it changes whenever we add one
    const username = {
      id: this.usernames.length,
      text: data.text
    }

    // Add new username to the list
    this.usernames.push(username);

    return username;
  }

  async remove (id) {
    // remove a user from the list
    for(let i = 0; i < this.usernames.length; i++)
    {
      if(this.usernames[i].id == id) {
        this.usernames.splice(i,1)

        //and now on the client side, remove the user

        return true
      }
    }
    return false
  }

  async update (id, data) {
    this.path = (data.path)


  }


}

// Creates an ExpressJS compatible Feathers application
const app = express(feathers());

// Parse HTTP JSON bodies
app.use(express.json());
// Parse URL-encoded params
app.use(express.urlencoded({ extended: true }));
// Host static files from the current folder
app.use(express.static(__dirname));
// Add REST API support
app.configure(express.rest());
// Configure Socket.io real-time APIs
app.configure(socketio());
// Register an in-memory usernames service
app.use('/usernames', new usernameService());
// Register a nicer error handler than the default Express one
app.use(express.errorHandler());

// Add any new real-time connection to the `everybody` channel
app.on('connection', connection =>
  app.channel('everybody').join(connection)
);
// Publish all events to the `everybody` channel
app.publish(data => app.channel('everybody'));

// Start the server
app.listen(3030).on('listening', () =>
  console.log('Feathers server listening on localhost:3030')
);

// For good measure let's create a username
// So our API doesn't look so empty
// app.service('usernames').create({
//   text: 'Hello world from the server'
// });
