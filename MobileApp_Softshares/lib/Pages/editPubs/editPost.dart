import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get_storage/get_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:search_map_location/widget/search_widget.dart';
import 'package:softshares/Components/appBar.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/db.dart';
import 'package:softshares/classes/publication.dart';
import 'package:softshares/classes/user.dart';
import 'package:softshares/providers/auth_provider.dart';

class EditPost extends StatefulWidget {
  EditPost({super.key, required this.post, required this.areas});

  Publication post;
  List<AreaClass> areas;

  @override
  State<EditPost> createState() => _EditPostState();
}

class _EditPostState extends State<EditPost> {
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
  bool nonRating = false;
  bool nonPrice = false;

  List<AreaClass> subAreas = [];

  @override
  void initState() {
    if (widget.post.price != null) {
      currentPriceValue = widget.post.price;
      nonPrice = true;
    } else {
      currentPriceValue = 3;
      nonRating = false;
    }
    if (widget.post.aval != null) {
      currentRatingValue = widget.post.aval;
      nonRating = true;
    } else {
      currentRatingValue = 3;
      nonRating = false;
    }
    titleController.text = widget.post.title;
    descController.text = widget.post.desc;
    super.initState();
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

  void rigthCallBack(context) {
    print('search');
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
            key: _postKey,
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
                                        255, 150, 216, 255),
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
                  const SizedBox(height: 30),
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
                  const SizedBox(height: 30),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: colorScheme.primary),
                    onPressed: () async {
                      if (_postKey.currentState!.validate()) {
                        User user = await api.getUser(box.read('id'));

                        String? title =
                            titleController.text == widget.post.title
                                ? null
                                : titleController.text;
                        String? desc = descController.text == widget.post.desc
                            ? null
                            : descController.text;
                        File? filePath = _selectedImage;
                        String? loc =
                            location == widget.post.location ? null : location;
                        int? price =
                            nonPrice ? currentPriceValue?.toInt() : null;
                        int? rating =
                            nonRating ? currentRatingValue?.toInt() : null;
                        int? subAreaId =
                            selectedSubArea.id == widget.post.subCategory
                                ? null
                                : selectedSubArea.id;
                        print(filePath);
                        try {
                          await api.editPost(
                            postId: widget.post.id!,
                            title: title,
                            desc: desc,
                            filePath: filePath,
                            location: loc,
                            price: price,
                            rating: rating,
                            subAreaId: subAreaId,
                            publisherId: user.id,
                          );
                        } catch (e, s) {
                          print('ERROR: $e');
                          print('Stack trace:\n$s');
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
                    child: Text('Edit Post',
                        style: TextStyle(color: colorScheme.onPrimary)),
                  ),
                ],
              ),
            ),
          ),
        ));
  }

  Future _pickImageFromGallery() async {
    try {
      final returnedImg =
          await ImagePicker().pickImage(source: ImageSource.gallery);
      if (returnedImg != null) {
        setState(() {
          _selectedImage = File(returnedImg.path);
        });
      }
    } on PlatformException {
      // Silently ignore PlatformException
    }
  }
}
