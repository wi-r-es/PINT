import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:search_map_location/search_map_location.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/db.dart';
import 'package:softshares/classes/publication.dart';
import 'package:softshares/classes/user.dart';
import 'package:softshares/providers/auth_provider.dart';

class PostCreation extends StatefulWidget {
  PostCreation({super.key, required this.areas});

  List<AreaClass> areas;

  @override
  State<PostCreation> createState() => _PostCreationState();
}

class _PostCreationState extends State<PostCreation> {
  final _postKey = GlobalKey<FormState>();
  final API api = API();
  SQLHelper bd = SQLHelper.instance;
  final box = GetStorage();

  File? _selectedImage;

  TextEditingController titleController = TextEditingController();
  TextEditingController descController = TextEditingController();

  late AreaClass selectedArea;
  late AreaClass selectedSubArea;
  late double? currentRatingValue;
  late double? currentPriceValue;

  String? location;

  //Variables to en/disable rating and price sliders when not necessary
  late bool nonRating;
  late bool nonPrice;

  List<AreaClass> subAreas = [];

  @override
  void initState() {
    super.initState();
    selectedArea = widget.areas[0];
    selectedSubArea = selectedArea.subareas![0];
    currentRatingValue = 3;
    currentPriceValue = 3;
    nonPrice = true;
    nonRating = true;
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
        key: _postKey,
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
                    return 'Please insert title';
                  }
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
                padding: const EdgeInsets.only(
                    left: 20, right: 20, top: 5, bottom: 5),
                decoration: BoxDecoration(
                    border: Border.all(color: colorScheme.onPrimary),
                    borderRadius: const BorderRadius.all(Radius.circular(8.0))),
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
                    print(value!.subareas!.length);
                    setState(() {
                      selectedArea = value;
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
                    borderRadius: const BorderRadius.all(Radius.circular(8.0))),
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
                    print(value!.id);
                    setState(() {
                      selectedSubArea = value;
                    });
                  },
                ),
              ),
              const SizedBox(
                height: 30,
              ),
              Row(
                children: [
                  const Text(
                    'Rating',
                    style: TextStyle(fontSize: 22),
                  ),
                  Checkbox(
                      value: nonRating,
                      onChanged: (value) {
                        setState(() {
                          nonRating = value!;
                        });
                      })
                ],
              ),
              if (nonRating)
                Slider(
                  min: 1,
                  max: 5,
                  value: currentRatingValue!,
                  onChanged: (double value) {
                    setState(() {
                      currentRatingValue = value;
                    });
                  },
                  divisions: 4,
                  label: currentRatingValue.toString(),
                ),
              const SizedBox(
                height: 30,
              ),
              Row(
                children: [
                  const Text(
                    'Price',
                    style: TextStyle(fontSize: 22),
                  ),
                  Checkbox(
                      value: nonPrice,
                      onChanged: (value) {
                        setState(() {
                          nonPrice = value!;
                        });
                      })
                ],
              ),
              if (nonPrice)
                Slider(
                  min: 1,
                  max: 4,
                  value: currentPriceValue!,
                  onChanged: (double value) {
                    setState(() {
                      currentPriceValue = value;
                    });
                  },
                  divisions: 3,
                  label: currentPriceValue.toString(),
                ),
              const SizedBox(
                height: 30,
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                    backgroundColor: colorScheme.primary),
                onPressed: () async {
                  if (_postKey.currentState!.validate()) {
                    User user = await api.getUser(box.read('id'));
                    if (nonPrice == false) currentPriceValue = null;
                    if (nonRating == false) currentRatingValue = null;
                    print('Price: ${currentPriceValue}');
                    print('Rating: ${currentRatingValue}');
                    var post = Publication(
                        null,
                        user,
                        descController.text,
                        titleController.text,
                        false,
                        selectedSubArea.id,
                        DateTime.now(),
                        _selectedImage,
                        location,
                        currentRatingValue,
                        currentPriceValue);
                    try {
                      await api.createPost(post);
                    } catch (e) {
                      await showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: Text('Error creating post'),
                          content: Text(
                              'An error occurred while creating the Post: $e'),
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
                    Navigator.pushNamed(context, '/home');
                  }
                },
                child: Text('Advance',
                    style: TextStyle(color: colorScheme.onPrimary)),
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
