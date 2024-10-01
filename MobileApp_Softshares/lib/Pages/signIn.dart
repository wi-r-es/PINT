import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:provider/provider.dart';
import 'package:dev_icons/dev_icons.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/unauthoraziedExceptionClass.dart';
import 'package:softshares/classes/user.dart';
import 'package:softshares/providers/auth_provider.dart';
import '../providers/sign_in_result.dart';

class SignIn extends StatefulWidget {
  const SignIn({super.key});

  @override
  State<SignIn> createState() => _SignInState();
}

class _SignInState extends State<SignIn> {
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  API api = API();
  final box = GetStorage();
  final _formkey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool hidePassword = true;
  bool loginFailed = false;
  bool keepLog = false;

  bool validInput() {
    if (usernameController.text == '' || passwordController.text == '') {
      return false;
    }
    return true;
  }

  @override
  void dispose() {
    super.dispose();
    usernameController.dispose();
    passwordController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: myAppBar(colorScheme),
      body: Stack(
        children: [
          SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formkey,
                child: Column(
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(bottom: 18.0),
                      child: Text(
                        'Log In',
                        style: TextStyle(fontSize: 32),
                      ),
                    ),
                    Column(
                      children: [
                        facebookBtn(colorScheme),
                        const SizedBox(height: 25),
                        googleBtn(colorScheme),
                        const SizedBox(height: 25),
                        //appleBtn(colorScheme),
                        myDivider(colorScheme),
                        userTextfield(colorScheme),
                        passwordFieldtext(colorScheme),
                        Row(
                          children: <Widget>[
                            Checkbox(
                              value: keepLog,
                              onChanged: (value) {
                                if (value != null) {
                                  setState(() {
                                    keepLog = value;
                                  });
                                }
                              },
                            ),
                            const Text(
                              'Keep me signed',
                              style: TextStyle(fontSize: 18),
                            ),
                          ],
                        ),
                        Align(
                            alignment: Alignment.centerLeft,
                            child: TextButton(
                              onPressed: () {
                                Navigator.pushNamed(context, '/emailRecover');
                              },
                              child: Text(
                                'Forgot password?',
                                style: TextStyle(
                                  color: colorScheme.onPrimary,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ))
                      ],
                    ),
                    continueBtn(
                      colorScheme: Theme.of(context).colorScheme,
                      onContinue: () async {
                        if (_formkey.currentState!.validate()) {
                          setState(() {
                            _isLoading = true; // Show loading indicator
                          });

                          try {
                            // If the form is valid, continue to homepage

                            var jwtToken = await authProvider.login(
                                usernameController.text,
                                passwordController.text,
                                keepLog);
                            if (jwtToken == -1) {
                              _showErrorDialog('Admin cannot login in the app');
                            } else if (jwtToken != null) {
                              AuthProvider().login(usernameController.text,
                                  passwordController.text, keepLog);
                              Navigator.pushNamed(context, '/home');
                            } else {
                              // Handle null response here
                              print('inside jwt check error');
                              print(jwtToken);
                              setState(() {
                                loginFailed = true;
                              });
                              // _showErrorDialog(
                              //     'Login failed. Please try again.');
                            }
                          } catch (e) {
                            if (e is UnauthoraziedExceptionClass) {
                              print(e.message);
                              setState(() {
                                loginFailed = true;
                              });
                              // _showErrorDialog(
                              //     'Wrong Credentials. Please try again.');
                            } else
                              // Handle any exceptions
                              _showErrorDialog('An error occurred: $e');
                          } finally {
                            setState(() {
                              _isLoading = false; // Hide loading indicator
                            });
                          }
                        }
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Container continueBtn({
    required ColorScheme colorScheme,
    required VoidCallback onContinue,
  }) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(left: 20, right: 20),
      height: 45,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          foregroundColor: Colors.white,
          backgroundColor: colorScheme.primary,
        ),
        onPressed: onContinue,
        child: const Text('Continue'),
      ),
    );
  }

  Container passwordFieldtext(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: TextFormField(
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Please enter password';
          }
          return null;
        },
        obscureText: hidePassword,
        controller: passwordController,
        decoration: InputDecoration(
          errorText: loginFailed ? 'Invalid Username or Password' : null,
          label: Text(
            'password',
            style: TextStyle(color: colorScheme.onTertiary),
          ),
          prefixIcon: Icon(
            Icons.password,
            color: colorScheme.onTertiary,
            size: 32,
          ),
          suffixIcon: IconButton(
            onPressed: () {
              setState(() {
                hidePassword = !hidePassword;
              });
            },
            icon: hidePassword
                ? const Icon(Icons.visibility_off)
                : const Icon(Icons.visibility),
          ),
          border: OutlineInputBorder(
            borderSide: BorderSide(color: colorScheme.onTertiary),
          ),
        ),
      ),
    );
  }

