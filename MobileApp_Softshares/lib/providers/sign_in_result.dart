import 'package:firebase_auth/firebase_auth.dart' as firebase;
import 'package:http/http.dart' as http;

class SignInResult {
  final firebase.User? _user;
  final http.Response _response;

  // Constructor
  SignInResult({required firebase.User? user, required http.Response response})
      : _user = user,
        _response = response;

  // Getters
  firebase.User? get user => _user;
  http.Response get response => _response;

  // Optionally, you can add more specific getters if needed
  int get responseStatusCode => _response.statusCode;
  String get responseBody => _response.body;
}
