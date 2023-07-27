const Notification = require("../models/Notification");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");

const createNotification = async (req, res) => {
  const { id: user } = req.user;
  const { message } = req.body;
  if (!message) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "No message provided!" });
  }

  if (!user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "No user provided!" });
  }

  const notification = { ...req.body, user };
  const savedNotification = await Notification.create(notification);

  await User.findOneAndUpdate(
    { _id: user },
    { $push: { notifications: savedNotification } },
    { new: true, runValidators: true }
  );

  return res
    .status(StatusCodes.CREATED)
    .json({ notification: savedNotification });
};

const deleteNotification = async (req, res) => {
  const { id: user } = req.user;
  const { notificationId } = req.params;
  const notification = await Notification.findOne({ _id: notificationId });

  if (!notification) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Notification does not exist" });
  }

  if (user !== notification.user.toString()) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Not allowed to delete the notification" });
  }

  const users = await User.find({});

  for (let user of users) {
    for (let notification of user.notifications) {
      if (notification._id.toString() === notificationId) {
        await User.findOneAndUpdate(
          { _id: user },
          { $pull: { notifications: notification } },
          { new: true, runValidators: true }
        );
      }
    }
  }

  await User.findOneAndUpdate(
    { _id: user },
    { $pull: { notifications: notification } },
    { new: true, runValidators: true }
  );

  await notification.deleteOne();
  return res.status(StatusCodes.OK).json({ msg: "Notification deleted!" });
};

const getUserNotifications = async (req, res) => {
  const { id: user } = req.user;
  const notifications = await Notification.find({ user });

  if (!notifications) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "User has no notifications." });
  }
  return res
    .status(StatusCodes.OK)
    .json({ notifications, count: notifications.length });
};

const readNotification = async (req, res) => {
  const { id: user } = req.user;
  const { notificationId } = req.params;
  const notification = await Notification.findOne({ _id: notificationId });

  if (!notification) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "No notification to read" });
  }

  if (user !== notification.user.toString()) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Not allowed to read the notification" });
  }

  if (notification.isRead === true) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Notification already read" });
  }

  notification.isRead = true;
  await notification.save();
  res.status(StatusCodes.OK).json({ notification });
};

const readAllNotifications = async (req, res) => {
  const { id: user } = req.user;
  const notifications = await Notification.find({ user });

  if (!notifications) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "No notification to read" });
  }

  for (let notification of notifications) {
    notification.isRead = true;
    await notification.save();
  }
  res.status(StatusCodes.OK).json({ msg: "All notifications are read now!" });
};

module.exports = {
  createNotification,
  deleteNotification,
  getUserNotifications,
  readNotification,
  readAllNotifications,
};
