import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:get_storage/get_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:search_map_location/widget/search_widget.dart';
import 'package:softshares/Pages/createPubs/createForm.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/db.dart';
import 'package:softshares/classes/event.dart';
import 'package:softshares/classes/user.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:softshares/providers/auth_provider.dart';

class EventCreation extends StatefulWidget {
  EventCreation({super.key, required this.areas});

  List<AreaClass> areas;

  @override
  State<EventCreation> createState() => _EventCreationState();
}

class _EventCreationState extends State<EventCreation> {
  final API api = API();
  SQLHelper bd = SQLHelper.instance;
  final box = GetStorage();

  File? _selectedImage;

  TextEditingController titleController = TextEditingController();
  TextEditingController dateController = TextEditingController();
  TextEditingController descController = TextEditingController();

  late AreaClass selectedArea;
  late AreaClass selectedSubArea;
  late double currentSlideValue;
  late double currentPriceValue;

  //Variables to en/disable rating and price sliders when not necessary
  late bool nonRating;
  late bool nonPrice;

  String? location;

  //Depending on the recurrency, the label for date changes (This variable controls the text)
  String? dateOpt;

  //Variables to help checking if the event is recurrent or not
  List<String> recurrentOpt = ["Weekly", "Monthly", "Yearly"];
  bool recurrent = false;
  late String? recurrentValue;
  TimeOfDay start_time = TimeOfDay.now();
  TimeOfDay end_time = TimeOfDay.now();

