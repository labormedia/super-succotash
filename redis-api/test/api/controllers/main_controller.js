var should = require('should');
var request = require('supertest');
var server = require('../../../app');

const test_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwiaXNzIjoiYXBwLmV4YW1wbGUiLCJyb2xlIjoidXNlciIsImlhdCI6MTU5MDIzODQ0Nn0.g8lgBHG6x7yd6VsEv7F3B53xbkKlivxkxQpmCn1NXms'

describe('controllers', function() {

  describe('main_controller', function() {

    describe('GET /api/v1/ping', function() {

      it('should accept a valid Bearer token', function(done) {

        request(server)
          .get('/api/v1/ping')
          .set('Authorization', "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwiaXNzIjoiYXBwLmV4YW1wbGUiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1OTA0NzQwNzZ9.eiGkVWORSlGbUGLqgFPMnNk1ldMunkS2x437rlyJ3XI")
          .query({ id: '002'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.eql('{"message":"0.0973669094358447"}');

            done();
          });
      });

    });

  });

});