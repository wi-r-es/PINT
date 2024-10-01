import 'package:flutter/material.dart';
import 'package:softshares/Components/appBar.dart';
import 'package:softshares/Components/bottomNavBar.dart';
import 'package:softshares/Components/drawer.dart';
import 'package:softshares/Pages/albumContent/eachAreaAlbum.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/db.dart';

class Album extends StatefulWidget {
  Album({super.key, required this.areas});
  List<AreaClass> areas;

  @override
  State<Album> createState() => _AlbumState();
}

class _AlbumState extends State<Album> {
  API api = API();
  SQLHelper bd = SQLHelper.instance;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Choose category'),
      ),
      drawer: myDrawer(areas: widget.areas),
      body: ListView.builder(
          itemCount: widget.areas.length,
          itemBuilder: (context, index) {
            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => AreaAlbum(
                      area: widget.areas[index],
                    ),
                  ),
                );
              },
              child: Card(
                margin: const EdgeInsets.symmetric(
                    vertical: 10.0, horizontal: 16.0),
                child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Text(
                      widget.areas[index].areaName,
                      style: const TextStyle(fontSize: 18),
                    )),
              ),
            );
          }),
      bottomNavigationBar: MyBottomBar(),
    );
  }
}
