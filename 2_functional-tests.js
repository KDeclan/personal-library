const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        const bookTitle = 'A New Book Title';

        chai.request(server)
          .post('/api/books')
          .send({ title: bookTitle })
          .end(function(err, res) {
            if (err) {
              return done(err);
            }

            assert.equal(res.status, 200, 'Response status should be 200');
            assert.isObject(res.body, 'Response should be an object');
            assert.property(res.body, '_id', 'Book object should contain _id');
            assert.property(res.body, 'title', 'Book object should contain title');
            assert.equal(res.body.title, bookTitle, 'Book title should match the input');
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: '' }) 
          .end(function(err, res) {
            if (err) {
              return done(err);
            }

            assert.equal(res.status, 200, 'Response status should be 200');
            assert.equal(res.body, 'missing required field title', 'Response should indicate missing title');
            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books', function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            if (res.body.length > 0) {
              assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
              assert.property(res.body[0], 'title', 'Books in array should contain title');
              assert.property(res.body[0], '_id', 'Books in array should contain _id');
            }
            done();
          });
      });
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db', function(done){
        chai.request(server)
          .get('/api/books/invalidid')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists', 'Response should indicate no book exists');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db', function(done){
        const bookTitle = 'Book to Get';
        chai.request(server)
          .post('/api/books')
          .send({ title: bookTitle })
          .end(function(err, res) {
            if (err) return done(err);
            const bookId = res.body._id;
            
            chai.request(server)
              .get(`/api/books/${bookId}`)
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.isObject(res.body, 'response should be an object');
                assert.property(res.body, 'comments', 'Book object should contain comments');
                assert.property(res.body, 'title', 'Book object should contain title');
                assert.property(res.body, '_id', 'Book object should contain _id');
                done();
              });
          });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        const bookTitle = 'Book to Comment';
        chai.request(server)
          .post('/api/books')
          .send({ title: bookTitle })
          .end(function(err, res) {
            if (err) return done(err);
            const bookId = res.body._id;
            
            chai.request(server)
              .post(`/api/books/${bookId}`)
              .send({ comment: 'This is a comment' })
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.property(res.body, 'comments', 'Book object should contain comments');
                assert.property(res.body, 'title', 'Book object should contain title');
                assert.property(res.body, '_id', 'Book object should contain _id');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        const bookTitle = 'Book to Comment Without Comment';
        chai.request(server)
          .post('/api/books')
          .send({ title: bookTitle })
          .end(function(err, res) {
            if (err) return done(err);
            const bookId = res.body._id;
            
            chai.request(server)
              .post(`/api/books/${bookId}`)
              .send({ comment: '' })
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body, 'missing required field comment', 'Response should indicate missing comment');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .post('/api/books/invalidid')
          .send({ comment: 'This is a comment' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isString(res.body, 'response should be a string');
            assert.equal(res.body, 'no book exists', 'Response should indicate no book exists');
            done();
          });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        const bookTitle = 'Book to Delete';
        chai.request(server)
          .post('/api/books')
          .send({ title: bookTitle })
          .end(function(err, res) {
            if (err) return done(err);
            const bookId = res.body._id;
            
            chai.request(server)
              .delete(`/api/books/${bookId}`)
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body, 'delete successful', 'Response should indicate delete successful');
                done();
              });
          });
      });

      test('Test DELETE /api/books/[id] with id not in db', function(done){
        chai.request(server)
          .delete('/api/books/invalidid')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists', 'Response should indicate no book exists');
            done();
          });
      });

    });

  });
});