  final _eventKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    selectedArea = widget.areas[0];
    selectedSubArea = selectedArea.subareas![0];
    recurrentValue = recurrentOpt.first;
    dateOpt = 'Date';
  }

  @override
  void dispose() {
    super.dispose();
    titleController.dispose();
    dateController.dispose();
    descController.dispose();
  }

  List<AreaClass> subAreas = [];
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return SingleChildScrollView(
      child: Form(
        key: _eventKey,
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Title',
                style: TextStyle(fontSize: 22),
              ),
              TextFormField(
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter title';
                  }
                  return null;
                },
                textCapitalization: TextCapitalization.sentences,
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
              const SizedBox(height: 30),
              Row(
                children: [
                  const Text(
                    'Recurrent:',
                    style: TextStyle(fontSize: 22),
                  ),
                  const SizedBox(height: 30),
                  Checkbox(
                      value: recurrent,
                      onChanged: (bool? value) {
                        setState(() {
                          recurrent = value!;
                          if (recurrent == true) {
                            dateOpt = 'Start Date';
                          } else {
                            dateOpt = 'Date';
                          }
                        });
                      }),
                ],
              ),
              //If the event is recurrent
              //Add a dropdown to select type
              if (recurrent)
                Container(
                  padding:
                      EdgeInsets.only(left: 20, right: 20, top: 5, bottom: 5),
                  decoration: BoxDecoration(
                      border: Border.all(color: colorScheme.onPrimary),
                      borderRadius: BorderRadius.all(Radius.circular(8.0))),
                  child: DropdownButton<String>(
                    underline: SizedBox.shrink(),
                    isExpanded: true,
                    value: recurrentValue,
                    onChanged: (String? value) {
                      // This is called when the user selects an item.
                      setState(() {
                        recurrentValue = value!;
                      });
                    },
                    items: recurrentOpt
                        .map<DropdownMenuItem<String>>((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      );
                    }).toList(),
                  ),
                ),
              const SizedBox(height: 30),
              Text(
                dateOpt!,
                style: TextStyle(fontSize: 22),
              ),
              dateContent(colorScheme, _eventKey),
              const SizedBox(height: 30),
              const Text(
                'Time',
                style: TextStyle(fontSize: 22),
              ),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: colorScheme.onPrimary, // Set the color of the border
                    width: 1.0, // Set the width of the border
                  ),
                  borderRadius: BorderRadius.circular(
                      8.0), // Optional: Add rounded corners
                ),
                child: Padding(
                  padding: const EdgeInsets.only(top: 10.0, bottom: 10.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      Column(
                        children: [
                          Text(
                            '${start_time.hour}:${start_time.minute.toString().padLeft(2, '0')}',
                            style: const TextStyle(fontSize: 24),
                          ),
                          ElevatedButton(
                              onPressed: () async {
                                final TimeOfDay? timeOfDay =
                                    await showTimePicker(
                                        context: context,
                                        initialTime: start_time,
                                        initialEntryMode:
                                            TimePickerEntryMode.dial);
                                if (timeOfDay != null) {
                                  setState(() {
                                    start_time = timeOfDay;
                                  });
                                }
                              },
                              child: Text(
                                'Choose start time',
                                style: TextStyle(color: colorScheme.onPrimary),
                              ))
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            '${end_time.hour}:${end_time.minute.toString().padLeft(2, '0')}',
                            style: const TextStyle(fontSize: 24),
                          ),
                          ElevatedButton(
                              onPressed: () async {
                                final TimeOfDay? timeOfDay =
                                    await showTimePicker(
                                        context: context,
                                        initialTime: end_time,
                                        initialEntryMode:
                                            TimePickerEntryMode.dial);
                                if (timeOfDay != null) {
                                  setState(() {
                                    end_time = timeOfDay;
                                  });
                                }
                              },
                              child: Text(
                                'Choose end time',
                                style: TextStyle(color: colorScheme.onPrimary),
                              ))
                        ],
                      )
                    ],
                  ),
                ),
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
                  onChanged: (AreaClass? value) async {
                    print(selectedArea.subareas!.length);
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
              const SizedBox(height: 50),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                    backgroundColor: colorScheme.primary),
                onPressed: () async {
                  if (_eventKey.currentState!.validate() &&
                      _selectedImage != null &&
                      location != null &&
                      start_time != end_time) {
                    if (recurrent == false) recurrentValue = null;
                    User user = await api.getUser(box.read('id'));
                    Event post = Event(
                        null,
                        user,
                        descController.text,
                        titleController.text,
                        false,
                        selectedSubArea.id,
                        DateTime.now(),
                        _selectedImage,
                        location,
                        null,
                        DateTime.parse(dateController.text),
                        recurrent,
                        recurrentValue,
                        start_time,
                        end_time);
                    int id = await api.createEvent(post);

                    // Navigate to create a form with specific id

                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => createForm(
                                id: id,
                              )),
                    );
                  } else {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Non valid inputs'),
                        content: const Text(
                            'Please check if all inputs are valid (image/location/time)'),
                        actions: [
                          TextButton(
                            onPressed: () {
                              Navigator.pop(context);
                            },
                            child: Text('OK'),
                          ),
                        ],
                      ),
                    );
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

  Container dateContent(ColorScheme colorScheme, GlobalKey key) {
    return Container(
      child: TextFormField(
        textCapitalization: TextCapitalization.sentences,
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Please insert date';
          }
          return null;
        },
        controller: dateController,
        onTap: () {
          _selectDate();
        },
        readOnly: true,
        decoration: InputDecoration(
            suffixIcon: const Icon(Icons.calendar_today),
            label: Text(
              "Date",
              style: TextStyle(color: colorScheme.onPrimary),
            ),
            border: OutlineInputBorder(
                borderSide: BorderSide(color: colorScheme.primary))),
      ),
    );
  }

  Future<void> _selectDate() async {
    DateTime? _picked = await showDatePicker(
        context: context,
        firstDate: DateTime.now().add(const Duration(days: 7)),
        lastDate: DateTime.now().add(const Duration(days: 365)),
        initialDate: DateTime.now().add(const Duration(days: 7)));
    if (_picked != null) {
      setState(() {
        dateController.text = _picked.toString().split(" ")[0];
      });
    }
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
