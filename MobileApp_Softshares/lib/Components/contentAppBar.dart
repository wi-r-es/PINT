import 'package:flutter/material.dart';
import 'package:softshares/Pages/editPubs/editEvent.dart';
import 'package:softshares/Pages/editPubs/editForum.dart';
import 'package:softshares/Pages/editPubs/editPost.dart';
import 'package:softshares/Pages/filterPOIPage.dart';
import 'package:softshares/Pages/homepage.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/event.dart';
import 'package:softshares/classes/forums.dart';
import 'package:softshares/classes/publication.dart';
import 'package:share_plus/share_plus.dart';

class contentAppBar extends StatefulWidget implements PreferredSizeWidget {
  const contentAppBar(
      {super.key, required this.pub, required this.areas, this.rightCallback});
  final Publication pub;
  final void Function(BuildContext)? rightCallback;
  final List<AreaClass> areas;
  @override
  State<contentAppBar> createState() => _contentAppBarState();
  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

class _contentAppBarState extends State<contentAppBar> {
  final TextEditingController _scoreController = TextEditingController();
  API api = API();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return AppBar(
      leading: IconButton(
        onPressed: () {
          Navigator.pop(context);
        },
        icon: const Icon(Icons.close),
      ),
      title: Text(widget.pub.title),
      actions: [
        IconButton(
            onPressed: () {
              Share.share(
                  '_Check out this publication:_\n*${widget.pub.title}*\n ${widget.pub.desc}');
            },
            icon: const Icon(Icons.share)),
        widget.rightCallback != null
            ? IconButton(
                onPressed: () => widget.rightCallback!(context),
                icon: widget.pub.validated == false
                    ? const Icon(Icons.edit)
                    : const Icon(Icons.rate_review))
            : const SizedBox.shrink()
      ],
    );
  }

  @override
  void dispose() {
    _scoreController.dispose();
    super.dispose();
  }
}
