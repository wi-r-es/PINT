import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:softshares/Components/customCheckbox.dart';
import 'package:softshares/Components/customRadioBtn.dart';
import 'package:softshares/Components/customTextField.dart';
import 'package:softshares/Components/formAppBar.dart';
import 'package:softshares/Pages/createPubs/createForm.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/event.dart';
import 'package:softshares/classes/fieldClass.dart';

class editForm extends StatefulWidget {
  editForm({super.key, required this.id});
  final int id;

  @override
  State<editForm> createState() => _MyWidgetState();
}

const List<String> options = [
  "Radio Button",
  "Checkbox",
  "Text/Numeric Input",
];

List<Map<String, dynamic>> jsonFormEdits = [];
List<Map<String, dynamic>> jsonFormNew = [];

class _MyWidgetState extends State<editForm> {
  String currentOption = options[0];
  final API api = API();
  List<Field> existingFields = [];
  List<Widget> widgets = [];
  bool loaded = false;
  //Check the greater ID number to start giving id's from there
  late int lastId;

  void addItemToList(Widget item) {
    setState(() {
      widgets.add(item);
    });
  }

  // Create jsonObject to send to server
  void addInfo(int? id, String label, List<String>? options, String type) {
    var object;
    if (id != null) {
      object = {
        "field_id": id,
        "field_name": label,
        "field_type": type,
        "field_value": jsonEncode(options),
        "max_value": null,
        "min_value": null
      };
      jsonFormEdits.add(object);
    } else {
      object = {
        "field_name": label,
        "field_type": type,
        "field_value": jsonEncode(options),
        "max_value": null,
        "min_value": null
      };
      jsonFormNew.add(object);
    }
  }

  Future<void> updateForm() async {
    print(widget.id);

    // Convert jsonForm to JSON string
    String editData = jsonEncode(jsonFormEdits);
    String newData = jsonEncode(jsonFormNew);

    try {
      await api.editForm(widget.id, editData);
      await api.createForm(widget.id, newData);
      print('Created form');
    } catch (e) {
      print('Something went wrong (updateForm()):');
      print(e);
    }
  }

  Future<void> getForm() async {
    existingFields = await api.getForm(widget.id);
    buildForm();
    setState(() {
      loaded = true;
    });
  }

  void buildForm() {
    List<Widget> aux = [];
    for (var item in existingFields) {
      addInfo(item.id, item.name, item.options, item.type);
      print('TYPE: ${item.type}');
      switch (item.type) {
        case 'Text':
          aux.add(customTextField(
            label: item.name,
            numericInput: false,
          ));
          break;
        case 'Number':
          aux.add(customTextField(
            label: item.name,
            numericInput: true,
          ));
          break;
        case 'Radio':
          aux.add(customRadioBtn(
            label: item.name,
            options: item.options!,
          ));
          break;
        case 'Checkbox':
          aux.add(customCheckbox(
            label: item.name,
            options: item.options!,
          ));
      }
      print('ENTRIES: ');
      for (var aux in jsonFormEdits) {
        print(aux['field_id']);
      }
    }

    setState(() {
      widgets = aux;
    });
  }

