import 'package:flutter/material.dart';

//********************************************************************//
//* To call this widget, it's necessary to pass 2 icons and 1 string *//
//********************************************************************//

// ignore: must_be_immutable
class MyAppBar extends StatelessWidget implements PreferredSizeWidget {
  Icon? iconR, iconL;
  String title;
  final void Function(BuildContext)? leftCallback;
  void Function(BuildContext) rightCallback;

  MyAppBar(
      {super.key,
      required this.iconR,
      required this.title,
      this.iconL,
      this.leftCallback,
      required this.rightCallback});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return AppBar(
      backgroundColor: colorScheme.primary,
      foregroundColor: colorScheme.onPrimary,
      title: Text(title),
      actions: [
        //If Right icon exists, create button
        if (iconL != null)
          IconButton(
              onPressed: () {
                if (leftCallback != null) {
                  leftCallback!(context);
                }
              },
              icon: iconL!),
        IconButton(
            onPressed: () {
              rightCallback!(context);
            },
            icon: iconR!)
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
