import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:softshares/Components/POICard.dart';
import 'package:softshares/Components/bottomNavBar.dart';
import 'package:softshares/Components/drawer.dart';
import 'package:softshares/Components/eventCard.dart';
import 'package:softshares/Components/forumCard.dart';
import 'package:softshares/Components/publicationCard.dart';
import 'package:softshares/Pages/signIn.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/db.dart';
import 'package:softshares/classes/event.dart';
import 'package:softshares/classes/forums.dart';
import 'package:softshares/classes/publication.dart';
import '../Components/appBar.dart';
import '../classes/user.dart';

class MyProfile extends StatefulWidget {
  MyProfile({super.key, required this.areas, required this.user});
  List<AreaClass> areas;
  User user;

  @override
  State<MyProfile> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyProfile> {
  SQLHelper bd = SQLHelper.instance;
  API api = API();
  List<Publication> myPubs = [];
  List<Event> registerEvents = [];

  void rightCallback(context) {
    Navigator.pushNamed(context, '/settings');
  }

  Future getPosts() async {
    var data = await api.getUserPosts();
    myPubs = data;
    print(myPubs.length);
  }

  Future getRegisteredEvents() async {
    var data = await api.getUserRegistered();
    registerEvents = data;
    print(registerEvents.length);
  }

  void logOff() {
    showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (context) {
          return AlertDialog(
            title: const Text('Log Off?'),
            content: const Text('Are you sure you want to log off?'),
            actions: [
              TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  child: const Text('Cancel')),
              TextButton(
                  onPressed: () async {
                    await bd.logOff();
                    Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const SignIn()));
                  },
                  child: const Text('Log Off'))
            ],
          );
        });
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: MyAppBar(
        iconR: const Icon(Icons.settings),
        rightCallback: rightCallback,
        title: 'Profile',
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            profilePicture(colorScheme),
            const SizedBox(height: 10),
            userInfo(colorScheme),
            const SizedBox(height: 15),
            actionBtns(colorScheme),
            const SizedBox(height: 15),
            DefaultTabController(
              length: 2,
              child: Column(
                children: [
                  TabBar(
                    labelColor: colorScheme.onPrimary,
                    indicatorColor: colorScheme.secondary,
                    splashFactory: NoSplash.splashFactory,
                    tabs: [
                      Tab(
                        child: Text(
                          'My Publications',
                          style: TextStyle(color: colorScheme.onSecondary),
                        ),
                      ),
                      Tab(
                        child: Text(
                          'Registered Events',
                          style: TextStyle(color: colorScheme.onSecondary),
                        ),
                      ),
                    ],
                  ),
                  // Wrap TabBarView in a Container with a fixed height
                  Container(
                    height: 400, // Adjust the height as needed
                    child: TabBarView(
                      children: [
                        // Placeholder for my posts
                        myPosts(colorScheme),
                        // Placeholder for registered events
                        myRegistered(colorScheme)
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      drawer: myDrawer(areas: widget.areas),
      bottomNavigationBar: const MyBottomBar(),
    );
  }

  Widget myPosts(ColorScheme colorScheme) {
    return Padding(
      padding: const EdgeInsets.all(18.0),
      child: FutureBuilder(
        future: getPosts(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            if (myPubs.isEmpty) {
              return Center(
                  child: Text('No posts available',
                      style: TextStyle(color: colorScheme.onSecondary)));
            }

            return ListView.builder(
              itemCount: myPubs.length,
              itemBuilder: (context, index) {
                final pub = myPubs[index];

                if (pub is Event) {
                  return EventCard(event: pub, areas: widget.areas);
                } else if (pub is Forum) {
                  return ForumCard(forum: pub, areas: widget.areas);
                } else if (pub is Publication) {
                  if (pub.type! == 'P') {
                    return POICard(pointOfInterest: pub, areas: widget.areas);
                  } else {
                    return PublicationCard(pub: pub, areas: widget.areas);
                  }
                } else {
                  return SizedBox.shrink(); // Handle unexpected types
                }
              },
            );
          } else {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }
        },
      ),
    );
  }

  Widget myRegistered(ColorScheme colorScheme) {
    return Padding(
      padding: const EdgeInsets.all(18.0),
      child: FutureBuilder(
        future: getRegisteredEvents(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            print(registerEvents.length);
            if (registerEvents.isEmpty) {
              return Center(
                  child: Text('No registered events',
                      style: TextStyle(color: colorScheme.onSecondary)));
            }

            return ListView.builder(
              itemCount: registerEvents.length,
              itemBuilder: (context, index) {
                final pub = registerEvents[index];

                return EventCard(event: pub, areas: widget.areas);
              },
            );
          } else {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }
        },
      ),
    );
  }

  Row actionBtns(ColorScheme colorScheme) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        ElevatedButton(
            onPressed: () {
              Navigator.pushNamed(context, '/Editprofile');
            },
            style: ButtonStyle(
                elevation: MaterialStateProperty.all(0),
                backgroundColor: MaterialStateProperty.all(Colors.transparent),
                foregroundColor:
                    MaterialStateProperty.all(colorScheme.secondary),
                shape: MaterialStateProperty.all(RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(color: colorScheme.secondary)))),
            child: const Text('Edit Profile')),
        ElevatedButton(
            onPressed: () {
              logOff();
            },
            style: ButtonStyle(
                elevation: MaterialStateProperty.all(0),
                backgroundColor: MaterialStateProperty.all(Colors.transparent),
                foregroundColor:
                    MaterialStateProperty.all(colorScheme.secondary),
                shape: MaterialStateProperty.all(RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(color: colorScheme.secondary)))),
            child: const Text('Log off')),
      ],
    );
  }

  Column userInfo(ColorScheme colorScheme) {
    return Column(
      children: [
        Text(
          '${widget.user.firstname} ${widget.user.lastName}',
          style: TextStyle(fontSize: 24, color: colorScheme.secondary),
        ),
        const SizedBox(
          height: 5,
        ),
        const SizedBox(
          height: 2,
        ),
      ],
    );
  }

  Container profilePicture(ColorScheme colorScheme) {
    return Container(
      child: Center(
        child: Container(
          margin: const EdgeInsets.only(top: 30),
          height: 170,
          width: 170,
          decoration: BoxDecoration(
              border: Border.all(color: colorScheme.secondary, width: 3),
              borderRadius: BorderRadius.circular(95)),
          child: Center(
            child: Container(
                height: 150,
                width: 150,
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(75),
                    color: colorScheme.secondary),
                child: Center(
                  child: Text(
                    widget.user.firstname[0],
                    style:
                        TextStyle(fontSize: 54, color: colorScheme.onPrimary),
                  ),
                )),
          ),
        ),
      ),
    );
  }
}
