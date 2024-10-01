import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:softshares/Pages/pubsPages/eventsPage.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/event.dart';

class EventCard extends StatefulWidget {
  EventCard({super.key, required this.event, required this.areas});

  final Event event;
  List<AreaClass> areas;

  @override
  State<EventCard> createState() => _EventCardState();
}

class _EventCardState extends State<EventCard> {
  bool saved = false;
  var box = GetStorage();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) =>
                EventPage(event: widget.event, areas: widget.areas),
          ),
        );
      },
      child: Card(
        margin: EdgeInsets.fromLTRB(26, 26, 20, 0),
        child: Column(
          children: [
            widget.event.validated == false
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
            //If image == null, put color instead
            widget.event.img == null
                ? Container(
                    color: const Color.fromARGB(255, 255, 204, 150),
                    height: 120,
                  )
                : Container(
                    height: 120,
                    width: double
                        .infinity, // Ensures the image covers the full width
                    child: Image.network(
                      '${box.read('url')}/uploads/${widget.event.img!.path}',
                      fit: BoxFit.cover,
                      // Handles images not existing
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: const Color.fromARGB(255, 255, 204, 150),
                          height: 120,
                        );
                      },
                    ),
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
                  widget.event.desc,
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
            widget.event.title.length > 20
                ? Text(
                    widget.event.title.substring(0, 20) + '....',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  )
                : Text(
                    widget.event.title,
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
            Text(
              widget.event.subAreaName,
              style: TextStyle(color: colorScheme.onTertiary, fontSize: 16),
            )
          ],
        ),
        Column(
          children: [
            Text(
              '${widget.event.eventDate.day}/${widget.event.eventDate.month}/${widget.event.eventDate.year}',
              style: TextStyle(color: colorScheme.primary, fontSize: 20),
            ),
            widget.event.aval != null
                ? Row(
                    children: List.generate(
                        widget.event.aval!.round(),
                        (start) => Icon(
                              Icons.star,
                              color: colorScheme.secondary,
                              size: 25,
                            )))
                : const SizedBox()
          ],
        )
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
                  child: widget.event.user.profileImg == null
                      ? Text(
                          widget.event.user.firstname[0],
                          style: TextStyle(
                              fontSize: 20, color: colorScheme.onPrimary),
                        )
                      : const Text('I')),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "${widget.event.user.firstname} ${widget.event.user.lastName}",
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
