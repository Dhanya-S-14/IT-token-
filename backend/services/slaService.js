const cron = require('node-cron');
const SLARecord = require('../models/SLARecord');
const Incident = require('../models/Incident');
const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sendNotificationEmail } = require('./emailService');

const startSLAMonitor = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const activeSLA = await SLARecord.find({ status: { $in: ['active', 'warning'] } })
        .populate('incident')
        .populate({
          path: 'incident',
          populate: { path: 'assignedTo reportedBy' }
        });

      const now = new Date();

      for (const sla of activeSLA) {
        const timeLeft = sla.slaDeadline - now;
        const totalDuration = sla.slaDeadline - sla.createdAt;
        const percentageLeft = (timeLeft / totalDuration) * 100;

        if (percentageLeft < 0) {
          sla.status = 'breached';
          sla.breachTime = now;
          await sla.save();

          await Incident.findByIdAndUpdate(sla.incident._id, { isOverdue: true });

          await createSLANotification(sla, 'breach');
        } else if (percentageLeft < 25 && sla.status === 'active') {
          sla.status = 'warning';
          await sla.save();

          await createSLANotification(sla, 'warning');
        }
      }
    } catch (error) {
      logger.error('SLA Monitor Error:', error.message);
    }
  });

  logger.info('SLA Monitor started - checking every minute');
};

const createSLANotification = async (sla, type) => {
  try {
    const incident = sla.incident;
    if (!incident || !incident.assignedTo) return;

    const title = type === 'breach' ? 'SLA Breach Alert' : 'SLA Warning';
    const message = type === 'breach'
      ? `SLA breached for incident ${incident.incidentId}: ${incident.title}`
      : `SLA at risk for incident ${incident.incidentId}: ${incident.title}. Only ${Math.round((sla.slaDeadline - new Date()) / 60000)} minutes remaining.`;

    const notification = await Notification.create({
      recipient: incident.assignedTo._id || incident.assignedTo,
      type: type === 'breach' ? 'sla_breach' : 'sla_warning',
      title,
      message,
      priority: sla.priority === 'critical' ? 'critical' : 'high',
      data: {
        referenceId: incident._id,
        referenceType: 'incident',
        referenceUrl: `/incidents/${incident._id}`
      }
    });

    const user = await User.findById(incident.assignedTo);
    if (user && user.preferences?.notifications?.email) {
      await sendNotificationEmail(user.email, user.name, notification);
    }
  } catch (error) {
    logger.error('SLA Notification Error:', error.message);
  }
};

const createSLARecord = async (incident) => {
  const SLA_HOURS = { low: 48, medium: 24, high: 8, critical: 4 };
  const hours = SLA_HOURS[incident.priority] || 24;
  const slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);

  return SLARecord.create({
    incident: incident._id,
    priority: incident.priority,
    slaDeadline,
    responseDeadline: new Date(Date.now() + (hours * 60 * 60 * 1000) / 2)
  });
};

const getSLADetails = async (incidentId) => {
  const sla = await SLARecord.findOne({ incident: incidentId });
  if (!sla) return null;

  const now = new Date();
  const timeLeft = sla.slaDeadline - now;
  const totalDuration = sla.slaDeadline - sla.createdAt;
  const percentageUsed = ((totalDuration - timeLeft) / totalDuration) * 100;

  return {
    priority: sla.priority,
    status: sla.status,
    deadline: sla.slaDeadline,
    timeLeft: Math.max(0, timeLeft),
    percentageUsed: Math.min(100, Math.max(0, percentageUsed)),
    isBreached: sla.status === 'breached',
    isWarning: sla.status === 'warning'
  };
};

module.exports = { startSLAMonitor, createSLARecord, getSLADetails };
