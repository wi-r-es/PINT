import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:provider/provider.dart';
import 'package:softshares/Components/appBar.dart';
import 'package:softshares/Components/bottomNavBar.dart';
import 'package:softshares/Components/drawer.dart';
import 'package:softshares/Pages/area.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/db.dart';
import 'package:softshares/firebase_conf.dart';
import '../classes/user.dart';

class EditProfile extends StatefulWidget {
  EditProfile({super.key, required this.areas, required this.user});

  List<AreaClass> areas;
  User user;

  @override
  State<EditProfile> createState() => _EditProfileState();
}

class _EditProfileState extends State<EditProfile> {
  SQLHelper bd = SQLHelper.instance;
  TextEditingController nameController = TextEditingController();
  TextEditingController emailController = TextEditingController();
  Map<AreaClass, bool> checkBoxSelected = {};
  Map<String, List<String>> current_prefs = {};
  Map<String, List<String>> new_prefs = {};
  API api = API();
  bool isLoading = true;
  var box = GetStorage();
  var jsonPrefs;

  Future initPrefs() async {
    List<AreaClass> aux = await api.getAreas();

    for (var area in aux) {
      new_prefs[area.areaName] = [];
    }
  }

  AreaClass? getSubArea(String name) {
    for (var area in checkBoxSelected.keys) {
      if (area.areaName == name) return area;
    }
    return null;
  }

  void jsonfyPrefs() {
    var aux = [];
    Map<String, List<String>> filteredPrefs = Map.fromEntries(
      new_prefs.entries.where((entry) => entry.value.isNotEmpty),
    );

    filteredPrefs.forEach((key, value) {
      var object = {'area': key, 'subareas': value};
      aux.add(object);
    });

    jsonPrefs = jsonEncode(aux);
    print('JSON PREFS');
    print(jsonPrefs);
  }

  Future getAreasAndPrefs() async {
    List<AreaClass> aux = await api.getAreas();
    current_prefs = await api.getPrefs();
    print('Current prefs');
    print(current_prefs);
    Map<AreaClass, bool> aux_map = {};
    List<AreaClass> areas = [];
    for (var area in aux) {
      areas.add(area);
      for (var subArea in area.subareas!) {
        aux_map[subArea] = false;
      }
    }
    setState(() {
      checkBoxSelected = aux_map;
      isLoading = false;
    });

    if (current_prefs.isNotEmpty) {
      for (var area in areas) {
        print(current_prefs[area.areaName]);
        if (current_prefs[area.areaName] != null) {
          for (var subArea in current_prefs[area.areaName]!) {
            AreaClass? aux = getSubArea(subArea);
            if (aux != null) {
              checkBoxSelected[aux] = true;
            }
          }
        }
      }
      current_prefs.forEach((key, value) {
        print(key);
        new_prefs[key]?.addAll(value);
      });
    }
  }

  @override
  void initState() {
    super.initState();
    initPrefs();
    getAreasAndPrefs();
    print('NEW PREFS');
    print(new_prefs);
  }

  Future savePrefs() async {
    if (current_prefs.isEmpty) {
      await api.createPrefs(jsonPrefs);
    } else {
      print('JSON:');
      print(jsonPrefs);
      await api.updatePrefs(jsonPrefs);
    }
  }

  void addInfo(AreaClass subArea) {
    new_prefs[subArea.areaBelongs]!.add(subArea.areaName);
  }

  @override
  void dispose() {
    super.dispose();
    nameController.dispose();
    emailController.dispose();
  }

