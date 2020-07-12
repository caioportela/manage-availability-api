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
};

module.exports = SessionController;
