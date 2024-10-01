import 'package:flutter/material.dart';

const lightColorScheme = ColorScheme(
    brightness: Brightness.light,
    primary: Color(0xff80ADD7),
    onPrimary: Colors.white,
    secondary: Color(0xff00C2FF),
    onSecondary: Colors.black,
    error: Colors.red,
    onError: Colors.black,
    background: Colors.white,
    onBackground: Colors.black,
    surface: Color(0xFFFEF7FF),
    onSurface: Colors.black,
    onTertiary: Color.fromARGB(255, 65, 64, 66),
    primaryContainer: Color.fromARGB(220, 194, 230, 253));

const darkColorScheme = ColorScheme(
  brightness: Brightness.dark,
  primary: Color.fromARGB(255, 50, 63, 75),
  onPrimary: Colors.white,
  secondary: Color.fromARGB(255, 80, 128, 143),
  onSecondary: Colors.white,
  error: Colors.redAccent,
  onError: Colors.white,
  background: Color(0xFF121212),
  onBackground: Colors.white,
  surface: Color(0xFF1E1E1E),
  onSurface: Colors.white,
  onTertiary: Color.fromARGB(255, 77, 97, 104),
  primaryContainer: Color.fromARGB(255, 71, 104, 114),
);

class ThemeNotifier with ChangeNotifier {
  bool _isDarkMode = true;

  ThemeData get themeData => _isDarkMode
      ? ThemeData.from(colorScheme: darkColorScheme)
      : ThemeData.from(colorScheme: lightColorScheme);

  bool get isDarkMode => _isDarkMode;

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
  }
}
