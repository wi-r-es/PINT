import 'package:dev_icons/dev_icons.dart';
import 'package:flutter/material.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/db.dart';
import 'package:softshares/classes/officeClass.dart';

class SignUp extends StatefulWidget {
  SignUp({super.key, required this.cities});

  List<Office> cities;

  @override
  State<SignUp> createState() => _SignUpState();
}

class _SignUpState extends State<SignUp> {
  API api = API();
  SQLHelper bd = SQLHelper.instance;
  Map<String, int> citiesMap = {
    'Tomar': 1,
    'Viseu': 2,
    'Fundão': 3,
    'Portoalegre': 4,
    'Vila real': 5
  };
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController =
      TextEditingController();
  final TextEditingController firstNameController = TextEditingController();
  final TextEditingController lastNameController = TextEditingController();

  bool _isLoading = false;

  final _formKey = GlobalKey<FormState>();
  int? _selectedCity;

  @override
  void dispose() {
    super.dispose();
    emailController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    firstNameController.dispose();
    lastNameController.dispose();
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: myAppBar(context, colorScheme),
      body: Stack(
        children: [
          SingleChildScrollView(
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  const Padding(
                    padding: EdgeInsets.only(bottom: 30.0, top: 15.0),
                    child: Text(
                      'Sign In',
                      style: TextStyle(fontSize: 32),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 30.0, top: 10.0),
                    child: Column(
                      children: [
                        // facebookBtn(colorScheme),
                        // const SizedBox(
                        //   height: 25,
                        // ),
                        // googleBtn(colorScheme),
                        // const SizedBox(
                        //   height: 25,
                        // ),
                        // appleBtn(colorScheme),
                        //myDivider(colorScheme),
                        firstNameField(colorScheme),
                        lastNameField(colorScheme),
                        emailField(colorScheme),
                        cityField(colorScheme)
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10.0),
                    child: continueBtn(
                      colorScheme: Theme.of(context).colorScheme,
                      onContinue: () async {
                        if (_formKey.currentState!.validate()) {
                          setState(() {
                            _isLoading = true; // Show loading indicator
                          });

                          try {
                            // If the form is valid, continue to homepage
                            // Later, implement verification with DB
                            var response = await api.registerUser(
                              emailController.text,
                              firstNameController.text,
                              lastNameController.text,
                              _selectedCity!,
                            );
                            //print(response);
                            // Ensure response is not null
                            if (response != null) {
                              Navigator.pushNamed(context, '/SignIn');
                            } else {
                              // Handle null response here
                              _showErrorDialog(
                                  'Registration failed. Please try again.');
                            }
                          } catch (e) {
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
                  )
                ],
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

  Container emailField(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: TextFormField(
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Please enter email';
          }
          return null;
        },
        controller: emailController,
        decoration: InputDecoration(
            label: Text(
              'Email',
              style: TextStyle(color: colorScheme.onTertiary),
            ),
            prefixIcon: const Icon(
              Icons.account_circle,
              color: Color(0xFF49454F),
              size: 32,
            ),
            border: OutlineInputBorder(
                borderSide: BorderSide(color: colorScheme.onTertiary))),
      ),
    );
  }

  Container firstNameField(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: TextFormField(
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Please enter first name';
          }
          return null;
        },
        controller: firstNameController,
        decoration: InputDecoration(
            label: Text(
              'First name',
              style: TextStyle(color: colorScheme.onTertiary),
            ),
            border: OutlineInputBorder(
                borderSide: BorderSide(color: colorScheme.onTertiary))),
      ),
    );
  }

  Container lastNameField(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: TextFormField(
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Please enter last name';
          }
          return null;
        },
        controller: lastNameController,
        decoration: InputDecoration(
            label: Text(
              'Last name',
              style: TextStyle(color: colorScheme.onTertiary),
            ),
            border: OutlineInputBorder(
                borderSide: BorderSide(color: colorScheme.onTertiary))),
      ),
    );
  }

  Container cityField(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        border: Border.all(color: colorScheme.primary),
        borderRadius: BorderRadius.circular(7),
      ),
      child: DropdownButton<int>(
        isExpanded: true,
        hint: const Text('Select City'),
        underline: const SizedBox.shrink(),
        value: _selectedCity,
        items: citiesMap.entries.map((entry) {
          return DropdownMenuItem<int>(
            value: entry.value,
            child: Text(entry.key),
          );
        }).toList(),
        onChanged: (value) {
          setState(() {
            _selectedCity = value!;
            print(value);
          });
        },
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
          'OR ',
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
              backgroundColor: Colors.transparent,
              foregroundColor: colorScheme.onSecondary,
              side: BorderSide(color: colorScheme.onTertiary),
              elevation: 0),
          onPressed: () {},
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
              )
            ],
          )),
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
              elevation: 0),
          onPressed: () {},
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
              )
            ],
          )),
    );
  }

  Container appleBtn(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.only(left: 20, right: 20),
      height: 55,
      child: ElevatedButton(
          style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              foregroundColor: colorScheme.onSecondary,
              side: BorderSide(color: colorScheme.onTertiary),
              elevation: 0),
          onPressed: () /*async */ {},
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Icon(
                Icons.apple,
              ),
              SizedBox(
                width: 8,
              ),
              Text(
                'Continue with Apple',
                textAlign: TextAlign.center,
              )
            ],
          )),
    );
  }

  AppBar myAppBar(BuildContext context, ColorScheme colorScheme) {
    return AppBar(
      backgroundColor: Colors.transparent,
      centerTitle: true,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back),
        onPressed: () => {Navigator.pop(context)},
      ),
      title: RichText(
        text: TextSpan(
            text: 'Soft',
            style: TextStyle(color: colorScheme.onSecondary, fontSize: 36),
            children: <TextSpan>[
              TextSpan(
                  text: 'Shares',
                  style: TextStyle(color: colorScheme.secondary, fontSize: 36))
            ]),
      ),
    );
  }
}
