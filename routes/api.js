/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
const assert = require('assert');
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, (err, client) => {
        assert.equal(null, err);
        const booksCol = client.db('library').collection('books');
        booksCol.find({}).toArray((err, doc) => {
          assert.equal(null, err);
          let arrayOfBooks = [];
          for (var i = 0; i < doc.length; i++) {
            let commentcount = doc[i].comments.length;
            let obj = {
              _id: doc[i]._id,
              title: doc[i].title,
              commentcount: commentcount
            };
            arrayOfBooks.push(obj);
          }
          res.json(arrayOfBooks);
        });
        client.close();
      })
    })

    .post(function (req, res){
      var title = req.body.title;
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true}, (err, client) => {
        assert.equal(null, err);
        const booksCol = client.db('library').collection('books');
        booksCol.insertOne({title: title, comments: []}, (err, doc) => {
          // assert.equal(null, err);
          res.send({_id: doc.ops[0]._id, title: doc.ops[0].title});
        })
        client.close();
      })
      //response will contain new book object including atleast _id and title
    })

    .delete(function(req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, (err, client) => {
        assert.equal(null, err);
        const booksCol = client.db('library').collection('books');
        booksCol.deleteMany({}, (err, result) => {
          assert.equal(null, err);
          res.send('complete delete successful');
        });
        client.close();
      })
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, (err, client) => {
        assert.equal(null, err);
        const booksCol = client.db('library').collection('books');
        booksCol.findOne({_id: new ObjectId(bookid)}, (err, doc) => {
          if (doc === null) {
            res.send('no book exists');
          } else {
            res.json(doc);
          }
        });
        client.close();
      })
    })

    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, (err, client) => {
        assert.equal(null, err);
        const booksCol = client.db('library').collection('books');
        booksCol.findOneAndUpdate({_id: new ObjectId(bookid)}, {$push: {comments: comment}}, { returnOriginal: false }, (err, doc) => {
          assert.equal(null, err);
          res.json(doc.value);
        })
        client.close();
      })
      //json res format same as .get
    })

    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, (err, client) => {
        assert.equal(null, err);
        const booksCol = client.db('library').collection('books');
        booksCol.deleteOne({_id: new ObjectId(bookid)}, (err, result) => {
          assert.equal(null, err);
          res.send('delete successful');
        })
        client.close();
      })
    });

};
