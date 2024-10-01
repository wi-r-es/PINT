import 'package:flutter/material.dart';
import 'package:softshares/Components/appBar.dart';
import 'package:softshares/Components/bottomNavBar.dart';
import 'package:softshares/Components/drawer.dart';
import 'package:softshares/Components/eventCard.dart';
import 'package:softshares/Components/forumCard.dart';
import 'package:softshares/Components/publicationCard.dart';
import 'package:softshares/Pages/filterPostsPage.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/event.dart';
import 'package:softshares/classes/forums.dart';
import 'package:softshares/classes/publication.dart';

// ignore: must_be_immutable
class Area extends StatefulWidget {
  final String title;
  List<AreaClass> areas;
  Area({super.key, required this.title, required this.areas});

  @override
  State<Area> createState() => _MyAreaState();
}

class _MyAreaState extends State<Area> {
  List<Publication> allPubs = [];
  final API api = API();
  String type = 'forums';
  bool loaded = false;
  Map<String, dynamic> filters = {};

  Future<void> getPubs(String type, Map<String, dynamic> filters) async {
    allPubs = [];
    loaded = false;
    print('Filters: ${filters.containsKey('rating')}');
    print('Price: ${filters.containsKey('price')}');
    print('Null: ${filters['rating'] != null}');

    // Get specific area
    AreaClass area =
        widget.areas.firstWhere((area) => area.areaName == widget.title);

    // Get type of publications from specific area
    var data = await api.getAllPubsByArea(area.id, type);

    if ((type == 'posts' || type == 'events') && filters.isNotEmpty) {
      // Initialize a set to track seen publications and avoid duplicates
      Set<Publication> seenPubs = {};

      if (filters.containsKey('price') && filters['price'] != null) {
        var filterPrices = filters['price'] as List<dynamic>;
        filterPrices = filterPrices.map((price) => price.toString()).toList();

        data.forEach((pub) {
          print(pub.price);
          if (pub.price != null &&
              filterPrices.contains(pub.price!.toInt().toString())) {
            seenPubs.add(pub);
          } else if (filterPrices.contains('None') && pub.price == null) {
            seenPubs.add(pub);
          }
        });
      }

      // Filter by rating
      if (filters.containsKey('rating') && filters['rating'] != null) {
        print('HERE');
        var filterRatings = filters['rating'] as List<dynamic>;
        filterRatings =
            filterRatings.map((rating) => rating.toString()).toList();

        Set<Publication> tempPubs = {};

        data.forEach((pub) {
          print(pub.aval);
          if (pub.aval != null &&
              filterRatings.contains(pub.aval!.toInt().toString())) {
            tempPubs.add(pub);
          } else if (filterRatings.contains('None') && pub.aval == 0.0) {
            tempPubs.add(pub);
          }
        });

        seenPubs = tempPubs;
      }

      allPubs = seenPubs.toList();
    } else {
      allPubs = data;
    }
  }

  @override
  void initState() {
    super.initState();
    getPubs(type, filters);
  }

  void _onTabChanged(int index) {
    setState(() {
      switch (index) {
        case 0:
          type = 'forums';
          break;
        case 1:
          type = 'events';
          break;
        case 2:
          type = 'posts';
          break;
      }
      getPubs(type, filters); // Fetch data when tab changes
    });
  }

  void rigthCallBack(context) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FilterPage(
          filters: filters,
        ),
      ),
    );

    if (result != null && result is Map<String, dynamic>) {
      print('Received filters: $result');

      if (result.entries.isNotEmpty) {
        filters['rating'] = result['rating'];
        filters['price'] = result['price'];
      } else {
        filters = {};
      }

      setState(() {
        getPubs(type, filters);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: MyAppBar(
        iconR: const Icon(Icons.filter_alt),
        rightCallback: rigthCallBack,
        title: widget.title,
      ),
      body: DefaultTabController(
        length: 3,
        child: Column(
          children: [
            TabBar(
              labelColor: colorScheme.onSecondary,
              indicatorColor: colorScheme.secondary,
              splashFactory: NoSplash.splashFactory,
              tabs: const [
                Tab(
                  child: Text('Forums'),
                ),
                Tab(
                  child: Text('Events'),
                ),
                Tab(
                  child: Text('Posts'),
                ),
              ],
              onTap: _onTabChanged,
            ),
            Expanded(
              child: TabBarView(
                children: [
                  forumsContent(),
                  eventContent(),
                  postContent(),
                ],
              ),
            ),
          ],
        ),
      ),
      drawer: myDrawer(
        areas: widget.areas,
      ),
      bottomNavigationBar: const MyBottomBar(),
    );
  }

  FutureBuilder<dynamic> forumsContent() {
    return FutureBuilder(
      future: getPubs(type, filters),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else {
          if (allPubs.isEmpty) {
            return const Center(
              child: Text(
                'No posts found',
                style: TextStyle(fontSize: 18),
              ),
            );
          } else {
            return ListView.builder(
              itemCount: allPubs.length,
              itemBuilder: (context, index) {
                return ForumCard(
                  forum: allPubs[index] as Forum,
                  areas: widget.areas,
                );
              },
            );
          }
        }
      },
    );
  }

  FutureBuilder<dynamic> eventContent() {
    return FutureBuilder(
      future: getPubs(type, filters),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else {
          if (allPubs.isEmpty) {
            return const Center(
              child: Text(
                'No posts found',
                style: TextStyle(fontSize: 18),
              ),
            );
          } else {
            return ListView.builder(
              itemCount: allPubs.length,
              itemBuilder: (context, index) {
                return EventCard(
                    event: allPubs[index] as Event, areas: widget.areas);
              },
            );
          }
        }
      },
    );
  }

  FutureBuilder<dynamic> postContent() {
    return FutureBuilder(
      future: getPubs(type, filters),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else {
          if (allPubs.isEmpty) {
            return const Center(
              child: Text(
                'No posts found',
                style: TextStyle(fontSize: 18),
              ),
            );
          } else {
            return ListView.builder(
              itemCount: allPubs.length,
              itemBuilder: (context, index) {
                return PublicationCard(
                    pub: allPubs[index], areas: widget.areas);
              },
            );
          }
        }
      },
    );
  }
}
