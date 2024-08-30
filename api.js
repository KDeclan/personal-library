'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = function (app, db) {

  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await db.collection('books').find().toArray();
        const response = books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length,
        }));
        res.json(response);
      } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json('Internal Server Error');
      }
    })
    
    .post(async function (req, res) {
      const title = req.body.title;
      if (!title) {
        return res.json("missing required field title");
      }

      const newBook = {
        _id: uuidv4(),
        title: title,
        comments: [],
      };

      try {
        await db.collection('books').insertOne(newBook);
        res.json(newBook);
      } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json('Internal Server Error');
      }
    })
    
    .delete(async function (req, res) {
      try {
        await db.collection('books').deleteMany({});
        res.json('complete delete successful');
      } catch (error) {
        console.error('Error deleting books:', error);
        res.status(500).json('Internal Server Error');
      }
    });


  app.route('/api/books/:id')
    .get(async function (req, res) {
      const bookid = req.params.id;
      try {
        const book = await db.collection('books').findOne({ _id: bookid });
        if (book) {
          res.json({
            _id: book._id,
            title: book.title,
            comments: book.comments
          });
        } else {
          res.json('no book exists');
        }
      } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json('Internal Server Error');
      }
    })
    
    .post(async function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
    
      if (!comment) {
        return res.json('missing required field comment');
      }
    
      try {
        // Find the book using the string ID
        const book = await db.collection('books').findOne({ _id: bookid });
        if (!book) {
          return res.json('no book exists');
        }
    
        // Manually add the comment to the book's comments array
        book.comments.push(comment);
    
        // Update the book in the database
        const updateResult = await db.collection('books').updateOne(
          { _id: bookid },
          { $set: { comments: book.comments } }
        );
    
        // Check if the update was successful
        if (updateResult.modifiedCount === 0) {
          return res.json('no book exists');
        }
    
        // Return the updated book object
        return res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
    
      } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json('Internal Server Error');
      }
    })
    
    .delete(async function (req, res) {
      const bookid = req.params.id;
      try {
        const result = await db.collection('books').deleteOne({ _id: bookid });
        if (result.deletedCount === 1) {
          res.json('delete successful');
        } else {
          res.json('no book exists');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json('Internal Server Error');
      }
    });
};
