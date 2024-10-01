import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:softshares/Components/appBar.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/db.dart';
import 'package:softshares/classes/forums.dart';
import 'package:softshares/classes/user.dart';
import 'package:softshares/providers/auth_provider.dart';

class EditForum extends StatefulWidget {
  EditForum({super.key, required this.pub, required this.areas});

  Forum pub;
  List<AreaClass> areas;

  @override
  State<EditForum> createState() => _EditForumState();
}

class _EditForumState extends State<EditForum> {
  final _forumKey = GlobalKey<FormState>();
  final API api = API();
  SQLHelper bd = SQLHelper.instance;
  final box = GetStorage();

  TextEditingController titleController = TextEditingController();
  TextEditingController descController = TextEditingController();

  late AreaClass selectedArea;
  late AreaClass selectedSubArea;
  late double currentSlideValue;
  late double currentPriceValue;

  //Variables to en/disable rating and price sliders when not necessary
  late bool nonRating;
  late bool nonPrice;

  @override
  void initState() {
    titleController.text = widget.pub.title;
    descController.text = widget.pub.desc;
    super.initState();
    for (var area in widget.areas) {
      if (area.subareas != null) {
        for (var subArea in area.subareas!) {
          if (subArea.id == widget.pub.subCategory) {
            selectedArea = area;
            selectedSubArea = subArea;
          }
        }
      }
    }
  }

  @override
  void dispose() {
    super.dispose();
    titleController.dispose();
    descController.dispose();
  }

  void rigthCallBack(context) {
    print('search');
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
        appBar: MyAppBar(
            iconR: const Icon(Icons.close),
            title: 'Edit',
            rightCallback: rigthCallBack),
        body: SingleChildScrollView(
          child: Form(
            key: _forumKey,
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.report,
                        color: colorScheme.error,
                      ),
                      const SizedBox(
                        width: 8,
                      ),
                      Expanded(
                          child: Text(
                        'Only alter what you want to update',
                        style: TextStyle(color: colorScheme.error),
                      ))
                    ],
                  ),
                  const Text(
                    'Title',
                    style: TextStyle(fontSize: 22),
                  ),
                  TextFormField(
                    textCapitalization: TextCapitalization.sentences,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please insert title';
                      }
                      return null;
                    },
                    controller: titleController,
                    decoration: const InputDecoration(
                      labelText: 'Title',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.all(
                          Radius.circular(8.0),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Description',
                    style: TextStyle(fontSize: 22),
                  ),
                  TextFormField(
                    onChanged: (text) {
                      descController.text = text;
                    },
                    textCapitalization: TextCapitalization.sentences,
                    controller: descController,
                    decoration: const InputDecoration(
                      labelText: 'Description',
                      hintText: 'Body text (optional)',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.all(
                          Radius.circular(8.0),
                        ),
                      ),
                    ),
                    maxLines: null,
                  ),
                  const SizedBox(height: 30),
                  const Text(
                    'Area',
                    style: TextStyle(fontSize: 22),
                  ),
                  Container(
                    padding: const EdgeInsets.only(
                        left: 20, right: 20, top: 5, bottom: 5),
                    decoration: BoxDecoration(
                        border: Border.all(color: colorScheme.onPrimary),
                        borderRadius:
                            const BorderRadius.all(Radius.circular(8.0))),
                    child: DropdownButton<AreaClass>(
                      isExpanded: true,
                      hint: const Text('Select Area'),
                      underline: const SizedBox.shrink(),
                      value: selectedArea,
                      items: widget.areas.map((AreaClass area) {
                        return DropdownMenuItem<AreaClass>(
                          value: area,
                          child: Text(area.areaName),
                        );
                      }).toList(),
                      onChanged: (AreaClass? value) {
                        setState(() {
                          selectedArea = value!;
                          selectedSubArea = selectedArea.subareas![0];
                        });
                      },
                    ),
                  ),
                  const SizedBox(
                    height: 30,
                  ),
                  const Text(
                    'Sub Area',
                    style: TextStyle(fontSize: 22),
                  ),
                  Container(
                    padding: const EdgeInsets.only(
                        left: 20, right: 20, top: 5, bottom: 5),
                    decoration: BoxDecoration(
                        border: Border.all(color: colorScheme.onPrimary),
                        borderRadius:
                            const BorderRadius.all(Radius.circular(8.0))),
                    child: DropdownButton<AreaClass>(
                      isExpanded: true,
                      hint: const Text('Select Sub Area'),
                      underline: const SizedBox.shrink(),
                      value: selectedSubArea,
                      items: selectedArea.subareas!.map((AreaClass area) {
                        return DropdownMenuItem<AreaClass>(
                          value: area,
                          child: Text(area.areaName),
                        );
                      }).toList(),
                      onChanged: (AreaClass? value) {
                        setState(() {
                          selectedSubArea = value!;
                        });
                      },
                    ),
                  ),
                  const SizedBox(height: 30),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: colorScheme.primary),
                    onPressed: () async {
                      if (_forumKey.currentState!.validate()) {
                        User user = await api.getUser(box.read('id'));

                        // Compare the current values with the initial values
                        String? title = titleController.text == widget.pub.title
                            ? null
                            : titleController.text;
                        String? desc = descController.text == widget.pub.desc
                            ? null
                            : descController.text;
                        int? subAreaId =
                            selectedSubArea.id == widget.pub.subCategory
                                ? null
                                : selectedSubArea.id;

                        try {
                          await api.editForum(
                            forumId: widget.pub.id!,
                            title: title,
                            desc: desc,
                            subAreaId: subAreaId,
                            publisherId: user.id,
                          );
                        } catch (e) {
                          await showDialog(
                            context: context,
                            builder: (context) => AlertDialog(
                              title: const Text('Error editing post'),
                              content: const Text(
                                  'An error occurred while editing the Post'),
                              actions: [
                                TextButton(
                                  onPressed: () {
                                    Navigator.pushNamed(
                                        context, '/home'); // Close the dialog
                                  },
                                  child: const Text('OK'),
                                ),
                              ],
                            ),
                          );
                        }
                        Navigator.pushNamed(context, '/home');
                      }
                    },
                    child: Text('Edit Forum',
                        style: TextStyle(color: colorScheme.onPrimary)),
                  ),
                ],
              ),
            ),
          ),
        ));
  }
}
