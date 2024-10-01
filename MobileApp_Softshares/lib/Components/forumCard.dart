import 'package:flutter/material.dart';
import 'package:softshares/Pages/pubsPages/forumPage.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/forums.dart';
import 'package:softshares/classes/publication.dart';

class ForumCard extends StatefulWidget {
  ForumCard({super.key, required this.forum, required this.areas});

  final Forum forum;
     List<AreaClass> areas;

  @override
  State<ForumCard> createState() => _POIState();
}

class _POIState extends State<ForumCard> {
  bool saved = false;

  @override
  void initState() {
    super.initState();
    widget.forum.getSubAreaName();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ForumPage(
              forum: widget.forum,
              areas: widget.areas
            ),
          ),
        );
      },
      child: Card(
        margin: const EdgeInsets.fromLTRB(26, 26, 20, 0),
        child: Column(
          children: [
            widget.forum.validated == false
                ? const Padding(
                    padding: EdgeInsets.only(top: 8.0),
                    child: Text(
                      textAlign: TextAlign.center,
                      'Awaiting validation',
                      style: TextStyle(
                        color: Colors.redAccent,
                      ),
                    ),
                  )
                : Container(),
            Padding(
              padding: const EdgeInsets.fromLTRB(14.0, 20.0, 14.0, 20.0),
              child: cardHeader(colorScheme),
            ),
            Padding(
              padding: const EdgeInsets.all(14.0),
              child: textContent(colorScheme),
            ),
            Padding(
              padding: const EdgeInsets.only(
                  top: 20.0, bottom: 50.0, left: 14, right: 14),
              child: Container(
                alignment: Alignment.centerLeft,
                child: Text(
                  widget.forum.desc,
                  textAlign: TextAlign.start,
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Row textContent(ColorScheme colorScheme) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            widget.forum.title.length > 20
                ? Text(
                    widget.forum.title.substring(0, 20) + '....',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  )
                : Text(
                    widget.forum.title,
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
            Text(
              widget.forum.subAreaName,
              style: TextStyle(color: colorScheme.onTertiary, fontSize: 16),
            )
          ],
        ),
      ],
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
                  child: widget.forum.user.profileImg == null
                      ? Text(
                          widget.forum.user.firstname[0],
                          style: TextStyle(
                              fontSize: 20, color: colorScheme.onPrimary),
                        )
                      : Image.network(widget.forum.user.profileImg!)),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "${widget.forum.user.firstname} ${widget.forum.user.lastName}",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}
