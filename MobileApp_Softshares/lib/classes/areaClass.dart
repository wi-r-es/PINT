import 'package:flutter/material.dart';

class AreaClass {
  String areaName;
  IconData? icon;
  int id;
  List<AreaClass>? subareas;
  String? areaBelongs;

  AreaClass(
      {required this.id, required this.areaName, this.icon, this.subareas});
}
