import 'dart:io';
import 'package:get_storage/get_storage.dart';
import 'package:softshares/classes/publication.dart';
import 'package:softshares/providers/auth_provider.dart';

import '../../classes/db.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:search_map_location/search_map_location.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/user.dart';

class POICreation extends StatefulWidget {
  POICreation({super.key, required this.areas});

  List<AreaClass> areas;

  @override
  State<POICreation> createState() => _POICreationState();
}

class _POICreationState extends State<POICreation> {
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

  late User user;

  List<AreaClass> subAreas = [];

  Future getUser() async {
    user = await api.getUser(box.read('id'));
  }

  @override
  void initState() {
    super.initState();
    selectedArea = widget.areas[0];
    selectedSubArea = selectedArea.subareas![0];
    currentSlideValue = 3;
    getUser();
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
    return SingleChildScrollView(
      child: Form(
        key: _poiKey,
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(
                child: Text(
                  'Title',
                  style: TextStyle(fontSize: 22),
                ),
              ),
              TextFormField(
                textCapitalization: TextCapitalization.sentences,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter title';
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
              const SizedBox(
                height: 20,
              ),
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
                        child: const Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.image),
                              Text('Add Image +'),
                            ],
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
              const Text(
                'Description',
                style: TextStyle(fontSize: 22),
              ),
              TextFormField(
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
              const SizedBox(
                height: 30,
              ),
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
              const SizedBox(
                height: 30,
              ),
              const Text(
                'Area',
                style: TextStyle(fontSize: 22),
              ),
              Container(
                padding:
                    EdgeInsets.only(left: 20, right: 20, top: 5, bottom: 5),
                decoration: BoxDecoration(
                    border: Border.all(color: colorScheme.onPrimary),
                    borderRadius: BorderRadius.all(Radius.circular(8.0))),
                child: DropdownButton<AreaClass>(
                  isExpanded: true,
                  hint: const Text('Select Area'),
                  underline: SizedBox.shrink(),
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
                padding:
                    EdgeInsets.only(left: 20, right: 20, top: 5, bottom: 5),
                decoration: BoxDecoration(
                    border: Border.all(color: colorScheme.onPrimary),
                    borderRadius: BorderRadius.all(Radius.circular(8.0))),
                child: DropdownButton<AreaClass>(
                  isExpanded: true,
                  hint: const Text('Select Sub Area'),
                  underline: SizedBox.shrink(),
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
                height: 30,
              ),
              Text(
                'Rating',
                style: TextStyle(fontSize: 22),
              ),
              Slider(
                min: 1,
                max: 5,
                value: currentSlideValue,
                onChanged: (double value) {
                  setState(() {
                    currentSlideValue = value;
                  });
                },
                divisions: 4,
                label: currentSlideValue.toString(),
              ),
              const SizedBox(
                height: 30,
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                    backgroundColor: colorScheme.primary),
                onPressed: () async {
                  if (_poiKey.currentState!.validate() &&
                      _selectedImage != null &&
                      location != null) {
                    Publication post = Publication(
                        null,
                        user,
                        descController.text,
                        titleController.text,
                        false,
                        selectedSubArea.id,
                        DateTime.now(),
                        _selectedImage,
                        location,
                        currentSlideValue,
                        null);
                    try {
                      await api.createPOI(post);
                    } catch (e) {
                      await showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: Text('Error creating post'),
                          content: Text(
                              'An error occurred while creating the Point of Interest'),
                          actions: [
                            TextButton(
                              onPressed: () {
                                Navigator.pushNamed(
                                    context, '/home'); // Close the dialog
                              },
                              child: Text('OK'),
                            ),
                          ],
                        ),
                      );
                    }
                    Navigator.pushNamed(context, '/home');
                  } else {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: Text('Non valid inputs'),
                        content: Text(
                            'Please check if all inputs are valid (image/location)'),
                        actions: [
                          TextButton(
                            onPressed: () {
                              Navigator.pop(context); // Close the dialog
                            },
                            child: Text('OK'),
                          ),
                        ],
                      ),
                    );
                  }
                },
                child: Text(
                  'Advance',
                  style: TextStyle(color: colorScheme.onPrimary),
                ),
              ),
            ],
          ),
        ),
      ),
    );
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
