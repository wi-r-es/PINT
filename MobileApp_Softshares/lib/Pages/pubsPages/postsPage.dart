import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:get_storage/get_storage.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:softshares/Components/comments.dart';
import 'package:softshares/Components/contentAppBar.dart';
import 'package:softshares/Components/formAppBar.dart';
import 'package:softshares/Pages/editPubs/editPost.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/commentClass.dart';
import 'package:softshares/classes/publication.dart';
import 'package:softshares/classes/user.dart';

class PostPage extends StatefulWidget {
  PostPage({super.key, required this.publication, required this.areas});

  final Publication publication;
  List<AreaClass> areas;

  @override
  State<PostPage> createState() => _PostPageState();
}

class _PostPageState extends State<PostPage> {
  API api = API();
  TextEditingController commentCx = TextEditingController();
  late GoogleMapController mapController;
  final _commentKey = GlobalKey<FormState>();
  List<Comment> comments = [];
  int _charCount = 0;
  final int _charLimit = 500;
  List<int> likedComments = [];
  var box = GetStorage();
  final TextEditingController _scoreController = TextEditingController();
  LatLng? local;

  Future<void> getComments() async {
    comments = await api.getComents(widget.publication);
    setState(() {});
  }

  LatLng? convertCoord(String? location) {
    if (location != null) {
      List<String> coords = location.split(" ");
      double lat = double.tryParse(coords[0])!;
      double lon = double.tryParse(coords[1])!;
      return LatLng(lat, lon);
    }
    return null;
  }

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  Future<void> getLikes() async {
    var data = await api.getComentsLikes(widget.publication);
    likedComments = data;
  }

  @override
  void initState() {
    super.initState();
    getComments();
    commentCx.addListener(_updateCharCount);
    getLikes();
    print('RATING: ${widget.publication.aval?.round()}');
    local = convertCoord(widget.publication.location);
  }

  void _updateCharCount() {
    setState(() {
      _charCount = commentCx.text.length;
    });
  }