  Container userTextfield(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: TextFormField(
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Please enter email';
          }
          return null;
        },
        controller: usernameController,
        decoration: InputDecoration(
          errorText: loginFailed ? 'Invalid Username or Password' : null,
          label: Text(
            'Email',
            style: TextStyle(color: colorScheme.onTertiary),
          ),
          prefixIcon: Icon(
            Icons.account_circle,
            color: colorScheme.onTertiary,
            size: 32,
          ),
          border: OutlineInputBorder(
            borderSide: BorderSide(color: colorScheme.onTertiary),
          ),
        ),
      ),
    );
  }

  Row myDivider(ColorScheme colorScheme) {
    return Row(
      children: [
        Expanded(
          child: Divider(
            height: 50,
            thickness: 1,
            indent: 25,
            endIndent: 15, // Adjust endIndent as needed
            color: colorScheme.onTertiary,
          ),
        ),
        const SizedBox(width: 2),
        const Text(
          'OR',
          style: TextStyle(fontSize: 18),
        ),
        const SizedBox(width: 2), // Add space between dividers
        Expanded(
          child: Divider(
            height: 50,
            thickness: 1,
            indent: 15, // Adjust indent as needed
            endIndent: 25,
            color: colorScheme.onTertiary,
          ),
        ),
      ],
    );
  }

  Container googleBtn(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.only(left: 20, right: 20),
      height: 55,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          foregroundColor: colorScheme.onSecondary,
          backgroundColor: Colors.transparent,
          side: BorderSide(color: colorScheme.onTertiary),
          elevation: 0,
        ),
        onPressed: () async {
          final result = await AuthProvider().signInWithGoogle();

          print('onGooglePressed');
          print(result?.user);
          print(result?.response.body);

          var jsonData = jsonDecode(result!.response.body);

          var jwtToken = await api.loginGoogle(jsonData);

          if (jwtToken == -1) {
            _showErrorDialog('Admin cannot login in the app');
          } else if (jwtToken != null) {
            // AuthProvider().login(usernameController.text,
            //     passwordController.text, keepLog);
            var user = await api.getUserLogged();
            if (user != null) {
              box.write('id', user!.id);
            }
            print('we got here!');
            Navigator.pushNamed(context, '/chooseCity');
          } else {
            // Handle null response here
            _showErrorDialog('Login failed. Please try again.');
          }
        },
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Icon(
              DevIcons.googlePlain,
              size: 20,
            ),
            SizedBox(
              width: 8,
            ),
            Text(
              'Continue with Google',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Container facebookBtn(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.only(left: 20, right: 20),
      height: 55,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: colorScheme.onSecondary,
          side: BorderSide(color: colorScheme.onTertiary),
          elevation: 0,
        ),
        onPressed: () async {
          final result = await AuthProvider().signInWithFacebook();

          print('onfacebookPressed');
          print(result?.user);
          print(result?.response.body);

          var jsonData = jsonDecode(result!.response.body);

          var jwtToken = await api.loginGoogle(jsonData);

          if (jwtToken == -1) {
            _showErrorDialog('Admin cannot login in the app');
          } else if (jwtToken != null) {
            // AuthProvider().login(usernameController.text,
            //     passwordController.text, keepLog);
            var user = await api.getUserLogged();
            if (user != null) {
              box.write('id', user!.id);
            }
            print('we got here!');
            Navigator.pushNamed(context, '/chooseCity');
          } else {
            // Handle null response here
            _showErrorDialog('Login failed. Please try again.');
          }
        },
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Icon(
              Icons.facebook,
            ),
            SizedBox(
              width: 8,
            ),
            Text(
              'Continue with Facebook',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Container appleBtn(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.only(left: 20, right: 20),
      height: 55,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          foregroundColor: colorScheme.onSecondary,
          backgroundColor: Colors.transparent,
          side: BorderSide(color: colorScheme.onTertiary),
          elevation: 0,
        ),
        onPressed: () {},
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Icon(
              DevIcons.appleOriginal,
              size: 20,
            ),
            SizedBox(
              width: 8,
            ),
            Text(
              'Continue with Apple',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  AppBar myAppBar(ColorScheme colorScheme) {
    return AppBar(
      centerTitle: true,
      leading: Container(),
      title: RichText(
        text: TextSpan(
          text: 'Soft',
          style: TextStyle(color: colorScheme.onSecondary, fontSize: 36),
          children: <TextSpan>[
            TextSpan(
              text: 'Shares',
              style: TextStyle(color: colorScheme.secondary, fontSize: 36),
            ),
          ],
        ),
      ),
      backgroundColor: Colors.transparent,
      actions: [
        IconButton(
          onPressed: () => Navigator.pushNamed(context, '/SignUp'),
          icon: const Icon(
            Icons.person_add,
            size: 32,
          ),
        ),
      ],
    );
  }
}
