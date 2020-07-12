const app = require('../app');
const request = require('supertest')(app);
const should = require('should');
const jwt = require('../src/utils/JWT');

describe('Auth Controller', () => {
  describe('POST /login', () => {
    it('should fail to login', (done) => {
      request.post('/login')
      .expect(400)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('To generate a token, a professional must be sent\n');

        done();
      });
    });

    it('should invalid login', (done) => {
      request.post('/login')
      .send({ professional: 100 })
      .expect(403)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('Invalid professional\n');

        done();
      });
    });

    before(() => {
      return request.post('/professionals')
      .send({ professional: { firstName: 'Corey', lastName: 'Taylor' } })
      .expect(201)
      .expect('Content-Type', /json/);
    });

    it('return a token', (done) => {
      request.post('/login')
      .send({ professional: 1 })
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.token);

        jwt.verify(res.body.token, (err, token) => {
          if(err) { return done(err); }

          should.exist(token.professional.id);
          should(token.professional.id).be.equal(1);
        });

        done();
      });
    });
  });
});