  @override
  void initState() {
    super.initState();
    getForm();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Form'),
        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },
          icon: const Icon(Icons.close),
        ),
        backgroundColor: colorScheme.primary,
        foregroundColor: colorScheme.onPrimary,
        actions: [
          IconButton(
              onPressed: () {
                updateForm();
                Navigator.pushNamed(context, '/home');
              },
              icon: const Icon(Icons.check))
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(18.0),
        child: Column(
          children: [
            
            Expanded(
              child: SingleChildScrollView(
                child: Center(
                  child: Column(
                    children: [
                      const SizedBox(),
                      widgets.isNotEmpty
                          ? ListView.builder(
                              shrinkWrap: true,
                              physics: NeverScrollableScrollPhysics(),
                              itemCount: widgets.length,
                              itemBuilder: (context, index) {
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 8.0),
                                  child: Material(
                                    elevation: 1.5,
                                    borderOnForeground: false,
                                    child: Container(
                                      padding: const EdgeInsets.only(
                                          left: 10, bottom: 10, right: 10),
                                      decoration: BoxDecoration(
                                          color: colorScheme.primaryContainer,
                                          border: Border.all(
                                            color: Colors.transparent,
                                            width: 1,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(10)),
                                      child: Stack(
                                        children: [
                                          widgets[index],
                                          Positioned(
                                            top: 8,
                                            right: 8,
                                            child: IconButton(
                                              icon: Icon(Icons.delete,
                                                  color:
                                                      colorScheme.onSecondary),
                                              onPressed: () async {
                                                try {
                                                  int? fieldId;
                                                  if (index <
                                                      jsonFormEdits.length) {
                                                    fieldId =
                                                        jsonFormEdits[index]
                                                            ['field_id'];
                                                    jsonFormEdits
                                                        .removeAt(index);
                                                  } else {
                                                    jsonFormNew.removeAt(index);
                                                  }

                                                  setState(() {
                                                    widgets.removeAt(index);
                                                  });

                                                  if (fieldId != null) {
                                                    await api.removeField(
                                                        widget.id, fieldId);
                                                  }
                                                } catch (e) {
                                                  print(
                                                      'Error removing field: $e');
                                                }
                                              },
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              },
                            )
                          : const Center(child: Text('Insert new field')),
                    ],
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 20.0, top: 15),
              child: addItem(context, colorScheme),
            ),
          ],
        ),
      ),
    );
  }

  ElevatedButton addItem(BuildContext context, ColorScheme colorScheme) {
    return ElevatedButton(
      style: ButtonStyle(
          foregroundColor:
              MaterialStateProperty.all<Color>(colorScheme.onPrimary),
          backgroundColor:
              MaterialStateProperty.all<Color>(colorScheme.primary)),
      onPressed: () {
        showModalBottomSheet(
          context: context,
          builder: (BuildContext context) {
            return StatefulBuilder(
                builder: (BuildContext context, StateSetter setState) {
              return formBottomSheet(setState, context, colorScheme);
            });
          },
        );
      },
      child: const Text('Add Items'),
    );
  }

  Container formBottomSheet(
      StateSetter setState, BuildContext context, ColorScheme colorScheme) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.rectangle,
        borderRadius: const BorderRadius.all(Radius.circular(30)),
        color: colorScheme.primaryContainer,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          RadioListTile(
              title: Text(
                options[0],
                style: const TextStyle(fontSize: 24),
              ),
              value: options[0],
              groupValue: currentOption,
              onChanged: (value) {
                setState(() {
                  currentOption = value.toString();
                });
              }),
          RadioListTile(
              title: Text(options[1], style: const TextStyle(fontSize: 24)),
              value: options[1],
              groupValue: currentOption,
              onChanged: (value) {
                setState(() {
                  currentOption = value.toString();
                });
              }),
          RadioListTile(
              title: Text(options[2], style: const TextStyle(fontSize: 24)),
              value: options[2],
              groupValue: currentOption,
              onChanged: (value) {
                setState(() {
                  currentOption = value.toString();
                });
              }),
          ElevatedButton(
              style: ButtonStyle(
                  foregroundColor:
                      MaterialStateProperty.all<Color>(colorScheme.onPrimary),
                  backgroundColor:
                      MaterialStateProperty.all<Color>(colorScheme.primary),
                  elevation: MaterialStateProperty.all(10)),
              onPressed: () async {
                String route = '';
                Widget? item;

                /*Handles the type of input the user wants to add*/
                /*Single char are to identify the type of input in the database*/
                switch (currentOption) {
                  case "Radio Button":
                    route = "/createRadioBtnForm";
                    final result = await Navigator.pushNamed(context, route);
                    if (result != null && result is Map<String, dynamic>) {
                      item = customRadioBtn(
                          label: result["userLabel"],
                          options: result["options"]);
                      addInfo(null, result["userLabel"], result["options"],
                          "Radio");
                    }
                    break;
                  case "Checkbox":
                    final result = await Navigator.pushNamed(
                        context, "/createCheckboxForm");
                    if (result != null && result is Map<String, dynamic>) {
                      item = customCheckbox(
                          label: result["userLabel"],
                          options: result["options"]);
                      addInfo(null, result["userLabel"], result["options"],
                          "Checkbox");
                    }

                    break;
                  case "Text/Numeric Input":
                    final result = await Navigator.pushNamed(
                        context, "/createFieldTextForm");
                    if (result != null && result is Map<String, dynamic>) {
                      item = customTextField(
                          label: result["userLabel"],
                          numericInput: result["numeric"]);
                      String type =
                          result["numeric"] == true ? "Number" : "Text";

                      addInfo(null, result["userLabel"], null, type);
                    }
                    break;
                }
                /*Add new item to the form list*/
                if (item != null) {
                  addItemToList(item);
                }
                Navigator.pop(context);
              },
              child: Container(
                width: 150,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Add',
                      style: TextStyle(fontSize: 18),
                    ),
                    Icon(Icons.add)
                  ],
                ),
              ))
        ],
      ),
    );
  }
}