  /*Callback function to exit screen */
  void closeCallback(context) {
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: MyAppBar(
        iconR: const Icon(Icons.close),
        title: 'Edit Profile',
        rightCallback: closeCallback,
      ),
      drawer: myDrawer(
        areas: widget.areas,
      ),
      bottomNavigationBar: MyBottomBar(),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            profilePicture(colorScheme),
            //Name
            Container(
              height: 30,
              margin: const EdgeInsets.only(left: 20, right: 20),
              child: const Text(
                'Preferences',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ),
            //Preferences
            preferencesContent(colorScheme),
            const SizedBox(
              height: 70,
            ),
            saveBtn(context, colorScheme)
          ],
        ),
      ),
    );
  }

  Container saveBtn(BuildContext context, ColorScheme colorScheme) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(left: 20, right: 20),
      height: 45,
      child: ElevatedButton(
          style: ElevatedButton.styleFrom(
            foregroundColor: colorScheme.onPrimary,
            backgroundColor: colorScheme.primary,
          ),
          onPressed: () async {
            jsonfyPrefs();

            List<String> old_prefs_list = [];
            List<String> new_prefs_list = [];

            current_prefs.forEach((key, value) {
              old_prefs_list.addAll(value);
            });
            new_prefs.forEach((key, value) {
              new_prefs_list.addAll(value);
            });

            await savePrefs();

            List<String> prefsToUnsubscribe = old_prefs_list
                .where((oldPref) => !new_prefs_list.contains(oldPref))
                .toList();

            List<String> prefsToSubscribe = new_prefs_list
                .where((newPref) => !old_prefs_list.contains(newPref))
                .toList();

            // Perform unsubscriptions
            for (var pref in prefsToUnsubscribe) {
              print('Unsubscribing from: $pref');
              unsubscribeFromTopic(pref);
            }

            // Perform subscriptions
            for (var pref in prefsToSubscribe) {
              print('Subscribing to: $pref');
              subscribeToTopic(pref);
            }
            Navigator.pushNamed(context, '/home');
          },
          child: const Text('Save changes')),
    );
  }

  Container preferencesContent(ColorScheme colorScheme) {
    return Container(
      height: 300,
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      decoration:
          BoxDecoration(border: Border.all(color: colorScheme.onSecondary)),
      child: SingleChildScrollView(
        child: Column(
          children: [
            isLoading == false
                ? ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    itemCount: checkBoxSelected.length,
                    itemBuilder: (context, index) {
                      AreaClass key = checkBoxSelected.keys.elementAt(index);
                      bool value = checkBoxSelected.values.elementAt(index);
                      return CheckboxListTile(
                        title: Text(key.areaName),
                        value: value,
                        onChanged: (newValue) {
                          setState(() {
                            checkBoxSelected[key] = newValue!;
                            //Check if it's area or subArea
                            if (key.areaBelongs != null) {
                              //It's subArea
                              if (!(new_prefs[key.areaBelongs]!
                                  .contains(key.areaName))) {
                                new_prefs[key.areaBelongs]!.add(key.areaName);
                              } else {
                                new_prefs[key.areaBelongs]!
                                    .remove(key.areaName);
                              }
                            }
                          });
                        },
                      );
                    },
                  )
                : const Center(
                    child: CircularProgressIndicator(),
                  ),
          ],
        ),
      ),
    );
  }

  Container emailContent(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: TextField(
        controller: emailController,
        decoration: InputDecoration(
            label: Text(
              "Email",
              style: TextStyle(color: colorScheme.onTertiary),
            ),
            border: OutlineInputBorder(
                borderSide: BorderSide(color: colorScheme.primary))),
      ),
    );
  }

  Container nameContent(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: TextField(
        controller: nameController,
        decoration: InputDecoration(
            label: Text(
              "Name",
              style: TextStyle(color: colorScheme.onTertiary),
            ),
            border: OutlineInputBorder(
                borderSide: BorderSide(color: colorScheme.primary))),
      ),
    );
  }

  Container profilePicture(ColorScheme colorScheme) {
    return Container(
      height: 220,
      child: Center(
        child: Container(
          margin: const EdgeInsets.only(top: 30),
          height: 170,
          width: 170,
          decoration: BoxDecoration(
              border: Border.all(color: Colors.transparent, width: 3),
              borderRadius: BorderRadius.circular(95)),
          child: Center(
            child: Stack(children: [
              Container(
                  height: 150,
                  width: 150,
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(75),
                      color: colorScheme.secondary),
                  child: Center(
                    child: Text(
                      widget.user.lastName[0],
                      style:
                          TextStyle(fontSize: 54, color: colorScheme.onPrimary),
                    ),
                  )),
              Positioned(
                top: 105,
                left: 105,
                child: Container(
                  height: 42,
                  width: 42,
                  decoration: BoxDecoration(
                      color: Colors.white,
                      border:
                          Border.all(color: colorScheme.secondary, width: 3),
                      borderRadius: BorderRadius.circular(95)),
                  child: Center(
                    child: IconButton(
                      onPressed: () {},
                      icon: Icon(
                        Icons.edit,
                        color: colorScheme.secondary,
                        size: 22,
                      ),
                    ),
                  ),
                ),
              )
            ]),
          ),
        ),
      ),
    );
  }
}
