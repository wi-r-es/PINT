import 'package:flutter/material.dart';
import 'package:softshares/Components/formAppBar.dart';

class customFieldtextForm extends StatefulWidget {
  customFieldtextForm({super.key});

  Color containerColor = const Color(0xFFFEF7FF);
  Color appBarColor = const Color(0xff80ADD7);
  Color appBarFont = const Color(0xFFFFFFFF);
  Color mainColor = const Color(0xff80ADD7);

  @override
  State<customFieldtextForm> createState() => _customFieldtextFormState();
}

class _customFieldtextFormState extends State<customFieldtextForm> {
  TextEditingController userLabelController = TextEditingController();

  String userLabel = '';
  bool isChecked = false;

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
    userLabelController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: formAppbar(
        title: 'Create Textfield',
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            margin: const EdgeInsets.only(left: 25, top: 20, right: 25),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(
                  child: Text('Label',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
                TextField(
                    textCapitalization: TextCapitalization.words,
                    controller: userLabelController,
                    onSubmitted: (value) {
                      userLabel = userLabelController.text;
                    },
                    keyboardType: TextInputType.name,
                    decoration: InputDecoration(
                        label: const Text('Label'),
                        border: OutlineInputBorder(
                            borderSide:
                                BorderSide(color: colorScheme.tertiary)))),
                Container(
                  margin: const EdgeInsets.only(left: 25, top: 20, right: 25),
                  child: Row(
                    children: [
                      const SizedBox(
                        child: Text(
                          'Numeric input ',
                          style: TextStyle(
                              fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ),
                      Checkbox(
                        value: isChecked,
                        onChanged: (value) {
                          setState(() {
                            isChecked = value!;
                          });
                        },
                      )
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(bottom: 20.0),
            child: Center(child: addBtn(colorScheme)),
          ),
        ],
      ),
    );
  }

  ElevatedButton addBtn(ColorScheme colorScheme) {
    return ElevatedButton(
        onPressed: () {
          if (userLabel != '') {
            Navigator.pop(
                context, {"userLabel": userLabel, "numeric": isChecked});
          } else {
            showDialog<void>(
                context: context,
                barrierDismissible: false,
                builder: (context) {
                  return AlertDialog(
                    title: const Text('Invalid label!'),
                    content: const Text('Please insert valid label'),
                    actions: [
                      TextButton(
                          onPressed: () {
                            Navigator.pop(context, 'Try again');
                          },
                          child: const Text('Try again'))
                    ],
                  );
                });
          }
        },
        style: ButtonStyle(
            backgroundColor:
                MaterialStateProperty.all<Color>(colorScheme.primary),
            foregroundColor:
                MaterialStateProperty.all<Color>(colorScheme.onPrimary)),
        child: Text('Add Fieldtext'));
  }
}
