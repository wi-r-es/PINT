import 'dart:convert';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_storage/get_storage.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/officeClass.dart';
import 'package:softshares/classes/unauthoraziedExceptionClass.dart';
import 'package:softshares/classes/user.dart' as u;
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:encrypt/encrypt.dart' as encrypt;
import 'package:crypto/crypto.dart';
import 'package:softshares/classes/db.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:http/http.dart' as http;
//firebase
import 'package:firebase_auth/firebase_auth.dart' as firebase;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'package:get_it/get_it.dart';
import 'package:sqflite/sqflite.dart';

import 'sign_in_result.dart';

class AuthProvider with ChangeNotifier {
  final FirebaseMessaging _firebaseMessaging = GetIt.I<FirebaseMessaging>();
  final FlutterSecureStorage storage = FlutterSecureStorage();
  final box = GetStorage();
  u.User? user;
  bool _isLoggedIn = false;
  List<AreaClass> _areas = [];
  List<Office> _cities = [];
  SQLHelper bd = SQLHelper.instance;
  API api = API();
  bool get isLoggedIn => _isLoggedIn;
  List<AreaClass> get areas => _areas;
  List<Office> get cities => _cities;

  //Sets the value to the opposite
  void setIsLogged() {
    _isLoggedIn = !_isLoggedIn;
  }

  Future login(String email, String password, bool keepSign) async {
    try {
      var accessToken = await api.logInDb(email, password);
      _isLoggedIn = true;

      user = await api.getUserLogged();
      // If getUserLogged() returns -1, it means the user is admin
      if (user == -1) {
        return -1;
      }

      box.write('id', user!.id);

      String? aux_email = user!.email;

      // If checkbox is selected
      if (keepSign) {
        await bd.insertUser(
            user!.firstname, user!.id, user!.lastName, aux_email!);
      }

      // Load areas and cities data
      await loadAreasAndCities();
      notifyListeners();
      // Handle the successful login
      handleLoginSuccess();
      return accessToken;
    } catch (e, s) {
      if (e is UnauthoraziedExceptionClass) {
        print(e.message);
        throw (e);
      } else {
        // Handle other exceptions
        print('An error occurred: $e');
        print('STACK TRACE: $s');
      }
    }
  }

  Future<void> logout() async {
    user = null;
    _isLoggedIn = false;
    await api.logout();
    // Clear stored user data
    await storage.deleteAll();

    notifyListeners();
  }

  Future setUser() async {
    try {
      user = await bd.getUser();
    } catch (e) {
      user = null;
    }
  }

  Future<void> checkLoginStatus() async {
    String? jwtToken = await api.getToken();
    if (jwtToken != null) {
      // Retrieve other user data
      _isLoggedIn = true;
    } else {
      _isLoggedIn = false;
    }

    notifyListeners();
  }

  Future<void> loadAreasAndCities() async {
    SQLHelper db = SQLHelper.instance;
    Database bd = await SQLHelper.instance.database;
    _areas = await db.getAreas();
    List<AreaClass> aux_areas = await api.getAreas();
    int aux_areas_lenght = aux_areas.length;
    if (_areas.length != aux_areas_lenght) {
      await db.insertAreas(bd);
      _areas = await db.getAreas();
    }
    _cities = await db.getCities();
    List<Office> aux_offices = await api.getOffices();
    int aux_cities_lenght = aux_offices.length;
    if (_cities.length != aux_cities_lenght) {
      await db.insertCities(bd);
      _cities = await db.getCities();
    }
  }

  Future<SignInResult?> signInWithGoogle() async {
    //var baseUrl = 'backendpint-w3vz.onrender.com';
    var baseUrl = '10.0.2.2:8000';
    final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
    final GoogleSignInAuthentication? googleAuth =
        await googleUser?.authentication;
    print('googleUSER');
    print(googleUser);
    print('googleAUTH');
    print(googleAuth);
    final firebase.AuthCredential credential = GoogleAuthProvider.credential(
      accessToken: googleAuth?.accessToken,
      idToken: googleAuth?.idToken,
    );
    print('firebaseCred');
    print(credential);
    final UserCredential userCredential =
        await FirebaseAuth.instance.signInWithCredential(credential);

    // Get the ID token for the user
    String? idToken = await userCredential.user!.getIdToken();

    // Send the ID token to your backend
    final response = await http.post(
      Uri.http(baseUrl, '/api/auth/login_sso'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'idToken': idToken, 'provider': 'google'}),
    );

    if (response.statusCode == 200) {
      // Handle the response from the backend
      print("responseresponse from google SSO");
      print(response.body);

      // Load areas and cities data
      await loadAreasAndCities();
      notifyListeners();
      handleLoginSuccess();
      // Returning both the user and the response
      return SignInResult(
        user: userCredential.user,
        response: response,
      );
    } else {
      print('Failed to authenticate with backend');
      return null;
    }
  }

  Future<SignInResult?> signInWithFacebook() async {
    //var baseUrl = 'backendpint-w3vz.onrender.com';
    var baseUrl = '10.0.2.2:8000';

    final LoginResult result = await FacebookAuth.instance.login();

    final AuthCredential facebookAuthCredential =
        FacebookAuthProvider.credential(result.accessToken!.token);

    final UserCredential userCredential = await FirebaseAuth.instance
        .signInWithCredential(facebookAuthCredential);

    // Get the ID token for the user
    String? idToken = await userCredential.user!.getIdToken();

    // Send the ID token to your backend
    final response = await http.post(
      Uri.http(baseUrl, '/api/auth/login_sso'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'idToken': idToken,
        'provider': 'facebook',
      }),
    );

    if (response.statusCode == 200) {
      // Handle the response from the backend
      print(response.body);

      // Load areas and cities data
      await loadAreasAndCities();
      notifyListeners();
      handleLoginSuccess();
      // Returning both the user and the response
      return SignInResult(
        user: userCredential.user,
        response: response,
      );
    } else {
      print('Failed to authenticate with backend');
      return null;
    }
  }

  void handleLoginSuccess() async {
    String? fcmtoken =
        api.retrieveToken(); // Retrieve the token from local storage
    print('IAMHERE IN HANDLE HANDLE');
    print(fcmtoken);
    if (fcmtoken != null) {
      print('i am here inside ififififififiif');
      await api.sendTokenToServer(fcmtoken);
    } else {
      String? fcmtoken = await _firebaseMessaging.getToken();
      if (fcmtoken != null) {
        print("FCM Token: $fcmtoken");
        var tk = await api.getToken();
        print('AAAAAAAAAAAAAAA');
        print(tk);
        if (tk != null) {
          // Only send the token if the user is logged in
          API api = API();
          await api.sendTokenToServer(fcmtoken);
        } else {
          print("User is not logged in, skipping FCM token send.");
        }

        api.saveToken(fcmtoken); // Save the token locally regardless
      }
    }
  }
}

//
String generateAppSecretProof(String accessToken, String appSecret) {
  var key = utf8.encode(appSecret);
  var bytes = utf8.encode(accessToken);

  var hmacSha256 = Hmac(sha256, key);
  var digest = hmacSha256.convert(bytes);

  return digest.toString();
}
