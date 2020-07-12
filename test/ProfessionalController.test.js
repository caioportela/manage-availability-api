const app = require('../app');
const request = require('supertest')(app);
const should = require('should');

describe('Professional Controller', function() {
  let professionalId;

  describe('POST /professionals', function() {
    it('should fail to create', function(done) {
      request.post('/professionals')
      .expect(400)
      .end(function(err, res) {
        if(err) { return done(err); }

        should(res.text).be.equal('Object "professional" must be sent\n');

        done();
      });
    });

    it('should fail to create without firstName', function(done) {
      request.post('/professionals')
      .send({ professional: { lastName: 'Church' }})
      .expect(400)
      .end(function(err, res) {
        if(err) { return done(err); }

        should(res.text).be.equal('Professional must have a first name\n');

        done();
      });
    });

    it('should fail to create without lastName', function(done) {
      request.post('/professionals')
      .send({ professional: { firstName: 'Carolina' }})
      .expect(400)
      .end(function(err, res) {
        if(err) { return done(err); }

        should(res.text).be.equal('Professional must have a last name\n');

        done();
      });
    });

    it('return the created professional', function(done) {
      let professional = {
        firstName: 'Eva',
        lastName: 'Mercer',
      };

      request.post('/professionals')
      .send({ professional })
      .expect('Content-Type', /json/)
      .expect(201)
      .end(function(err, res) {
        if(err) { return done(err); }

        should.exist(res.body.professional);

        let { professional } = res.body;

        professionalId = professional.id;
        should.exist(professional.firstName);
        should.exist(professional.lastName);
        should.exist(professional.token);

        done();
      });
    });
  });

  describe('GET /professionals', function() {
    it('return list of professionals', function(done) {
      request.get('/professionals')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if(err) { return done(err); }

        should.exist(res.body.professionals);

        let { professionals } = res.body;
        should(professionals).be.Array();

        done();
      });
    });
  });

  describe('GET /professionals/:id', function() {
    it('return a professional', function(done) {
      request.get(`/professionals/${professionalId}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if(err) { return done(err); }

        should.exist(res.body.professional);

        let { professional } = res.body;
        should(professional.firstName).be.equal('Eva');
        should(professional.lastName).be.equal('Mercer');

        done();
      });
    });

    it('return 404 when not found', function(done) {
      request.get('/professionals/100')
      .expect(404)
      .end(function(err, res) {
        if(err) { return done(err); }

        should(res.text).be.equal('Professional not found\n');

        done();
      });
    });
  });

  describe('GET /professionals/token', function() {
    it('return token of the professionals', function(done) {
      request.get('/professionals/token')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if(err) { return done(err); }

        should.exist(res.body.professionals);

        let { professionals } = res.body;
        should(professionals).be.Array();

        done();
      });
    });
  });

  describe('PUT /professionals/:id', function() {
    it('return the updated professional', function(done) {
      let content = { firstName: 'Sam', lastName: 'Bridges' };

      request.put(`/professionals/${professionalId}`)
      .send({ professional: content })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if(err) { return done(err); }

        should.exist(res.body.professional);

        let { professional } = res.body;
        should(professional.firstName).be.equal('Sam');
        should(professional.lastName).be.equal('Bridges');

        done();
      });
    });

    it('should fail to update', function(done) {
      request.put(`/professionals/${professionalId}`)
      .expect(400)
      .end(function(err, res) {
        if(err) { return done(err); }

        should(res.text).be.equal('Object "professional" must be sent\n');

        done();
      });
    });
  });

  describe('DELETE /professionals/:id', function() {
    it('return 204 after delete', function(done) {
      request.delete(`/professionals/${professionalId}`)
      .expect(204)
      .end(function(err, res) {
        if(err) { return done(err); }

        let body = Object.keys(res.body);
        should(body.length).be.equal(0);

        done();
      });
    });
  });
});
