import { Notification } from "../../../Real projects/JobTrack/server/src/models/notification.model.js";
import logger from "../../../Real projects/JobTrack/server/src/utils/logger.js";


export const notifyUser = async (userId, { type, icon, title, message, link, relatedId }) => {
  try {
    if (!userId) return;
    await Notification.create({ userId, type, icon, title, message, link, relatedId });
  } catch (err) {
    logger.error("Failed to create notification", { err, userId, type });
  }
};
