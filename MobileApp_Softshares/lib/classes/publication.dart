import 'dart:io';

import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/user.dart';

class Publication {
  final API api = API();
  int? id;
  User _user;
  String _desc, _title;
  bool? validated;
  DateTime _postDate;
  int subCategory;
  late String subAreaName;
  String? location, type;
  File? img;
  double? aval, price;

  Publication(
      this.id,
      this._user,
      this._desc,
      this._title,
      this.validated,
      this.subCategory,
      this._postDate,
      this.img,
      this.location,
      this.aval,
      this.price);

  User get user => _user;
  String get desc => _desc;
  String get title => _title;

  DateTime get datePost => _postDate;
  set user(User value) {
    _user = value;
  }

  set desc(String value) {
    _desc = value;
  }

  set title(String value) {
    _title = value;
  }

  set postDate(DateTime value) {
    _postDate = value;
  }

  Future<void> getSubAreaName() async {
    subAreaName = await api.getSubAreaName(subCategory);
  }
}
