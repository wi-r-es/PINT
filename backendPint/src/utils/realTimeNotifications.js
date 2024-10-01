//const { admin } = require('../server');
var admin = require("firebase-admin");
const serviceAccount = require("../../softshares-000515-firebase-adminsdk-ds8og-d6087d42e3.json");
const {getEventCreator} = require("../database/logic_objects/eventProcedures");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const { findUserById } = require("../database/logic_objects/usersProcedures");
// Function to send a notification when someone replies to a comment
const sendReplyNotification = async (replyToUserId, commentId, replierName) => {
  const user = await findUserById(replyToUserId);
  if (!user || !user.fcmToken) {
    console.log("fcmToken is null");
    return;
  }
  const fcmtoken = user.fcmToken;
  const payload = {
    notification: {
      title: "New Reply to Your Comment",
      body: `${replierName} replied to your comment.`,
    },
    android: {
      priority: "high",
      notification: {
        channel_id: "MESSAGE_CHANNEL", // *
        icon: "message_icon", // *
        tag: "message", // *
        //image: imageUrl,
      },
    },
    apns: { //section is specific to iOS devices - apple push notifications
      payload: {
        aps: {
          //badge,
          sound: "chime.caf",
        },
      },
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK", // *
      type: "MESSAGE", // *
      commentId: String(commentId),
    },
    token: fcmtoken,
  };

  try {
    console.log("sending notification");
    await admin.messaging().send(payload);
  } catch (error) {
    console.error("Error sending notification to event creator:", error);
  }
};

// Function to send a notification when someone likes a comment
const sendLikeNotification = async (commentOwnerId, likerName) => {
  console.log(commentOwnerId)
  const user = await findUserById(commentOwnerId);
  if (!user || !user.fcmToken) {
    console.log("fcmToken is null");
    return;
  }
  const fcmtoken = user.fcmToken;
  const payload = {
    notification: {
      title: "Your Comment was Liked",
      body: `${likerName} liked your comment.`,
    },
    android: {
      priority: "high",
      notification: {
        channel_id: "MESSAGE_CHANNEL", // *
        icon: "message_icon", // *
        tag: "message", // *
        //image: imageUrl,
      },
    },
    apns: {
      payload: {
        aps: {
          //badge,
          sound: "chime.caf",
        },
      },
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK", // *
      type: "MESSAGE", // *
    },
    token: fcmtoken,
  };

  try {
    console.log("sending notification");
    await admin.messaging().send(payload);
  } catch (error) {
    console.error("Error sending notification to event creator:", error);
  }
};

// Function to send a notification when someone comments on a post or forum you created
const sendNewCommentNotification = async (
  postOwnerId,
  postId,
  contentType,
  commenterName
) => {
  const user = await findUserById(postOwnerId);
  console.log(admin);
  if (!user || !user.fcmToken) {
    console.log("fcmToken is null");
    return;
  }
  const fcmtoken = user.fcmToken;
  const payload = {
    notification: {
      title: "New Comment on Your Publication",
      body: `${commenterName} commented on your ${contentType}.`,
    },
    android: {
      priority: "high",
      notification: {
        channel_id: "MESSAGE_CHANNEL", // *
        icon: "message_icon", // *
        tag: "message", // *
        //image: imageUrl,
      },
    },
    apns: {
      payload: {
        aps: {
          //badge,
          sound: "chime.caf",
        },
      },
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK", // *
      type: "MESSAGE", // *
      postId: String(postId),
    },
    token: fcmtoken,
  };

  try {
    console.log("sending notification");
    await admin.messaging().send(payload);
  } catch (error) {
    console.log(error);
    console.log(error.message);
  }
};

