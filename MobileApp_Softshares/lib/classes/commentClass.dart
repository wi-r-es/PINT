import 'package:softshares/classes/user.dart';

class Comment {
  User user;
  int likes;
  String comment;
  int id;

  Comment({required this.user, required this.comment, required this.likes, required this.id});
}
