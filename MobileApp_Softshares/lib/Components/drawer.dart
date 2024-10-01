import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:get_storage/get_storage.dart';
import 'package:softshares/Pages/area.dart';
import 'package:softshares/Pages/createPub.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/db.dart';

// ignore: must_be_immutable, camel_case_types
class myDrawer extends StatefulWidget {
  myDrawer({super.key, required this.areas});

  final List<AreaClass> areas;

  @override
  State<myDrawer> createState() => _myDrawerState();
}

class _myDrawerState extends State<myDrawer> {
  late String cityName; // Change with user's city
  final SQLHelper bd = SQLHelper.instance;
  final box = GetStorage();
  late int cityId = box.read('selectedCity');

  Future<bool> _getCity(int id) async {
    var data = await bd.getCityName(id);
    cityId = box.read('selectedCity');
    cityName = data!;
    return true;
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Drawer(
      width: 262,
      child: ListView(
        padding: const EdgeInsets.all(0),
        children: [
          SafeArea(
            child: FutureBuilder(
              future: _getCity(cityId),
              builder: (context, snapshot) {
                if (snapshot.hasData) {
                  return header(colorScheme, context);
                } else {
                  return Center(
                    child: CircularProgressIndicator(),
                  );
                }
              },
            ),
          ),
          ListTile(
            leading: const Icon(Icons.calendar_month),
            title: const Text('Calendar'),
            onTap: () {
              Navigator.pushNamed(context, '/Calendar');
            },
          ),
          ListTile(
            leading: const Icon(Icons.pin_drop),
            title: const Text('Points of interest - POI'),
            onTap: () {
              Navigator.pushNamed(context, '/PointOfInterest');
            },
          ),
          ListTile(
            leading: const Icon(Icons.photo_library),
            title: const Text('Albums'),
            onTap: () {
              Navigator.pushNamed(context, '/albums');
            },
          ),
          ListTile(
            leading: const Icon(Icons.person),
            title: const Text('Profile'),
            onTap: () {
              Navigator.pushNamed(context, '/Profile');
            },
          ),
          const Divider(
            height: 0,
            thickness: 2,
            indent: 25,
            endIndent: 25,
          ),
          const Padding(
            padding: EdgeInsets.only(left: 25, top: 12, bottom: 0),
            child: Text(
              'Areas',
              style: TextStyle(
                fontSize: 14,
              ),
            ),
          ),
          ListView.builder(
            shrinkWrap: true,
            itemCount: widget.areas.length,
            physics: const NeverScrollableScrollPhysics(),
            itemBuilder: (context, index) {
              return ListTile(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => Area(
                        areas: widget.areas,
                        title: widget.areas.elementAt(index).areaName,
                      ),
                    ),
                  );
                },
                leading: Icon(
                  widget.areas[index].icon,
                  color: colorScheme.onError,
                ),
                title: Text(widget.areas[index].areaName),
              );
            },
          ),
        ],
      ),
    );
  }

  Container header(ColorScheme scheme, BuildContext context) {
    // ignore: sized_box_for_whitespace
    return Container(
      //alignment: Alignment.bottomCenter,
      height: 80,
      child: ElevatedButton(
          style: ElevatedButton.styleFrom(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(1)),
              elevation: 0,
              backgroundColor: Colors.transparent),
          onPressed: () async {
            final selectedCity =
                await Navigator.pushNamed(context, '/chooseCity');
            if (selectedCity != null && selectedCity is Map<String, dynamic>) {
              box.write('selectedCity', selectedCity['index']);
              _getCity(selectedCity['index']);
            }
          },
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.location_history,
                    color: scheme.onSecondary,
                    size: 30,
                  ),
                  const SizedBox(
                    width: 10,
                  ),
                  Text(
                    cityName,
                    style: TextStyle(fontSize: 24, color: scheme.onSecondary),
                  ),
                ],
              ),
              Icon(
                Icons.arrow_right,
                size: 40,
                color: scheme.onSecondary,
              ),
            ],
          )),
    );
  }

  ListTile areaTile(String title, Icon icon, context) {
    final String route = '/$title';
    return ListTile(
      leading: icon,
      title: Text(title),
      onTap: () => {Navigator.pushNamed(context, route)},
    );
  }
}
