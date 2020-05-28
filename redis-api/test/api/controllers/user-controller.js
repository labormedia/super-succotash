const test_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwiaXNzIjoiYXBwLmV4YW1wbGUiLCJyb2xlIjoidXNlciIsImlhdCI6MTU5MDIzODQ0Nn0.g8lgBHG6x7yd6VsEv7F3B53xbkKlivxkxQpmCn1NXms'

describe('controllers', function() {

  describe('main_controller', function() {

    describe('GET /api/v1/add/{role}', function() {

      it('should deny access when not authenticated', function(done) {

        request(server)
          .get('/api/v1/user/add')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(403)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.eql({
                message: '{"Error":"Access Denied","code":"server_error","statusCode":403}'
              });

            done();
          });
      });

      it('should accept a valid Bearer token', function(done) {

        request(server)
          .get('/api/v1/user/add')
          .set('Authorization', 'Bearer ' + test_token)
          .query({ id: '002'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.eql('Hello, 002!');

            done();
          });
      });

    });

  });

});