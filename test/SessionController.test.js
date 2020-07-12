const app = require('../app');
const request = require('supertest')(app);
const should = require('should');
const moment = require('moment');
const jwt = require('../src/utils/JWT');

describe('Session Controller', () => {
  describe('POST /sessions', () => {
    let authorization;
    let invalidToken = jwt.sign({ token: 'invalid-token' });
    let invalidProfessional = jwt.sign({ professional: { id: 500 } });

    it('should fail without Authentication', (done) => {
      request.post('/sessions')
      .expect(401)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('Authorization credentials not informed\n');

        done();
      });
    });

    it('should fail with invalid format', (done) => {
      request.post('/sessions')
      .set('Authorization', 'Bearer ')
      .expect(400)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('Invalid authorization format\n');

        done();
      });
    });

    it('should fail with invalid token', (done) => {
      request.post('/sessions')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('Invalid token\n');

        done();
      });
    });

    it('should fail with invalid professional', (done) => {
      request.post('/sessions')
      .set('Authorization', `Bearer ${invalidProfessional}`)
      .expect(401)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('Professional not found\n');

        done();
      });
    });

    before((done) => {
      request.post('/login')
      .send({ professional: 1 })
      .expect(200)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.token);
        authorization = `Bearer ${res.body.token}`;

        done();
      });
    });

    it('should fail without start time', (done) => {
      request.post('/sessions')
      .set('Authorization', authorization)
      .send({ })
      .expect(400)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('The start for the interval must be sent\n');
        should.not.exist(res.body.sessions);

        done();
      });
    });

    it('should fail without end time', (done) => {
      request.post('/sessions')
      .set('Authorization', authorization)
      .send({ start: '2020-07-12 17:00:00' })
      .expect(400)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('The end for the interval must be sent\n');
        should.not.exist(res.body.sessions);

        done();
      });
    });

    it('should fail when end it is before start ', (done) => {
      request.post('/sessions')
      .set('Authorization', authorization)
      .send({ start: '2020-07-12 17:00:00', end: '2020-07-12 16:45:00' })
      .expect(400)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('The end of the interval must be after the start\n');
        should.not.exist(res.body.sessions);

        done();
      });
    });

    it('should fail when inteval is less than 1 hour', (done) => {
      request.post('/sessions')
      .set('Authorization', authorization)
      .send({ start: '2020-07-12 17:00:00', end: '2020-07-12 17:45:00' })
      .expect(400)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('The interval must be at least 1 hour\n');
        should.not.exist(res.body.sessions);

        done();
      });
    });

    it('return list of created sessions', (done) => {
      let start = '2020-07-12 08:00:00';
      let end = '2020-07-12 09:45:00';

      request.post('/sessions')
      .set('Authorization', authorization)
      .send({ start, end })
      .expect(201)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.sessions);

        let { sessions } = res.body;
        should(sessions.length).be.equal(3);

        start = moment(start);

        sessions.forEach((session) => {
          should(session.start).be.equal(start.toISOString());
          should(session.end).be.equal(start.add(30, 'minutes').toISOString());
        });

        done();
      });
    });

    it('should fail when overriding existing sessions', (done) => {
      request.post('/sessions')
      .set('Authorization', authorization)
      .send({ start: '2020-07-12 08:30:00', end: '2020-07-12 10:30:00' })
      .expect(400)
      .end((err, res) => {
        if(err) { return done(err); }

        should.not.exist(res.body.sessions);
        should(res.text).be.equal('There are sessions in this interval. Available from 09h30\n');

        done();
      });
    });
  });
});
