import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:softshares/Components/comments.dart';
import 'package:softshares/Components/contentAppBar.dart';
import 'package:softshares/Pages/editPubs/editForum.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/commentClass.dart';
import 'package:softshares/classes/forums.dart';
import 'package:softshares/classes/user.dart';

class ForumPage extends StatefulWidget {
  ForumPage({super.key, required this.forum, required this.areas});

  final Forum forum;
  List<AreaClass> areas;

  @override
  State<ForumPage> createState() => _ForumPageState();
}

class _ForumPageState extends State<ForumPage> {
  API api = API();
  TextEditingController commentCx = TextEditingController();
  final _commentKey = GlobalKey<FormState>();
  List<Comment> comments = [];
  List<int> likedComments = [];
  int _charCount = 0;
  final int _charLimit = 500;

  Future<void> getComments() async {
    comments = await api.getComents(widget.forum);
    setState(() {});
  }

  Future<void> getLikes() async {
    var data = await api.getComentsLikes(widget.forum);
    likedComments = data;
  }

  @override
  void initState() {
    super.initState();
    getComments();
    getLikes();
    commentCx.addListener(_updateCharCount);
  }

  void _updateCharCount() {
    setState(() {
      _charCount = commentCx.text.length;
    });
  }

  @override
  void dispose() {
    super.dispose();
    commentCx.dispose();
  }

  void editPub(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EditForum(pub: widget.forum, areas: widget.areas),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: contentAppBar(
        pub: widget.forum,
        areas: widget.areas,
        rightCallback: editPub,
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
                          widget.forum.title,
                          style: TextStyle(fontSize: 22),
                        ),
                      ),
                    ),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        widget.forum.desc,
                        style: const TextStyle(
                          fontSize: 16,
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
                        await api.createComment(widget.forum, commentCx.text);
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
      height: 25,
      width: 25,
      decoration: BoxDecoration(
        color: colorScheme.secondary,
        border: Border.all(width: 3, color: Colors.transparent),
        borderRadius: BorderRadius.circular(95),
      ),
      child: Center(
        // If user does not have Profile Pic, print first letter of first name
        child: widget.forum.user.profileImg == null
            ? Text(
                widget.forum.user.firstname[0],
                style: TextStyle(fontSize: 13, color: colorScheme.onPrimary),
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
                borderRadius: BorderRadius.circular(95),
              ),
              child: Center(
                // If user does not have Profile Pic, print first letter of first name
                child: widget.forum.user.profileImg == null
                    ? Text(
                        widget.forum.user.firstname[0],
                        style: TextStyle(
                            fontSize: 20, color: colorScheme.onPrimary),
                      )
                    : Text(
                        widget.forum.user.firstname[0],
                        style: TextStyle(color: colorScheme.onPrimary),
                      ),
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "${widget.forum.user.firstname} ${widget.forum.user.lastName}",
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}
