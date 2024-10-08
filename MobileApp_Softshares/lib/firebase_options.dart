// File generated by FlutterFire CLI.
// ignore_for_file: type=lint
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for ios - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for macos - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyD8fzhAXSKnKrJQouSqAka3CZUMRI7-YVY',
    appId: '1:602316436569:web:e55bcb45779a1b712aad48',
    messagingSenderId: '602316436569',
    projectId: 'softshares-000515',
    authDomain: 'softshares-000515.firebaseapp.com',
    storageBucket: 'softshares-000515.appspot.com',
    measurementId: 'G-T2LD78DFC9',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyCVuWQz-6HhTXVWdaQqWvwXgbdzFJ0JY1Q',
    appId: '1:602316436569:android:6a85220e2c84a0292aad48',
    messagingSenderId: '602316436569',
    projectId: 'softshares-000515',
    storageBucket: 'softshares-000515.appspot.com',
  );
}
