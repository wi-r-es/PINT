import 'package:flutter/material.dart';
import 'package:softshares/Components/formAppBar.dart';

class customCheckboxForm extends StatefulWidget {
  customCheckboxForm({super.key});


  @override
  State<customCheckboxForm> createState() => _CustomCheckboxFormState();
}

class _CustomCheckboxFormState extends State<customCheckboxForm> {
  final TextEditingController labelController = TextEditingController();
  final TextEditingController numOptController = TextEditingController();

  final List<TextEditingController> controllers = [];
  final List<String> options = [];

  String userLabel = '';
  int optNum = 1;

  @override
  void initState() {
    super.initState();
    numOptController.text = optNum.toString();
    addControllers();
  }

  @override
  void dispose() {
    labelController.dispose();
    numOptController.dispose();
    for (var controller in controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void clearControllers() {
    for (var controller in controllers) {
      controller.dispose();
    }
    controllers.clear();
  }

  void addControllers() {
    for (int i = 0; i < optNum; i++) {
      controllers.add(TextEditingController());
    }
  }

  int returnValues() {
    options.clear();
    int result = 1;
    if (labelController.text.isEmpty) {
      result = -1;
    } else {
      userLabel = labelController.text;
      for (var controller in controllers) {
        if (controller.text.isEmpty) {
          result = 0;
          break;
        }
        options.add(controller.text);
      }
    }
    return result;
  }

  void showAlertDialog(String title, String content) {
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          title: Text(title),
          content: Text(content),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Try again'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: const formAppbar(title: 'Create Checkbox'),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Label',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            labelContent(),
            const Text(
              'Number of options',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            numOptionContent(),
            Expanded(
              child: ListView.builder(
                itemCount: optNum,
                itemBuilder: (context, index) {
                  return TextField(
                    controller: controllers[index],
                    decoration:
                        InputDecoration(labelText: 'Option ${index + 1}'),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 20.0),
              child: Center(child: addBtn(colorScheme)),
            ),
          ],
        ),
      ),
    );
  }

  ElevatedButton addBtn(ColorScheme colorScheme) {
    return ElevatedButton(
      onPressed: () {
        int result = returnValues();
        if (result == -1) {
          showAlertDialog('Invalid label', 'Label must not be empty.');
        } else if (result == 0) {
          showAlertDialog('Invalid options', 'Options must not be empty.');
        } else {
          Navigator.pop(context, {"userLabel": userLabel, "options": options});
        }
      },
      style: ButtonStyle(
          backgroundColor:
              MaterialStateProperty.all<Color>(colorScheme.primary),
          foregroundColor:
              MaterialStateProperty.all<Color>(colorScheme.onPrimary)),
      child: const Text('Add Fieldtext'),
    );
  }

  Container numOptionContent() {
    return Container(
      padding: const EdgeInsets.only(bottom: 20),
      child: TextField(
        textCapitalization: TextCapitalization.words,
        controller: numOptController,
        onSubmitted: (value) {
          int newOptNum = int.tryParse(value) ?? 1;
          if (newOptNum > 0) {
            setState(() {
              optNum = newOptNum;
              clearControllers();
              addControllers();
            });
          } else {
            showAlertDialog(
              'Invalid number of options',
              'Must be a positive number.',
            );
            setState(() {
              numOptController.text = "1";
              optNum = 1;
              clearControllers();
              addControllers();
            });
          }
        },
        keyboardType: TextInputType.number,
        decoration: const InputDecoration(
          border: OutlineInputBorder(),
        ),
      ),
    );
  }

  Container labelContent() {
    return Container(
      padding: const EdgeInsets.only(bottom: 20),
      child: TextField(
        textCapitalization: TextCapitalization.words,
        controller: labelController,
        decoration: const InputDecoration(
          labelText: 'Label',
          border: OutlineInputBorder(),
        ),
      ),
    );
  }
}
