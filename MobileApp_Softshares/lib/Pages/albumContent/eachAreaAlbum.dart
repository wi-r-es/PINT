import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';

class AreaAlbum extends StatefulWidget {
  const AreaAlbum({super.key, required this.area});

  final AreaClass area;

  @override
  State<AreaAlbum> createState() => _AreaAlbumState();
}

class _AreaAlbumState extends State<AreaAlbum> {
  API api = API();
  List<String> albums = [];
  var box = GetStorage();
  final ImagePicker imagePicker = ImagePicker();
  List<XFile>? imageFileList = [];
  List<String> imagesToDisplay = [];

  Future getAlbum() async {
    var data = await api.getAlbumArea(widget.area.id);
    imagesToDisplay = data;
    print(imagesToDisplay.length);
  }

  @override
  void initState() {
    super.initState();
    getAlbum();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.area.areaName),
        leading: IconButton(
            onPressed: () {
              Navigator.pop(context);
            },
            icon: const Icon(Icons.close)),
      ),
      body: galleryContent(colorScheme),
    );
  }

  Column galleryContent(ColorScheme colorScheme) {
    return Column(
      children: [
        Expanded(
            child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: FutureBuilder(
                    future: getAlbum(),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.done) {
                        if (imagesToDisplay.isNotEmpty) {
                          return GridView.builder(
                              itemCount: imagesToDisplay.length,
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                      crossAxisCount: 3),
                              itemBuilder: (context, index) {
                                return GestureDetector(
                                  onTap: () {
                                    showDialog(
                                      context: context,
                                      builder: (context) {
                                        return Dialog(
                                          child: InteractiveViewer(
                                            child: Image.network(
                                              '${box.read('url')}/uploads/${imagesToDisplay[index]}',
                                              fit: BoxFit.contain,
                                              errorBuilder:
                                                  (context, error, stackTrace) {
                                                return Container(
                                                  color: const Color.fromARGB(
                                                      255, 255, 204, 150),
                                                );
                                              },
                                            ),
                                          ),
                                        );
                                      },
                                    );
                                  },
                                  child: Image.network(
                                    '${box.read('url')}/uploads/${imagesToDisplay[index]}',
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return Container(
                                        color: const Color.fromARGB(
                                            255, 255, 204, 150),
                                      );
                                    },
                                  ),
                                );
                              });
                        } else {
                          return const Center(
                            child: Text('No images found'),
                          );
                        }
                      } else {
                        return const Center(
                          child: CircularProgressIndicator(),
                        );
                      }
                    }))),
        ElevatedButton(
          onPressed: () async {
            await selectImages();
            List<String> aux_list = [];
            for (var photo in imageFileList!) {
              var file = File(photo.path);
              String aux = await api.addToAlbumArea(widget.area.id, file);
              aux_list.add(aux);
            }
            setState(() {
              imagesToDisplay.addAll(aux_list);
              imageFileList!.clear();
            });
          },
          child: const Text(
            'Add images',
            style: TextStyle(color: Colors.white),
          ),
        )
      ],
    );
  }

  Future selectImages() async {
    final List<XFile>? selectedImages = await imagePicker.pickMultiImage();
    if (selectedImages!.isNotEmpty) {
      imageFileList!.addAll(selectedImages);
    }
    setState(() {});
  }
}
