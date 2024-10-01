import 'package:flutter/material.dart';

class customRadioBtn extends StatefulWidget {
  final String label;
  final List<String> options;
  TextEditingController? controller;

  customRadioBtn(
      {Key? key, required this.label, required this.options, this.controller})
      : super(key: key);

  @override
  State<customRadioBtn> createState() => _CustomRadioBtnState();
}

class _CustomRadioBtnState extends State<customRadioBtn> {
  late String currentOption;
  late TextEditingController controller;

  @override
  void initState() {
    super.initState();
    currentOption = widget.options[0];
    controller = widget.controller ?? TextEditingController();
    controller.text = currentOption;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 25.0, top: 20),
          child: Text(
            widget.label,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
        ),
        Column(
          children: widget.options.map((option) {
            return RadioListTile(
              title: Text(option),
              value: option,
              groupValue: currentOption,
              onChanged: (value) {
                setState(() {
                  currentOption = value.toString();
                  controller.text = currentOption;
                });
              },
            );
          }).toList(),
        ),
      ],
    );
  }
}
