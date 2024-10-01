import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/localNotification.dart';
import 'firebase_options.dart';

Future<void> initializeFirebase() async {
  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Initialize the notification service
  await LocalNotificationService.initialize();
}

Future<void> initializeFCM(bool log) async {
  FirebaseMessaging messaging = FirebaseMessaging.instance;

  // Request permission to send notifications
  await messaging.requestPermission(
    alert: true,
    badge: true,
    sound: true,
  );

  API api = API();
  // Check if the token is already stored locally
  if (log) {
    String? fcmtoken = await messaging.getToken();
    if (fcmtoken != null) {
      print("FCM Token: $fcmtoken");
      var tk = await api.getToken();
      if (tk != null) {
        // Only send the token if the user is logged in
        await api.sendTokenToServer(fcmtoken);
      } else {
        print("User is not logged in, skipping FCM token send.");
      }
      api.saveToken(fcmtoken); // Save the token locally regardless
    }
  }

  // Listen for token refresh and handle it
  FirebaseMessaging.instance.onTokenRefresh.listen((newToken) async {
    print("FCM Token refreshed: $newToken");
    var tk = await api.getToken();
    if (tk != null) {
      // Only send the token if the user is logged in
      await api.sendTokenToServer(newToken);
    } else {
      print("User is not logged in, skipping FCM token send.");
    }
    api.saveToken(newToken); // Save the token locally regardless
  });

  // Listen for foreground messages
  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    print("Message received: ${message.notification?.title}");
    LocalNotificationService.showNotification(
      0, // id
      message.notification?.title ?? 'No Title', // title
      message.notification?.body ?? 'No Body', // body
      message.data['payload'] ?? 'No Payload', // payload
    );
  });

  // Handle notification clicks when the app is in the background or terminated
  FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
    print('Message clicked!');
    // Add  navigation logic here if needed
  });
}

// Background message handler
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print("Handling a background message: ${message.messageId}");
  LocalNotificationService.showNotification(
    0, // id
    message.notification?.title ?? 'No Title', // title
    message.notification?.body ?? 'No Body', // body
    message.data['payload'] ?? 'No Payload', // payload
  );
}

//Subscribe to a Topic - usage: subscribeToTopic('news');
void subscribeToTopic(String topic) async {
  try {
    await FirebaseMessaging.instance.subscribeToTopic(topic);
    print('Subscribed to $topic');
  } catch (e) {
    print('Failed to subscribe to $topic: $e');
  }
}

//Unsubscribe from a Topic - usage:  unsubscribeFromTopic('news');
void unsubscribeFromTopic(String topic) async {
  try {
    await FirebaseMessaging.instance.unsubscribeFromTopic(topic);
    print('Unsubscribed from $topic');
  } catch (e) {
    print('Failed to unsubscribe from $topic: $e');
  }
}
