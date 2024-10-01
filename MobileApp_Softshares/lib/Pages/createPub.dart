import 'dart:io';
import 'package:softshares/Pages/createPubs/eventContent.dart';
import 'package:softshares/Pages/createPubs/forumContent.dart';
import 'package:softshares/Pages/createPubs/poiContent.dart';
import 'package:softshares/Pages/createPubs/postContent.dart';
import 'package:flutter/material.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/user.dart';

class createPost extends StatefulWidget {
  createPost({super.key, required this.areas});

  List<AreaClass> areas;

  @override
  State<createPost> createState() => _CreatePostState();
}

//Change to current user
User user1 = User(1, 'John', 'Doe', 'john.doe@example.com');

class _CreatePostState extends State<createPost> {
  final API api = API();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: appBar(context, colorScheme),
      body: DefaultTabController(
        length: 4,
        child: Column(
          children: [
            TabBar(
              unselectedLabelColor: colorScheme.onSecondary,
              labelColor: colorScheme.onSecondary,
              indicatorColor: colorScheme.primary,
              tabs: const [
                Tab(child: Text('Events')),
                Tab(child: Text('Forums')),
                Tab(child: Text('POI')),
                Tab(child: Text('Posts')),
              ],
            ),
            Expanded(
              child: TabBarView(
                children: [
                  EventCreation(areas: widget.areas),
                  ForumCreation(areas: widget.areas),
                  POICreation(areas: widget.areas),
                  PostCreation(areas: widget.areas)
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  AppBar appBar(BuildContext context, ColorScheme colorScheme) {
    return AppBar(
      backgroundColor: colorScheme.primary,
      foregroundColor: colorScheme.onPrimary,
      leading: IconButton(
        icon: const Icon(Icons.close),
        onPressed: () {
          Navigator.pop(context);
        },
      ),
      title: const Text('Create Publication'),
    );
  }




}
