import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:search_map_location/widget/search_widget.dart';
import 'package:softshares/Components/appBar.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/db.dart';
import 'package:softshares/classes/publication.dart';
import 'package:softshares/classes/user.dart';

class EditPOI extends StatefulWidget {
  EditPOI({super.key, required this.post, required this.areas});

  Publication post;
  List<AreaClass> areas;

  @override
  State<EditPOI> createState() => _EditPOIState();
}

class _EditPOIState extends State<EditPOI> {
  final _poiKey = GlobalKey<FormState>();
  final API api = API();
  SQLHelper bd = SQLHelper.instance;
  final box = GetStorage();

  String? location;

  File? _selectedImage;

  TextEditingController titleController = TextEditingController();
  TextEditingController descController = TextEditingController();

  late AreaClass selectedArea;
  late AreaClass selectedSubArea;
  late double currentSlideValue;
  late String initialTitle;
  late String initialDesc;
  late DateTime initialDate;
  late TimeOfDay initialStartTime;
  late TimeOfDay initialEndTime;
  late AreaClass initialSubArea;
  late bool initialRecurrent;
  late User user;

  List<AreaClass> subAreas = [];

  Future getUser() async {
    user = await api.getUser(box.read('id'));
  }

  void rigthCallBack(context) {
    print('search');
  }

  @override
  void initState() {
    super.initState();
    initialTitle = widget.post.title;
    initialDesc = widget.post.desc;
    initialSubArea = widget.areas
        .firstWhere((area) => area.subareas!
            .any((subArea) => subArea.id == widget.post.subCategory))
        .subareas!
        .firstWhere((subArea) => subArea.id == widget.post.subCategory);

    titleController.text = initialTitle;
    descController.text = initialDesc;
    currentSlideValue = widget.post.aval!;
    getUser();
    for (var area in widget.areas) {
      if (area.subareas != null) {
        for (var subArea in area.subareas!) {
          if (subArea.id == widget.post.subCategory) {
            selectedArea = area;
            selectedSubArea = subArea;
          }
        }
      }
    }
  }

