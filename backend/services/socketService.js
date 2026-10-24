const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

const connectedUsers = new Map();

const setupSocketIO = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        try {
          const decoded = jwt.verify(token, config.JWT_SECRET);
          socket.userId = decoded.id;
          socket.userRole = decoded.role;
        } catch (e) {
          logger.warn(`Socket auth token invalid/expired: ${e.message}`);
        }
      }
      // Allow connection even without token so socket doesn't abruptly drop before handshake
      next();
    } catch (err) {
      next();
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userId}`);
    connectedUsers.set(socket.userId, socket.id);
    socket.join(`user:${socket.userId}`);
    socket.join(`role:${socket.userRole}`);

    io.emit('users:online', Array.from(connectedUsers.keys()));

    socket.on('join:incident', (incidentId) => {
      socket.join(`incident:${incidentId}`);
    });

    socket.on('leave:incident', (incidentId) => {
      socket.leave(`incident:${incidentId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
      io.emit('users:online', Array.from(connectedUsers.keys()));
    });
  });

  return io;
};

const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

const emitToRole = (io, role, event, data) => {
  io.to(`role:${role}`).emit(event, data);
};

const emitToIncident = (io, incidentId, event, data) => {
  io.to(`incident:${incidentId}`).emit(event, data);
};

const emitToAll = (io, event, data) => {
  io.emit(event, data);
};

module.exports = { setupSocketIO, emitToUser, emitToRole, emitToIncident, emitToAll, connectedUsers };
