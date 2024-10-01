import 'package:flutter/material.dart';
import 'package:softshares/Components/appBar.dart';
import 'package:softshares/Components/bottomNavBar.dart';
import 'package:softshares/Components/drawer.dart';
import 'package:softshares/Components/formAppBar.dart';
import 'package:softshares/classes/areaClass.dart';
import '../classes/notifications.dart';

class Notifications extends StatefulWidget {
  Notifications({super.key, required this.areas});
  List<AreaClass> areas;
  @override
  State<Notifications> createState() => _NotificationsState();
}

class _NotificationsState extends State<Notifications> {
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        backgroundColor: colorScheme.primary,
        foregroundColor: colorScheme.onPrimary,
        title: Text('Notifications'),
      ),
      drawer: myDrawer(areas: widget.areas,),
      body: Center(
        child: Text('To be implemented'),
      ),
      bottomNavigationBar: MyBottomBar(),
    );
  }
}
