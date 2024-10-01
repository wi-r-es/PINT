import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:softshares/Components/customCheckbox.dart';
import 'package:softshares/Components/customRadioBtn.dart';
import 'package:softshares/Components/customTextField.dart';
import 'package:softshares/Pages/pubsPages/eventsPage.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/event.dart';
import 'package:softshares/classes/fieldClass.dart';

class Register extends StatefulWidget {
  Register({super.key, required this.event, required this.areas});
  final Event event;
  List<AreaClass> areas;

  @override
  State<Register> createState() => _RegisterState();
}

List<Map<String, dynamic>> jsonForm = [];

class _RegisterState extends State<Register> {
  final API api = API();
  List<Field> fields = [];
  List<Widget> widgets = [];
  Map<String, TextEditingController> answers = {};
  List<TextEditingController> controllers = [];
  var responses = [];
  bool loaded = false, registered = false;

  void buildForm() {
    List<Widget> aux = [];
    //List<TextEditingController> aux_cx = [];
    for (var item in fields) {
      print(item.id);
      TextEditingController cx = TextEditingController();
      answers[item.id.toString()] = cx;

      //aux_cx.add(cx);
      switch (item.type) {
        case 'Text':
          aux.add(customTextField(
            label: item.name,
            numericInput: false,
            controller: cx,
          ));
          break;
        case 'Number':
          aux.add(customTextField(
            label: item.name,
            numericInput: true,
            controller: cx,
          ));
          break;
        case 'Radio':
          aux.add(customRadioBtn(
            label: item.name,
            options: item.options!,
            controller: cx,
          ));
          break;
        case 'Checkbox':
          aux.add(customCheckbox(
            label: item.name,
            options: item.options!,
            controller: cx,
          ));
      }
    }
    setState(() {
      //controllers = aux_cx;
      widgets = aux;
    });
  }

  Future<void> getForm() async {
    fields = await api.getForm(widget.event.id!);
    buildForm();
    setState(() {
      loaded = true;
    });
  }

  // Create jsonObject to send to server
  void addInfo(String id, TextEditingController options) {
    var object = {
      "ANSWERS": options.text,
      "field_id": id,
    };
    jsonForm.add(object);
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
        title: const Text('Register'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (!loaded)
                const Center(
                  child: CircularProgressIndicator(),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: NeverScrollableScrollPhysics(),
                  itemCount: widgets.length,
                  itemBuilder: (context, index) {
                    return widgets[index];
                  },
                ),
              const SizedBox(height: 20), // Add some space before the button
              ElevatedButton(
                style: ButtonStyle(
                  foregroundColor:
                      MaterialStateProperty.all<Color>(colorScheme.onPrimary),
                  backgroundColor:
                      MaterialStateProperty.all<Color>(colorScheme.primary),
                ),
                onPressed: () async {
                  setState(() {
                    answers.forEach((k, v) => addInfo(k, v));
                  });

                  var data = jsonEncode(jsonForm);

                  try {
                    await api.sendFormAnswer(widget.event.id!, data);
                    registered = true;
                    // Show success snackbar after successful registration
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content:
                            Text('Your form has been successfully submitted.'),
                        backgroundColor: Colors.green,
                        duration: Duration(seconds: 5),
                      ),
                    );
                  } catch (e) {
                    // Show error snackbar if registration fails
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Registration failed: $e'),
                        backgroundColor: Colors.red,
                        duration: const Duration(seconds: 5),
                      ),
                    );
                  }
                  Navigator.pop(context, {'register': registered});
                },
                child: const Text('Register'),
              )
            ],
          ),
        ),
      ),
    );
  }
}