  @override
  void dispose() {
    super.dispose();
    titleController.dispose();
    descController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
        appBar: MyAppBar(
            iconR: const Icon(Icons.close),
            title: 'Edit',
            rightCallback: rigthCallBack),
        body: SingleChildScrollView(
          child: Form(
            key: _poiKey,
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.report,
                        color: colorScheme.error,
                      ),
                      const SizedBox(
                        width: 8,
                      ),
                      Expanded(
                          child: Text(
                        'Only alter what you want to update',
                        style: TextStyle(color: colorScheme.error),
                      ))
                    ],
                  ),
                  const Text(
                    'Title',
                    style: TextStyle(fontSize: 22),
                  ),
                  TextFormField(
                    textCapitalization: TextCapitalization.sentences,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please insert title';
                      }
                      return null;
                    },
                    controller: titleController,
                    decoration: const InputDecoration(
                      labelText: 'Title',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.all(
                          Radius.circular(8.0),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  _selectedImage == null
                      ? GestureDetector(
                          onTap: () {
                            _pickImageFromGallery();
                          },
                          child: Container(
                            margin: const EdgeInsets.only(top: 20, bottom: 20),
                            decoration: BoxDecoration(
                              color: colorScheme.surface,
                              borderRadius: BorderRadius.circular(18.0),
                            ),
                            height: 220,
                            child: Center(
                              child: Image.network(
                                '${box.read('url')}/uploads/${widget.post.img?.path}',
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    color: const Color.fromARGB(
                                        255, 255, 204, 150),
                                    height: 170,
                                  );
                                },
                              ),
                            ),
                          ),
                        )
                      : GestureDetector(
                          onTap: () {
                            _pickImageFromGallery();
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.blue,
                              borderRadius: BorderRadius.circular(
                                  20), // Specifies the border radius
                              border: Border.all(
                                color: Colors.transparent, // Border color
                                width: 2, // Border width
                              ),
                            ),
                            height: 220,
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(18),
                              child: Image.file(
                                _selectedImage!,
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                        ),
                  const SizedBox(height: 20),
                  const Text(
                    'Description',
                    style: TextStyle(fontSize: 22),
                  ),
                  TextFormField(
                    onChanged: (text) {
                      descController.text = text;
                    },
                    textCapitalization: TextCapitalization.sentences,
                    controller: descController,
                    decoration: const InputDecoration(
                      labelText: 'Description',
                      hintText: 'Body text (optional)',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.all(
                          Radius.circular(8.0),
                        ),
                      ),
                    ),
                    maxLines: null,
                  ),
                  const SizedBox(height: 30),
                  const Text(
                    'Location',
                    style: TextStyle(fontSize: 22),
                  ),
                  SearchLocation(
                    apiKey: 'AIzaSyCuVdw-opYJnp5vriI-BzE5vAQZsg8Bi5E',
                    country: 'PT',
                    onSelected: (place) async {
                      final geolocation = await place.geolocation;

                      location =
                          '${geolocation?.coordinates.latitude} ${geolocation?.coordinates.longitude}';
                    },
                  ),
                  const Text(
                    'Area',
                    style: TextStyle(fontSize: 22),
                  ),
                  Container(
                    padding: const EdgeInsets.only(
                        left: 20, right: 20, top: 5, bottom: 5),
                    decoration: BoxDecoration(
                        border: Border.all(color: colorScheme.onPrimary),
                        borderRadius:
                            const BorderRadius.all(Radius.circular(8.0))),
                    child: DropdownButton<AreaClass>(
                      isExpanded: true,
                      hint: const Text('Select Area'),
                      underline: const SizedBox.shrink(),
                      value: selectedArea,
                      items: widget.areas.map((AreaClass area) {
                        return DropdownMenuItem<AreaClass>(
                          value: area,
                          child: Text(area.areaName),
                        );
                      }).toList(),
                      onChanged: (AreaClass? value) {
                        setState(() {
                          selectedArea = value!;
                          selectedSubArea = selectedArea.subareas![0];
                        });
                      },
                    ),
                  ),
                  const SizedBox(
                    height: 30,
                  ),
                  const Text(
                    'Sub Area',
                    style: TextStyle(fontSize: 22),
                  ),
                  Container(
                    padding: const EdgeInsets.only(
                        left: 20, right: 20, top: 5, bottom: 5),
                    decoration: BoxDecoration(
                        border: Border.all(color: colorScheme.onPrimary),
                        borderRadius:
                            const BorderRadius.all(Radius.circular(8.0))),
                    child: DropdownButton<AreaClass>(
                      isExpanded: true,
                      hint: const Text('Select Sub Area'),
                      underline: const SizedBox.shrink(),
                      value: selectedSubArea,
                      items: selectedArea.subareas!.map((AreaClass area) {
                        return DropdownMenuItem<AreaClass>(
                          value: area,
                          child: Text(area.areaName),
                        );
                      }).toList(),
                      onChanged: (AreaClass? value) {
                        setState(() {
                          selectedSubArea = value!;
                        });
                      },
                    ),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  const Text(
                    'Rating',
                    style: TextStyle(fontSize: 22),
                  ),
                  Slider(
                    min: 1,
                    max: 5,
                    value: currentSlideValue!,
                    onChanged: (double value) {
                      setState(() {
                        currentSlideValue = value;
                      });
                    },
                    divisions: 4,
                    label: currentSlideValue.toString(),
                  ),
                  const SizedBox(height: 30),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: colorScheme.primary),
                    onPressed: () async {
                      if (_poiKey.currentState!.validate()) {
                        //User user = await api.getUser(box.read('id'));

                        String? desc = descController.text == initialDesc
                            ? null
                            : descController.text;
                        String? title = titleController.text == initialTitle
                            ? null
                            : titleController.text;
                        File? imgPath = _selectedImage;
                        String? loc = location;
                        int? rating = currentSlideValue.toInt();
                        int? subAreaId =
                            selectedSubArea.id == widget.post.subCategory
                                ? null
                                : selectedSubArea.id;

                        try {
                          await api.editPost(
                              postId: widget.post.id!,
                              title: title,
                              desc: desc,
                              filePath: imgPath,
                              location: loc,
                              subAreaId: subAreaId,
                              publisherId: widget.post.id!,
                              rating: rating);
                        } catch (e) {
                          await showDialog(
                            context: context,
                            builder: (context) => AlertDialog(
                              title: const Text('Error editing post'),
                              content: const Text(
                                  'An error occurred while editing the Post'),
                              actions: [
                                TextButton(
                                  onPressed: () {
                                    Navigator.pushNamed(
                                        context, '/home'); // Close the dialog
                                  },
                                  child: const Text('OK'),
                                ),
                              ],
                            ),
                          );
                        }
                        Navigator.pushNamed(context, '/home');
                      }
                    },
                    child: Text('Edit Forum',
                        style: TextStyle(color: colorScheme.onPrimary)),
                  ),
                ],
              ),
            ),
          ),
        ));
  }

  Future _pickImageFromGallery() async {
    final returnedImg =
        await ImagePicker().pickImage(source: ImageSource.gallery);
    if (returnedImg != null) {
      setState(() {
        _selectedImage = File(returnedImg.path);
      });
    }
  }
}