// Function to send a notification when someone comments on an event users are registered
const sendNewCommentNotificationForEventsParticipants = async (
  eventID,
  eventparticipants,
  commenterName,
  eventName
) => {
  // Array to hold all FCM tokens
  const fcmTokens = [];
  let ownerToken = null;

  // Get the event creator's ID
  const ownerID = await getEventCreator(eventID); // Ensure this returns a Promise resolved with the owner ID

  for (const participant of eventparticipants) {
    const user = await findUserById(participant.user_id); // Assuming participant object has a user_id property
    if (user && user.fcmToken) {
      if (participant.user_id === ownerID) {
        // If the participant is the owner, save the owner's token separately
        ownerToken = user.fcmToken;
      } else {
        // Otherwise, add the token to the fcmTokens array
        fcmTokens.push(user.fcmToken);
      }
    } else {
      console.log(
        `User with ID ${participant.user_id} has no FCM token or user not found`
      );
    }
  }

  // If no tokens are available, return early
  if (fcmTokens.length === 0 && !ownerToken) {
    console.log("No FCM tokens available to send notifications");
    return;
  }

  // Create the payload for the participants
  const payload = {
    notification: {
      title: "New Comment on the event you are registered",
      body: `${commenterName} commented on ${eventName}.`,
    },
    android: {
      priority: "high",
      notification: {
        channel_id: "MESSAGE_CHANNEL",
        icon: "message_icon",
        tag: "message",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "chime.caf",
        },
      },
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      type: "MESSAGE",
      eventID: String(eventID),
    },
  };

  // Create the payload for the event creator
  const ownerPayload = {
    notification: {
      title: "New Comment on the event you created",
      body: `${commenterName} commented on ${eventName}.`,
    },
    android: {
      priority: "high",
      notification: {
        channel_id: "MESSAGE_CHANNEL",
        icon: "message_icon",
        tag: "message",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "chime.caf",
        },
      },
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      type: "MESSAGE",
      eventID: String(eventID),
    },
  };

  // Send notifications to all participants
  if (fcmTokens.length > 0) {
    // Prepare the message object for multicast
    const message = {
      tokens: fcmTokens, // Array of FCM tokens
      ...payload, // Spreads the contents of the payload object into the message object
    };

    console.log("Sending notification to participants");
    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log("Notification response:", response);

      // Log any tokens that could not be sent to
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(fcmTokens[idx]);
          }
        });
        console.log(
          "List of tokens that failed to receive the notification:",
          failedTokens
        );
      }
    } catch (error) {
      console.error("Error sending notifications to participants:", error);
    }
  }

  // Send notification to the event creator (owner)
  if (ownerToken) {
    const ownerMessage = {
      token: ownerToken, // Single FCM token for the owner
      ...ownerPayload, // Spreads the contents of the ownerPayload object into the message object
    };

    console.log("Sending notification to event creator");
    try {
      const response = await admin.messaging().send(ownerMessage);
      console.log("Notification response to event creator:", response);
    } catch (error) {
      console.error("Error sending notification to event creator:", error);
    }
  }
};



// Function to send a notification when an event is altered, notifying all participants except the owner
const sendEventAlterationNotificationForParticipants = async (
  eventID,
  eventparticipants,
  eventName,
  alterationDetails // Details about the alteration to include in the notification
) => {
  // Array to hold all FCM tokens
  const fcmTokens = [];

  // Get the event creator's ID
  const ownerID = await getEventCreator(eventID); // Ensure this returns a Promise resolved with the owner ID

  for (const participant of eventparticipants) {
    const user = await findUserById(participant.user_id); // Assuming participant object has a user_id property
    if (user && user.fcmToken) {
      if (participant.user_id !== ownerID) {
        // Add the token to the fcmTokens array only if the participant is not the owner
        fcmTokens.push(user.fcmToken);
      }
    } else {
      console.log(
        `User with ID ${participant.user_id} has no FCM token or user not found`
      );
    }
  }

  // If no tokens are available, return early
  if (fcmTokens.length === 0) {
    console.log("No FCM tokens available to send notifications");
    return;
  }

  // Create the payload for the notification
  const payload = {
    notification: {
      title: "Event Alteration Notification",
      body: `The event "${eventName}" has been altered. ${alterationDetails}`,
    },
    android: {
      priority: "high",
      notification: {
        channel_id: "EVENT_ALTERATION_CHANNEL",
        icon: "event_icon",
        tag: "event_alteration",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "chime.caf",
        },
      },
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      type: "EVENT_ALTERATION",
      eventID: String(eventID),
    },
  };

  // Prepare the message object for multicast
  const message = {
    tokens: fcmTokens,  // Array of FCM tokens
    ...payload,        // Spreads the contents of the payload object into the message object
  };

  console.log('Sending notification to participants about event alteration');
  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log('Notification response:', response);

    // Log any tokens that could not be sent to
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(fcmTokens[idx]);
        }
      });
      console.log('List of tokens that failed to receive the notification:', failedTokens);
    }
  } catch (error) {
    console.error("Error sending notifications about event alteration:", error);
  }
};


