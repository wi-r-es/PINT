import 'package:flutter/material.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import '../classes/commentClass.dart';

class CommentWidget extends StatefulWidget {
  Comment comment;
  bool liked;

  CommentWidget({Key? key, required this.comment, required this.liked})
      : super(key: key);

  @override
  _CommentWidgetState createState() => _CommentWidgetState();
}

class _CommentWidgetState extends State<CommentWidget> {
  bool _isReplying = false;
  final TextEditingController _replyController = TextEditingController();
  final TextEditingController _reportController = TextEditingController();
  API api = API();

  void _toggleReplying() {
    setState(() {
      _isReplying = !_isReplying;
    });
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: colorScheme.primary,
                  child: Text(
                    widget.comment.user.firstname[0].toUpperCase(),
                    style: TextStyle(color: colorScheme.onPrimary),
                  ),
                ),
                const SizedBox(width: 12.0),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "${widget.comment.user.firstname} ${widget.comment.user.lastName}",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: colorScheme.onSurface,
                        ),
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: widget.liked == false
                                ? const Icon(Icons.thumb_up_alt_outlined)
                                : const Icon(Icons.thumb_up_alt),
                            onPressed: () async {
                              if (widget.liked == false) {
                                await api.likeComment(widget.comment.id);
                                widget.comment.likes += 1;
                                print('LIKED');
                              } else {
                                await api.unlikeComment(widget.comment.id);
                                widget.comment.likes -= 1;
                                print('UNLIKED');
                              }

                              setState(() {
                                widget.liked = !widget.liked;
                                
                              });
                            },
                            tooltip: 'Like',
                          ),
                          Text(widget.comment.likes.toString())
                          // IconButton(
                          //   icon: const Icon(Icons.thumb_down_alt_outlined),
                          //   onPressed: () {},
                          //   tooltip: 'Dislike',
                          // ),
                        ],
                      ),
                    ],
                  ),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.report_problem_rounded),
                      onPressed: () {
                        showModalBottomSheet(
                          context: context,
                          builder: (BuildContext context) {
                            return StatefulBuilder(builder:
                                (BuildContext context, StateSetter setState) {
                              return reportBottomSheet(
                                  setState, context, colorScheme);
                            });
                          },
                        );
                      },
                      tooltip: 'Report',
                    ),
                    // IconButton(
                    //   icon: const Icon(Icons.chat_bubble_outline),
                    //   onPressed: _toggleReplying,
                    //   tooltip: 'Reply',
                    // ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8.0),
            Text(
              widget.comment.comment,
              style: TextStyle(color: colorScheme.onSurface),
            ),
            // if (_isReplying) ...[
            //   const SizedBox(height: 8.0),
            //   TextField(
            //     controller: _replyController,
            //     decoration: InputDecoration(
            //       labelText: 'Add a reply',
            //       suffixIcon: IconButton(
            //         icon: const Icon(Icons.send),
            //         onPressed: () {
            //           if (_replyController.text.isNotEmpty) {
            //             widget.onReply(_replyController.text);
            //             _replyController.clear();
            //             _toggleReplying();
            //           }
            //         },
            //       ),
            //       border: const OutlineInputBorder(),
            //     ),
            //   ),
            // ],
          ],
        ),
      ),
    );
  }

  SingleChildScrollView reportBottomSheet(
      StateSetter setState, BuildContext context, ColorScheme colorScheme) {
    return SingleChildScrollView(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.all(
            20.0), // Adds padding to the content inside the container
        decoration: BoxDecoration(
          shape: BoxShape.rectangle,
          borderRadius: const BorderRadius.all(Radius.circular(30)),
          color: colorScheme.primaryContainer,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Report Issue",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: colorScheme.onPrimaryContainer,
              ),
            ),
            const SizedBox(
                height: 10), // Adds space between the title and the description
            Text(
              "Please describe the issue you encountered:",
              style: TextStyle(
                fontSize: 16,
                color: colorScheme.onPrimaryContainer,
              ),
            ),
            const SizedBox(
                height:
                    10), // Adds space between the description and the TextField
            TextField(
              controller: _reportController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: "Enter your report here...",
                filled: true,
                fillColor: colorScheme.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  child: Text(
                    'Cancel',
                    style: TextStyle(color: colorScheme.onPrimary),
                  ),
                ),
                ElevatedButton(
                  onPressed: () async {
                    await api.reportComment(
                        widget.comment.id, _reportController.text);
                    Navigator.pop(context);
                  },
                  child: Text(
                    'Send report',
                    style: TextStyle(color: colorScheme.onPrimary),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _replyController.dispose();
    super.dispose();
  }
}
