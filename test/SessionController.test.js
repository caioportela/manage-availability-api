const app = require('../app');
const request = require('supertest')(app);
const should = require('should');
const moment = require('moment');
const jwt = require('../src/utils/JWT');

describe('Session Controller', () => {
  let authorization;

  describe('POST /sessions', () => {
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
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.sessions);

        let { sessions } = res.body;
        should(sessions.length).be.equal(3);

        start = moment(start);

        sessions.forEach((session) => {
          should(session.start).be.equal(start.toISOString());
          should(session.end).be.equal(start.add(30, 'minutes').toISOString());

          let duration = moment(session.end).diff(moment(session.start), 'minutes');
          should(duration).be.equal(30);
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

  describe('DELETE /sessions/:id', () => {
    let otherPro;

    it('should fail without Authorization', (done) => {
      request.delete('/sessions/3')
      .expect(401)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('Authorization credentials not informed\n');

        done();
      });
    });

    it('return 204 after delete', (done) => {
      request.delete(`/sessions/1`)
      .set('Authorization', authorization)
      .expect(204)
      .end((err, res) => {
        if(err) { return done(err); }

        let body = Object.keys(res.body);
        should(body.length).be.equal(0);

        done();
      });
    });

    before((done) => {
      request.post('/login')
      .send({ professional: 3 })
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.token);
        otherPro = `Bearer ${res.body.token}`;

        done();
      });
    });

    it('should fail if from another professional', (done) => {
      request.delete('/sessions/3')
      .set('Authorization', otherPro)
      .expect(403)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('You cannot remove sessions from others\n');

        done();
      });
    });
  });

  describe('GET /sessions', () => {
    it('return list of sessions', (done) => {
      request.get('/sessions')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.sessions);
        should(res.body.sessions).be.Array();

        done();
      });
    });

    it('return max of 2 sessions', (done) => {
      request.get('/sessions?limit=2&skip=2')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.sessions);

        let { sessions } = res.body;

        should(sessions).be.Array();
        should(sessions.length).be.belowOrEqual(2);

        done();
      });
    });

    it('return list of all slots in a range of time', (done) => {
      request.get('/sessions?start=2020-07-15 08:00:00&end=2020-07-15 11:00:00')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.sessions);

        let { sessions } = res.body;

        should(sessions).be.Array();

        sessions.forEach((session) => {
          let start = moment(session.start);
          let end = moment(session.end);

          should(start.isSameOrAfter('2020-07-15 08:00:00')).be.true();
          should(end.isSameOrBefore('2020-07-15 11:00:00')).be.true();
        });

        done();
      });
    });
  });

  describe('GET /sessions/:id', () => {
    it('should fail if not find a session', (done) => {
      request.get('/sessions/1000')
      .expect(404)
      .end((err, res) => {
        if(err) { return done(err); }

        should.not.exist(res.body.session);
        should(res.text).be.equal('Session not found\n');

        done();
      });
    });

    it('return a session', (done) => {
      request.get('/sessions/3')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.session);
        let { start, end } = res.body.session;

        let duration = moment(end).diff(moment(start), 'minutes');
        should(duration).be.equal(30);

        done();
      });
    });
  });

  describe('GET /sessions/available', () => {
    before(() => {
      let sessions = [
        { start: '2020-07-13 13:00:00', end: '2020-07-13 18:00:00' },
        { start: '2020-07-15 08:00:00', end: '2020-07-15 11:30:00' },
        { start: '2020-07-15 14:00:00', end: '2020-07-15 17:00:00' },
        { start: '2020-07-16 09:00:00', end: '2020-07-16 12:00:00' },
        { start: '2020-07-18 14:45:00', end: '2020-07-18 17:45:00' },
      ];

      let tokens = [
        jwt.sign({ professional: { id: 1 } }),
        jwt.sign({ professional: { id: 3 } }),
        jwt.sign({ professional: { id: 4 } }),
        jwt.sign({ professional: { id: 5 } }),
      ];

      return Promise.all([
        request.post('/sessions').set('Authorization', `Bearer ${tokens[0]}`).send(sessions[3]),
        request.post('/sessions').set('Authorization', `Bearer ${tokens[1]}`).send(sessions[1]),
        request.post('/sessions').set('Authorization', `Bearer ${tokens[1]}`).send(sessions[2]),
        request.post('/sessions').set('Authorization', `Bearer ${tokens[1]}`).send(sessions[4]),
        request.post('/sessions').set('Authorization', `Bearer ${tokens[2]}`).send(sessions[3]),
        request.post('/sessions').set('Authorization', `Bearer ${tokens[2]}`).send(sessions[4]),
        request.post('/sessions').set('Authorization', `Bearer ${tokens[3]}`).send(sessions[0]),
        request.post('/sessions').set('Authorization', `Bearer ${tokens[4]}`).send(sessions[1]),
      ]);
    });

    it('return list of sessions available', (done) => {
      request.get('/sessions/available')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.sessions);

        let { sessions } = res.body;
        should(sessions).be.Array();

        sessions.forEach((session) => {
          should(session.booked).be.false();
          should.not.exist(session.createdAt);
          should.not.exist(session.updatedAt);
        });

        done();
      });
    });

    it('should return only sessions by the professional 1', (done) => {
      request.get('/sessions/available?professional=1')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.sessions);

        let { sessions } = res.body;
        should(sessions).be.Array();

        sessions.forEach((session) => {
          should(session.professional).be.equal(1);
        });

        done();
      });
    });

    it('should return only sessions within the range of time', (done) => {
      request.get('/sessions/available?start=2020-07-15 08:00:00&end=2020-07-15 11:00:00')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.sessions);

        let { sessions } = res.body;
        should(sessions).be.Array();
        should(sessions.length).be.equal(5);

        done();
      });
    });
  });
});
