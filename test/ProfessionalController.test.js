const app = require('../app');
const request = require('supertest')(app);
const should = require('should');

describe('Professional Controller', () => {
  let professionalId;

  describe('POST /professionals', () => {
    it('should fail to create', (done) => {
      request.post('/professionals')
      .expect(400)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('Object "professional" must be sent\n');

        done();
      });
    });

    it('should fail to create without firstName', (done) => {
      request.post('/professionals')
      .send({ professional: { lastName: 'Church' }})
      .expect(400)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('Professional must have a first name\n');

        done();
      });
    });

    it('should fail to create without lastName', (done) => {
      request.post('/professionals')
      .send({ professional: { firstName: 'Carolina' }})
      .expect(400)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('Professional must have a last name\n');

        done();
      });
    });

    it('return the created professional', (done) => {
      let professional = {
        firstName: 'Eva',
        lastName: 'Mercer',
      };

      request.post('/professionals')
      .send({ professional })
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.professional);

        let { professional } = res.body;

        professionalId = professional.id;
        should.exist(professional.firstName);
        should.exist(professional.lastName);

        done();
      });
    });
  });

  describe('GET /professionals', () => {
    before(() => {
      let professionals = [
        { firstName: 'Aditi', lastName: 'Gibson' },
        { firstName: 'Konnor', lastName: 'Ramsey' },
        { firstName: 'Ilayda', lastName: 'Ali' },
      ];

      return Promise.all([
        request.post('/professionals').send({ professional: professionals[0], }),
        request.post('/professionals').send({ professional: professionals[1], }),
        request.post('/professionals').send({ professional: professionals[2], }),
      ]);
    });

    it('return list of professionals', (done) => {
      request.get('/professionals')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.professionals);

        let { professionals } = res.body;
        should(professionals).be.Array();

        done();
      });
    });

    it('return max of 2 professionals', (done) => {
      request.get('/professionals?limit=2&skip=2')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.professionals);

        let { professionals } = res.body;

        should(professionals).be.Array();
        should(professionals.length).be.belowOrEqual(2);

        done();
      });
    });
  });

  describe('GET /professionals/:id', () => {
    it('return a professional', (done) => {
      request.get(`/professionals/${professionalId}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.professional);

        let { professional } = res.body;
        should(professional.firstName).be.equal('Eva');
        should(professional.lastName).be.equal('Mercer');

        done();
      });
    });

    it('return 404 when not found', (done) => {
      request.get('/professionals/100')
      .expect(404)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('Professional not found\n');

        done();
      });
    });
  });

  describe('PUT /professionals/:id', () => {
    it('return the updated professional', (done) => {
      let content = { firstName: 'Sam', lastName: 'Bridges' };

      request.put(`/professionals/${professionalId}`)
      .send({ professional: content })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if(err) { return done(err); }

        should.exist(res.body.professional);

        let { professional } = res.body;
        should(professional.firstName).be.equal('Sam');
        should(professional.lastName).be.equal('Bridges');

        done();
      });
    });

    it('should fail to update', (done) => {
      request.put(`/professionals/${professionalId}`)
      .expect(400)
      .end((err, res) => {
        if(err) { return done(err); }

        should(res.text).be.equal('Object "professional" must be sent\n');

        done();
      });
    });
  });

  describe('DELETE /professionals/:id', () => {
    it('return 204 after delete', (done) => {
      request.delete(`/professionals/${professionalId}`)
      .expect(204)
      .end((err, res) => {
        if(err) { return done(err); }

        let body = Object.keys(res.body);
        should(body.length).be.equal(0);

        done();
      });
    });
  });
});