  void ratePub(BuildContext context, ColorScheme colorScheme) {
    showModalBottomSheet(
      context: context,
      isScrollControlled:
          true, // Allow the bottom sheet to be responsive to the keyboard
      builder: (BuildContext context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context)
                .viewInsets
                .bottom, // Adjust padding for keyboard
            left: 16,
            right: 16,
            top: 16,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Submit your review',
                  style: TextStyle(color: colorScheme.onPrimary),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _scoreController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Enter your score (1-5)',
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    final score = int.tryParse(_scoreController.text);
                    if (score != null && score >= 1 && score <= 5) {
                      await api.ratePub(widget.publication, score);

                      double aux_score =
                          await api.getPostScore(widget.publication.id!);

                      setState(() {
                        widget.publication.aval = aux_score;
                      });

                      Navigator.pop(context);
                    } else {
                      // Show an error message or handle invalid input
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                              'Please enter a valid score between 1 and 5.'),
                        ),
                      );
                    }
                  },
                  style: ButtonStyle(
                    backgroundColor:
                        MaterialStatePropertyAll(colorScheme.primary),
                  ),
                  child: Text(
                    'Submit',
                    style: TextStyle(color: colorScheme.onPrimary),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void editPub(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            EditPost(post: widget.publication, areas: widget.areas),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: contentAppBar(
        pub: widget.publication,
        areas: widget.areas,
        rightCallback: (context) {
          if (widget.publication.validated == true) {
            ratePub(context, colorScheme);
          } else {
            editPub(context);
          }
        },
      ),
      body: Padding(
        padding: const EdgeInsets.all(18.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    cardHeader(colorScheme),
                    Padding(
                      padding: const EdgeInsets.only(top: 8.0, bottom: 5.0),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          widget.publication.title,
                          style: TextStyle(fontSize: 22),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    widget.publication.img != null
                        ? Padding(
                            padding: const EdgeInsets.only(top: 10.0),
                            child: Container(
                              width: double.infinity,
                              height: 170,
                              child: ClipRRect(
                                borderRadius:
                                    BorderRadius.all(Radius.circular(8)),
                                child: Image.network(
                                  '${box.read('url')}/uploads/${widget.publication.img!.path}',
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      color: const Color.fromARGB(
                                          255, 150, 216, 255),
                                    );
                                  },
                                ),
                              ),
                            ),
                          )
                        : Container(
                            width: double.infinity,
                            height: 170,
                            decoration: BoxDecoration(
                              color: const Color.fromARGB(255, 150, 216, 255),
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                    const SizedBox(height: 10),
                    Text(
                      widget.publication.desc,
                      style: TextStyle(fontSize: 18),
                    ),
                    const SizedBox(height: 10),
                    widget.publication.location != null
                        ? Container(
                            width: double.infinity,
                            height: 250,
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(20.0),
                              child: GoogleMap(
                                onMapCreated: _onMapCreated,
                                initialCameraPosition: CameraPosition(
                                  target: local!,
                                  zoom: 11.0,
                                ),
                                markers: {
                                  Marker(
                                    markerId: const MarkerId('Event'),
                                    position: local!,
                                  ),
                                },
                              ),
                            ),
                          )
                        : const SizedBox.shrink(),
                    const SizedBox(height: 10),
                    Row(children: [
                      const Text(
                        'User review: ',
                        style: TextStyle(fontSize: 20),
                      ),
                      ...List.generate(
                        widget.publication.aval!.round(),
                        (index) => Icon(
                          Icons.star,
                          color: Theme.of(context).colorScheme.secondary,
                          size: 25,
                        ),
                      ),
                    ]),
                    const Divider(
                      color: Colors.black,
                      height: 30,
                      thickness: 2,
                      indent: 10,
                      endIndent: 10,
                    ),
                    comments.isEmpty
                        ? const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Icon(
                                  Icons.sentiment_dissatisfied,
                                  size: 50,
                                ),
                                Text(
                                  'So empty',
                                  style: TextStyle(fontSize: 24),
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: comments.length,
                            itemBuilder: (context, index) {
                              bool liked =
                                  likedComments.contains(comments[index].id);
                              return CommentWidget(
                                liked: liked,
                                comment: comments[index],
                              );
                            },
                          ),
                  ],
                ),
              ),
            ),
            Form(
              key: _commentKey,
              child: TextFormField(
                textCapitalization: TextCapitalization.sentences,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter comment';
                  }
                  return null;
                },
                controller: commentCx,
                decoration: InputDecoration(
                  label: Text(
                    'Characters: $_charCount',
                    style: TextStyle(
                      color: _charCount > _charLimit
                          ? Colors.red
                          : colorScheme.onPrimary,
                    ),
                  ),
                  suffixIcon: IconButton(
                    onPressed: () async {
                      if (_commentKey.currentState!.validate()) {
                        await api.createComment(
                            widget.publication, commentCx.text);
                        commentCx.clear();
                        await getComments(); // Fetch comments again
                      }
                    },
                    icon: const Icon(Icons.send),
                  ),
                  border: const OutlineInputBorder(borderSide: BorderSide()),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Container commentCircle(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.only(right: 6.0),
      height: 40,
      width: 40,
      decoration: BoxDecoration(
        color: colorScheme.secondary,
        border: Border.all(width: 3, color: Colors.transparent),
        borderRadius: BorderRadius.circular(95),
      ),
      child: Center(
        // If user does not have Profile Pic, print first letter of first name
        child: widget.publication.user.profileImg == null
            ? Text(
                widget.publication.user.firstname[0],
                style: TextStyle(fontSize: 20, color: colorScheme.onPrimary),
              )
            : const Text('I'),
      ),
    );
  }

  Row cardHeader(ColorScheme colorScheme) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              margin: const EdgeInsets.only(right: 6.0),
              height: 40,
              width: 40,
              decoration: BoxDecoration(
                  color: colorScheme.secondary,
                  border: Border.all(width: 3, color: Colors.transparent),
                  borderRadius: BorderRadius.circular(95)),
              child: Center(
                  //If user does not have Profile Pic, print first letter of first name
                  child: widget.publication.user.profileImg == null
                      ? Text(
                          widget.publication.user.firstname[0],
                          style: TextStyle(
                              fontSize: 20, color: colorScheme.onPrimary),
                        )
                      : const Text('I')),
            ),
            Text(
              "${widget.publication.user.firstname} ${widget.publication.user.lastName}",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            )
          ],
        ),
      ],
    );
  }
}
