import 'dart:ffi';
import 'dart:io';

import 'package:flutter/material.dart';

import '../classes/user.dart';
import '../classes/publication.dart';

class Event extends Publication {
  DateTime eventDate;
  TimeOfDay? event_start, event_end;
  bool recurring;
  String? recurring_path;
  Event(
    int? id,
    User user,
    String desc,
    String title,
    bool validated,
    int subCategory,
    DateTime postDate,
    File? imgPath,
    String? location,
    double? aval,
    this.eventDate,
    this.recurring,
    this.recurring_path,
    this.event_start,
    this.event_end,
  ) : super(id, user, desc, title, validated, subCategory, postDate, imgPath,
            location, aval, null);

  
}
