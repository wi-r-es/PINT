import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';
import 'package:softshares/classes/db.dart';
import 'package:softshares/classes/user.dart';
import 'package:softshares/providers/auth_provider.dart';

class MyLoginIn extends StatefulWidget {
  MyLoginIn({super.key, required this.user});

  final User user;

  @override
  State<MyLoginIn> createState() => _MyLoginInState();
}

class _MyLoginInState extends State<MyLoginIn> {
  int hour = DateTime.now().hour;
  SQLHelper bd = SQLHelper.instance;

  late String msg;

  void greeting() {
    if (hour > 6 && hour < 12) {
      msg = 'Good morning ${widget.user.firstname}';
    } else {
      msg = 'Good evening ${widget.user.firstname}';
    }
  }

  @override
  void initState() {
    super.initState();
    greeting();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: titleWidget(colorScheme),
      body: Padding(
        padding: const EdgeInsets.only(top: 65.0, bottom: 40),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              actionsInfo(context, colorScheme),
              continueBtn(context, colorScheme)
            ],
          ),
        ),
      ),
    );
  }

  Container continueBtn(BuildContext context, ColorScheme colorScheme) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(left: 20, right: 20),
      height: 45,
      child: ElevatedButton(
          style: ElevatedButton.styleFrom(
            foregroundColor: colorScheme.onPrimary,
            backgroundColor: colorScheme.primary,
          ),
          onPressed: () async => {
            //Load areas to provider
            await context.read<AuthProvider>().loadAreasAndCities(),
            context.read<AuthProvider>().setUser(), 
            Navigator.pushNamed(context, '/home')},
          child: const Text('Continue')),
    );
  }

  Column actionsInfo(context, ColorScheme colorScheme) {
    return Column(
      children: [
        Icon(
          Icons.account_circle,
          color: colorScheme.primary,
          size: 180,
        ),
        const SizedBox(
          height: 20,
        ),
        Text(
          msg,
          style: TextStyle(fontSize: 32, color: colorScheme.onSecondary),
          textAlign: TextAlign.center,
        ),
        const SizedBox(
          height: 30,
        ),
        const Text('Not your account?'),
        ElevatedButton(
            onPressed: () async => {
              Navigator.pushNamed(context, '/SignIn')
              },
            style: ButtonStyle(
                elevation: MaterialStateProperty.all(0),
                backgroundColor: MaterialStateProperty.all(Colors.transparent),
                foregroundColor: MaterialStateProperty.all(Colors.blue)),
            child: const Text('Log in with another account')),
      ],
    );
  }

  AppBar titleWidget(ColorScheme colorScheme) {
    return AppBar(
      centerTitle: true,
      leading: const Icon(null),
      backgroundColor: Colors.transparent,
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
