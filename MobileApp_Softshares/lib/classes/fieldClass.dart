// Class that helps with dynamic forms

class Field {
  String name, type;
  int id;
  List<String>? options;

  Field({
    required this.name,
    required this.type,
    this.options,
    required this.id
  });
}