// Function to send a notification when someone registers for an event you created
const sendEventRegistrationNotification = async (
  eventOwnerId,
  eventId,
  registrantName
) => {
  const user = await findUserById(eventOwnerId);
  if (!user || !user.fcmToken) {
    console.log("fcmToken is null");
    return;
  }
  const fcmtoken = user.fcmToken;
  const payload = {
    notification: {
      title: "New Event Registration",
      body: `${registrantName} registered for your event.`,
    },
    android: {
      priority: "high",
      notification: {
        channel_id: "MESSAGE_CHANNEL", // *
        icon: "message_icon", // *
        tag: "message", // *
        // image: imageUrl,
      },
    },
    apns: {
      payload: {
        aps: {
          //badge,
          sound: "chime.caf",
        },
      },
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK", // *
      type: "MESSAGE", // *
      eventId: String(eventId),
    },
    token: fcmtoken,
  };
  console.log("sending notification");
  await admin.messaging().send(payload);
};
const sendEventUnregistrationNotification = async (
  eventOwnerId,
  eventId,
  registrantName
) => {
  const user = await findUserById(eventOwnerId);
  if (!user || !user.fcmToken) {
    console.log("fcmToken is null");
    return;
  }
  const fcmtoken = user.fcmToken;
  const payload = {
    notification: {
      title: "Event Registration",
      body: `${registrantName} unregistered for your event.`,
    },
    android: {
      priority: "high",
      notification: {
        channel_id: "MESSAGE_CHANNEL", // *
        icon: "message_icon", // *
        tag: "message", // *
        // image: imageUrl,
      },
    },
    apns: {
      payload: {
        aps: {
          //badge,
          sound: "chime.caf",
        },
      },
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK", // *
      type: "MESSAGE", // *
      eventId: String(eventId),
    },
    token: fcmtoken,
  };
  console.log("sending notification");
  await admin.messaging().send(payload);
};

// Function to send a notification to everyone subscribed to a specific topic
/*
USAGE:
          sendNotificationToTopic(
            "news_updates",  // Topic name
            "Breaking News", // Notification title
            "Here's the latest news update!", // Notification body
            { articleId: "12345" } // Optional data payload
          );

*/
const sendNotificationToTopic = async (
  topicName,
  title,
  body,
  dataPayload = {} // Optional additional data to include in the notification
) => {
  // Create the payload for the notification
  const payload = {
    notification: {
      title: title,
      body: body,
    },
    android: {
      priority: "high",
      notification: {
        channel_id: "TOPIC_CHANNEL", // Adjust this according to your app's notification channels
        icon: "topic_icon",
        tag: "topic_notification",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "chime.caf",
        },
      },
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      type: "TOPIC_NOTIFICATION",
      ...dataPayload, // Include any additional data passed to the function
    },
    topic: topicName, // The name of the topic to which the notification will be sent
    
  };

  console.log(`Sending notification to topic: ${topicName}`);
  try {
    /*
    The sendToTopic method is used under the hood by specifying the topic key in the message object. 
    This sends the notification to all devices subscribed to the specified topic.
    */
    const response = await admin.messaging().send(payload);
    console.log('Notification response:', response);
  } catch (error) {
    console.error(`Error sending notification to topic ${topicName}:`, error);
  }
};


// Subscribe a device token to a topic
const subscribeToTopic = async (registrationToken, topic) => {
  admin.messaging().subscribeToTopic(registrationToken, topic)
  .then(response => {
    console.log('Successfully subscribed to topic:', response);
  })
  .catch(error => {
    console.log('Error subscribing to topic:', error);
  });
}


// Unsubscribe a device token from a topic
const unsubscribeToTopic = async (registrationToken, topic) => {
admin.messaging().unsubscribeFromTopic(registrationToken, topic)
  .then(response => {
    console.log('Successfully unsubscribed from topic:', response);
  })
  .catch(error => {
    console.log('Error unsubscribing from topic:', error);
  });
}
module.exports = {
  sendReplyNotification,
  sendLikeNotification,
  sendNewCommentNotification,

  sendEventRegistrationNotification,
  sendEventUnregistrationNotification,

  sendNewCommentNotificationForEventsParticipants,
  sendEventAlterationNotificationForParticipants,

  sendNotificationToTopic,
};
