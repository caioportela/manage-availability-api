const { Session } = require('../loaders/models');
const { Op } = require('sequelize');
const moment = require('moment');

const SessionController = {
  async create(req, res) {
    let professional = req.professional.id;

    try {
      let { start, end } = req.body;

      if(!start) {
        throw 'The start for the interval must be sent\n';
      }

      if(!end) {
        throw 'The end for the interval must be sent\n';
      }

      start = moment(start);
      end = moment(end);

      if(end.isBefore(start)) {
        throw 'The end of the interval must be after the start\n';
      }

      if(end.diff(start, 'hours') === 0) {
        throw 'The interval must be at least 1 hour\n';
      }

      let existingSessions = await Session.findAll({
        where: {
          professional,
          [Op.or]: [
            { start: { [Op.between]: [start.toDate(), end.toDate()] } },
            { end: { [Op.between]: [start.toDate(), end.toDate()] } },
          ],
        },
        order: [['start', 'DESC']],
      });

      if(existingSessions.length > 0) {
        let available = moment(existingSessions[0].end).format('HH[h]mm');
        throw `There are sessions in this interval. Available from ${available}\n`;
      }

      let sessions = [];

      while(start.isBefore(end)) {
        if(end.diff(start, 'minutes') < 30) { break; }

        let session = {
          professional,
          start: start.toDate(),
          end: start.clone().add(30, 'minutes').toDate(),
        };

        sessions.push(session);
        start.add(30, 'minutes');
      }

      sessions = await Session.bulkCreate(sessions);

      return res.created({ sessions });
    } catch (e) {
      return res.badRequest(e);
    }
  },

  async destroy(req, res) {
    let professional = req.professional.id;

    try {
      let session = await Session.findOne({
        where: {
          professional,
          id: req.params.id,
        }
      });

      if(!session) {
        return res.forbidden('You cannot remove sessions from others\n');
      }

      await session.destroy();

      return res.noContent();
    } catch (e) {
      return res.badRequest(e);
    }
  },

  async find(req, res) {
    let { limit, skip, start, end, ...where } = req.query;

    let query = { };

    if(limit) {
      query.limit = parseInt(limit);
    }

    if(skip) {
      query.offset = parseInt(skip);
    }

    if(start && end) {
      start = moment(start);
      end = moment(end);

      where.start = { [Op.gte]: start.toDate() };
      where.end = { [Op.lte]: end.toDate() };
    }

    try {
      let sessions = await Session.findAll({
        ...query,
        where,
      });

      return res.ok({ sessions });
    } catch (e) {
      return res.badRequest(e);
    }
  },

  async findAvailable(req, res) {
    try {
      let { professional, start, end } = req.query;

      let where = { booked: false };

      if(professional) {
        where.professional = professional;
      }

      if(start && end) {
        start = moment(start);
        end = moment(end);

        where.start = { [Op.gte]: start.toDate() };
        where.end = { [Op.lte]: end.toDate() };
      }

      let sessions = await Session.findAll({
        where,
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        order: [['start', 'ASC']],
      });

      // Map which professionals have sessions
      let mapProfessionals = sessions.map(o => o.professional);
      mapProfessionals = [...new Set(mapProfessionals)];

      let availableSessions = [];

      // Group sessions by professional
      mapProfessionals.forEach((pro) => {
        let available = sessions.filter(o => o.professional === pro);

        // At least 2 sessions are needed to show available
        if(available.length === 1) { return; }

        for(let i = 0; i < available.length - 1; i++) {
          let currentStart = moment(available[i].start);
          let nextStart = moment(available[i+1].start);

          // If interval to next available session is 30 minutes, then show available
          if(nextStart.diff(currentStart, 'minutes') === 30) {
            availableSessions.push(available[i]);
          }
        }
      });

      return res.ok({ sessions: availableSessions });
    } catch (e) {
      return res.badRequest(e);
    }
  },

  async findOne(req, res) {
    try {
      let session = await Session.findOne({
        where: { id: req.params.id },
      });

      if(!session) {
        return res.notFound('Session not found\n');
      }

      return res.ok({ session });
    } catch (e) {
      return res.badRequest(e);
    }
  },

  async schedule(req, res) {
    try {
      let customer = req.body.customer;

      if(!customer) {
        throw 'Customer must be sent\n';
      }

      let period1 = await Session.findOne({
        where: { id: req.params.id },
      });

      if(!period1) {
        return res.notFound('Session not found\n');
      }

      if(period1.booked) {
        return res.forbidden('Session not available\n');
      }

      let start = moment(period1.start).add(30, 'minutes').toDate();

      let period2 = await Session.findOne({
        where: {
          start,
          booked: false,
          professional: period1.professional,
        }
      });

      if(!period2) {
        throw 'Session not available\n';
      }

      period1.customer = customer;
      period2.customer = customer;

      period1.booked = true;
      period2.booked = true;

      await Promise.all([period1.save(), period2.save()]);

      return res.ok({ sessions: [period1, period2] });
    } catch (e) {
      return res.badRequest(e);
    }
  }
};

module.exports = SessionController;
