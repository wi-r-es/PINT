import 'package:flutter/material.dart';
import 'package:softshares/Components/appBar.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import '../classes/PasswordReuseExceptionClass.dart';

class Recovery extends StatefulWidget {
  const Recovery({super.key});

  @override
  State<Recovery> createState() => _RecoveryState();
}

class _RecoveryState extends State<Recovery> {
  TextEditingController tokenCx = TextEditingController();
  TextEditingController newPassCx = TextEditingController();
  TextEditingController confirmPasslCx = TextEditingController();
  API api = API();
  bool hidePassword = true;
  bool hideConfirm = true;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: myAppBar(colorScheme),
      body: SingleChildScrollView(
        child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Padding(
                    padding: EdgeInsets.only(bottom: 18.0),
                    child: Text(
                      'Recover password',
                      style: TextStyle(fontSize: 32),
                    ),
                  ),
                  tokenTextfield(colorScheme),
                  newPassTextfield(colorScheme),
                  newPassConfirmTextfield(colorScheme),
                  continueBtn(
                      colorScheme: colorScheme,
                      onContinue: () async {
                        try {
                          if (newPassCx.text == confirmPasslCx.text) {
                            bool flag = await api.passwordReset(
                                tokenCx.text, newPassCx.text);

                            if (flag) {
                              _showErrorDialog('Passwords reset successfull.');
                              Navigator.pushNamed(context, '/SignIn');
                            } else {
                              _showErrorDialog('Passwords are not the same.');
                            }
                          }
                        } on PasswordReuseExceptionClass catch (e) {
                          _showErrorDialog(e.message);
                        } catch (e, s) {
                          print('inside getUserifo $e');
                          print('Stack trace:\n $s');
                          rethrow;
                        }
                      })
                ],
              ),
            )),
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
          foregroundColor: colorScheme.onPrimary,
          backgroundColor: colorScheme.primary,
        ),
        onPressed: onContinue,
        child: const Text('Continue'),
      ),
    );
  }

  AppBar myAppBar(ColorScheme colorScheme) {
    return AppBar(
      centerTitle: true,
      leading: IconButton(
        onPressed: () {
          Navigator.pop(context);
        },
        icon: Icon(Icons.arrow_back),
      ),
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
    );
  }

  Container tokenTextfield(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: TextFormField(
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Please enter token';
          }
          return null;
        },
        controller: tokenCx,
        decoration: InputDecoration(
          label: Text(
            'Token',
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

  Container newPassTextfield(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: TextFormField(
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Please enter new password';
          }
          return null;
        },
        controller: newPassCx,
        decoration: InputDecoration(
          label: Text(
            'New password',
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

  Container newPassConfirmTextfield(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: TextFormField(
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Please enter again';
          }
          return null;
        },
        controller: confirmPasslCx,
        decoration: InputDecoration(
          label: Text(
            'New password',
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
}
