import 'package:flutter/material.dart';

class customTextField extends StatefulWidget {
  final String label;
  final bool numericInput;
  TextEditingController? controller;

  customTextField(
      {Key? key,
      required this.label,
      required this.numericInput,
      this.controller})
      : super(key: key);

  @override
  State<customTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends State<customTextField> {
  late TextEditingController controller;
  @override
  void initState() {
    /*If not provided with a controller, create a new one */
    controller = widget.controller ?? TextEditingController();
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
    controller.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(left: 0, top: 20, right: 0),
      child: TextField(
        textCapitalization: TextCapitalization.sentences,
        controller: controller,
        keyboardType:
            widget.numericInput ? TextInputType.number : TextInputType.name,
        decoration: InputDecoration(
          labelText: widget.label,
          border: const UnderlineInputBorder(),
          enabledBorder: const UnderlineInputBorder(
            borderSide: BorderSide(color: Colors.grey),
          ),
          focusedBorder: const UnderlineInputBorder(
            borderSide: BorderSide(color: Colors.blue),
          ),
        ),
      ),
    );
  }
}
