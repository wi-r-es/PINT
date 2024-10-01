import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:provider/provider.dart';
import 'package:softshares/Components/bottomNavBar.dart';
import 'package:softshares/Components/drawer.dart';
import 'package:softshares/Components/eventCard.dart';
import 'package:softshares/Components/publicationCard.dart';
import 'package:softshares/classes/event.dart';
import 'package:softshares/classes/forums.dart';
import 'package:softshares/classes/publication.dart';
import 'package:softshares/providers/auth_provider.dart';
import '../Components/appBar.dart';
import '../Components/forumCard.dart';
import '../classes/ClasseAPI.dart';
import '../classes/areaClass.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class MyHomePage extends StatefulWidget {
  MyHomePage({super.key, required this.areas});
  List<AreaClass> areas;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  //firebase
  late FirebaseMessaging messaging;
  String message = "No notifications";

  List<Publication> posts = [];
  final API api = API();
  final ScrollController _scrollController = ScrollController();
  //Variable to store future function
  late Future<void> futurePosts;
  final box = GetStorage();

  //Fetch posts from server
  Future<void> getPosts() async {
    try {
      var data = await api.getAllPosts();
      setState(() {
        posts = data;
        futurePosts =
            Future.value(posts); // Update futurePosts with the latest data
      });
    } catch (e) {
      setState(() {
        futurePosts = Future.error(
            e); // Handle errors and update the future with an error
      });
    }
  }

  void leftCallback(context) {
    print('Notifications');
  }

  @override
  void initState() {
    super.initState();
    futurePosts = getPosts();
    _scrollController.addListener(() {
      //If user tries to scroll up when on top of lastest post
      //try to refresh posts
      setState(() {
        futurePosts = getPosts(); // Trigger refresh when scrolled to the top
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: MyAppBar(
        iconR: const Icon(Icons.notifications),
        rightCallback: (context) {
          Navigator.pushNamed(context, '/notices');
        },
        title: 'Homepage',
      ),
      body: FutureBuilder(
        future: futurePosts,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            //Handles fetching posts errors
            if (snapshot.hasError) {
              return (Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.cloud_off),
                    const Text(
                        'Failed connection to server. Please check your connection'),
                    const SizedBox(
                      height: 20,
                    ),
                    ElevatedButton(
                        onPressed: () async {
                          setState(() {
                            futurePosts = getPosts();
                          });
                        },
                        child: const Text('Try again'))
                  ],
                ),
              ));
            }
            return RefreshIndicator(
              onRefresh: getPosts,
              child: (ListView.builder(
                  itemCount: posts.length,
                  itemBuilder: (context, index) {
                    final pub = posts[index];
                    switch (pub) {
                      case Event _:
                        return EventCard(event: pub, areas: widget.areas);
                      case Forum _:
                        return ForumCard(forum: pub, areas: widget.areas);
                      case Publication _:
                        return PublicationCard(pub: pub, areas: widget.areas);
                    }
                  })),
            );
          } else {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }
        },
      ),
      drawer: myDrawer(
        areas: widget.areas,
      ),
      bottomNavigationBar: const MyBottomBar(),
    );
  }
}
