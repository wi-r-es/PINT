// ignore: file_names
import 'package:flutter/material.dart';

class MyBottomBar extends StatelessWidget {
  const MyBottomBar({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return BottomNavigationBar(
      fixedColor: colorScheme.onSecondary,
      showUnselectedLabels: true,
      showSelectedLabels: true,
      unselectedItemColor: colorScheme.onSecondary,
      items: [
        BottomNavigationBarItem(
          icon: IconButton(
            onPressed: () {
              Navigator.pushNamed(context, '/PointOfInterest');
            },
            icon: const Icon(Icons.pin_drop),
          ),
          label: 'POI',
        ),
        BottomNavigationBarItem(
          icon: IconButton(
            icon: const Icon(
              Icons.add,
            ),
            onPressed: () {
              Navigator.pushNamed(context, '/createPost');
            },
          ),
          label: 'Add',
        ),
        BottomNavigationBarItem(
          icon: IconButton(
            onPressed: () {
              Navigator.pushNamed(context, '/home');
            },
            icon: const Icon(Icons.home),
          ),
          label: 'Home',
        ),
        // BottomNavigationBarItem(
        //   icon: IconButton(
        //     onPressed: () {
        //       Navigator.pushNamed(context, '/notifications');
        //     },
        //     icon: const Icon(Icons.notifications),
        //   ),
        //   label: 'Notifications',
        // ),
      ],
    );
  }
}
