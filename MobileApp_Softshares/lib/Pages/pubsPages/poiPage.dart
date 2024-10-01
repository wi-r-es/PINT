import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:get_storage/get_storage.dart';
import 'package:softshares/Components/comments.dart';
import 'package:softshares/Components/contentAppBar.dart';
import 'package:softshares/Components/formAppBar.dart';
import 'package:softshares/Pages/editPubs/editPOIs.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/commentClass.dart';
import 'package:softshares/classes/publication.dart';
import 'package:softshares/classes/user.dart';

class POIPage extends StatefulWidget {
  POIPage({super.key, required this.poi, required this.areas});

  final Publication poi;
  List<AreaClass> areas;

  @override
  State<POIPage> createState() => _POIPageState();
}

class _POIPageState extends State<POIPage> {
  late GoogleMapController mapController;
  late LatLng local;
  API api = API();
  TextEditingController commentCx = TextEditingController();
  final _commentKey = GlobalKey<FormState>();
  List<Comment> comments = [];
  List<int> likedComments = [];
  late int _remainingChars;
  final int _charLimit = 500;
  var box = GetStorage();

  Future<void> getComments() async {
    comments = await api.getComents(widget.poi);
    setState(() {}); // Ensure the UI updates after fetching comments
  }

  @override
  void dispose() {
    super.dispose();
    commentCx.dispose();
  }

  void editPub(BuildContext context) {
    print('YO');
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EditPOI(post: widget.poi, areas: widget.areas),
      ),
    );
  }

  LatLng convertCoord(String location) {
    List<String> coords = location.split(" ");
    double lat = double.tryParse(coords[0])!;
    double lon = double.tryParse(coords[1])!;
    return LatLng(lat, lon);
  }

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  Future<void> getLikes() async {
    var data = await api.getComentsLikes(widget.poi);
    likedComments = data;
  }

  @override
  void initState() {
    super.initState();
    local = convertCoord(widget.poi.location!);
    _remainingChars = _charLimit;
    getComments();
    commentCx.addListener(_updateCharCount);
    getLikes();
  }

  void _updateCharCount() {
    setState(() {
      _remainingChars = _charLimit - commentCx.text.length;
    });
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: contentAppBar(
        pub: widget.poi,
        areas: widget.areas,
        rightCallback: (context) => editPub(context),
      ),
      body: Padding(
        padding: const EdgeInsets.all(18.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    cardHeader(colorScheme),
                    Padding(
                      padding: const EdgeInsets.only(top: 8.0, bottom: 5.0),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          widget.poi.title,
                          style: TextStyle(fontSize: 22),
                        ),
                      ),
                    ),
                    widget.poi.img != null
                        ? Padding(
                            padding: const EdgeInsets.only(top: 10.0),
                            child: Container(
                              width: double.infinity,
                              height: 250,
                              child: ClipRRect(
                                borderRadius:
                                    BorderRadius.all(Radius.circular(8)),
                                child: Image.network(
                                    fit: BoxFit.cover,
                                    '${box.read('url')}/uploads/${widget.poi.img!.path}',
                                    //Handles images not existing
                                    errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    color: Color.fromARGB(255, 159, 255, 150),
                                  );
                                }),
                              ),
                            ),
                          )
                        : Container(),
                    Padding(
                      padding: const EdgeInsets.only(top: 18.0, bottom: 18.0),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          widget.poi.desc,
                          style: TextStyle(fontSize: 18),
                        ),
                      ),
                    ),
                    Container(
                      width: double.infinity,
                      height: 250,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20.0),
                        child: GoogleMap(
                          onMapCreated: _onMapCreated,
                          initialCameraPosition: CameraPosition(
                            target: local,
                            zoom: 11.0,
                          ),
                          markers: {
                            Marker(
                              markerId: const MarkerId('Event'),
                              position: local,
                            ),
                          },
                        ),
                      ),
                    ),
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
                    'Remaining characters: $_remainingChars',
                    style: TextStyle(
                      color: _remainingChars < 0 ? Colors.red : Colors.black,
                    ),
                  ),
                  suffixIcon: IconButton(
                    onPressed: () async {
                      if (_commentKey.currentState!.validate()) {
                        await api.createComment(widget.poi, commentCx.text);
                        commentCx.clear();
                        await getComments();
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
        child: widget.poi.user.profileImg == null
            ? Text(
                widget.poi.user.firstname[0],
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
                  child: widget.poi.user.profileImg == null
                      ? Text(
                          widget.poi.user.firstname[0],
                          style: TextStyle(
                              fontSize: 20, color: colorScheme.onPrimary),
                        )
                      : const Text('I')),
            ),
            Text(
              "${widget.poi.user.firstname} ${widget.poi.user.lastName}",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ],
        ),
        Row(
            children: List.generate(
                widget.poi.aval!.round(),
                (start) => Icon(
                      Icons.star,
                      color: colorScheme.secondary,
                      size: 30,
                    ))),
      ],
    );
  }
}
