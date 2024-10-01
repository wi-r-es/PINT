import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../classes/ThemeNotifier.dart';

class SettingsPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Settings'),
      ),
      body: Center(
        child: Consumer<ThemeNotifier>(
          builder: (context, themeNotifier, child) {
            return SwitchListTile(
              title: Text('Dark Mode'),
              value: themeNotifier.isDarkMode,
              onChanged: (value) {
                themeNotifier.toggleTheme();
              },
            );
          },
        ),
      ),
    );
  }
}
