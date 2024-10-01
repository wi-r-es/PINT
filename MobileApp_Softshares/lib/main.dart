import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:get_storage/get_storage.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:get_it/get_it.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:softshares/Pages/albumContent/album.dart';
import 'package:softshares/Pages/alterPassword.dart';
import 'package:softshares/Pages/notices.dart';
import 'package:softshares/emailRecover.dart';
import 'firebase_conf.dart';
import 'classes/ThemeNotifier.dart';
import 'Pages/homepage.dart';
import 'Pages/MyProfile.dart';
import 'Pages/calendar.dart';
import 'Pages/customCheckForm.dart';
import 'Pages/createPub.dart';
import 'Pages/customFieldTextForm.dart';
import 'Pages/customRadioBtnForm.dart';
import 'Pages/editProfile.dart';
import 'Pages/alreadyLoggedIn.dart';
import 'Pages/notifications.dart';
import 'Pages/pointsOfInterest.dart';
import 'Pages/signIn.dart';
import 'Pages/signup.dart';
import 'Pages/settings.dart';
import 'Pages/chooseCityPage.dart';
import 'Pages/recovery.dart';
import 'test.dart';
import 'package:softshares/providers/auth_provider.dart';
import 'package:softshares/classes/db.dart';
import 'package:softshares/classes/user.dart';

final storage = FlutterSecureStorage();
// Initialize GetIt
final getIt = GetIt.instance;

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase and FCM
  await initializeFirebase();

  // Load environment variables
  await GetStorage.init();
  await dotenv.load(fileName: ".env");

  SQLHelper db = SQLHelper.instance;
  final box = GetStorage();
  //Machado
  //box.write('url', 'https://backendpint-909f.onrender.com/api');
  //Filipe
  box.write('url', 'https://backendpint-w3vz.onrender.com/api');
  //Mine
  //box.write('url', 'http://10.0.2.2:8000/api');
  User? user;
  bool logged;

  try {
    user = await db.getUser();
    logged = user != null;
  } catch (e) {
    print(e);
    logged = false;
  }

  // Uncomment if you need to handle background messages
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

  // Register dependencies
  getIt.registerSingleton<FirebaseMessaging>(FirebaseMessaging.instance);
  getIt.registerSingleton<AuthProvider>(AuthProvider());

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeNotifier()),
        ChangeNotifierProvider(
          create: (_) => getIt<AuthProvider>()..checkLoginStatus(),
        ),
      ],
      child: MyApp(
        logged: logged,
        user: user,
      ),
    ),
  );
}

class MyApp extends StatefulWidget {
  MyApp({super.key, required this.logged, required this.user});
  final bool logged;
  final User? user;

  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();
    initializeFCM(widget.logged);
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<ThemeNotifier, AuthProvider>(
      builder: (context, themeNotifier, authProvider, child) {
        return MaterialApp(
          title: 'SoftShares',
          theme: themeNotifier.themeData,
          debugShowCheckedModeBanner: false,
          initialRoute: widget.logged ? '/Login' : '/SignIn',
          navigatorKey: navigatorKey,
          routes: {
            '/home': (context) => MyHomePage(areas: authProvider.areas),
            '/PointOfInterest': (context) =>
                PointsOfInterest(areas: authProvider.areas),
            '/Calendar': (context) => Calendar(areas: authProvider.areas),
            '/Profile': (context) => MyProfile(
                  areas: authProvider.areas,
                  user: authProvider.user!,
                ),
            '/Editprofile': (context) => EditProfile(
                  areas: authProvider.areas,
                  user: authProvider.user!,
                ),
            '/Login': (context) => MyLoginIn(user: widget.user!),
            '/SignIn': (context) => const SignIn(),
            '/SignUp': (context) => SignUp(cities: authProvider.cities),
            '/createPost': (context) => createPost(areas: authProvider.areas),
            '/createRadioBtnForm': (context) => customRadioBtnForm(),
            '/createFieldTextForm': (context) => customFieldtextForm(),
            '/createCheckboxForm': (context) => customCheckboxForm(),
            '/notifications': (context) =>
                Notifications(areas: authProvider.areas),
            '/settings': (context) => SettingsPage(),
            '/chooseCity': (context) => const ChooseCityPage(),
            '/recovery': (context) => const Recovery(),
            '/emailRecover': (context) => EmailRecovery(),
            '/test': (context) => test(),
            '/changePassword': (context) => const ChangePassword(),
            '/albums': (context) => Album(areas: authProvider.areas),
            '/notices': (context) => Notices()
          },
          onGenerateRoute: (settings) {
            // Handle routes that are not defined in the `routes` map
            if (settings.name == '/change-password') {
              return MaterialPageRoute(
                builder: (context) => ChangePassword(),
              );
            }
            // Handle other dynamic routes if necessary
            return null; // Let `onUnknownRoute` handle undefined routes
          },
          onUnknownRoute: (settings) {
            // Handle routes that cannot be generated by `onGenerateRoute`
            return MaterialPageRoute(
              builder: (context) => const Scaffold(
                body: Center(
                  child: Text('404 - Page Not Found'),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
