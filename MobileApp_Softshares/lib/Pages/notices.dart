import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/noticesClass.dart';
import 'package:softshares/classes/user.dart';

class Notices extends StatefulWidget {
  const Notices({super.key});

  @override
  State<Notices> createState() => _NoticesState();
}

class _NoticesState extends State<Notices> {
  API api = API();
  var box = GetStorage();
  List<Notice> notices = [];

  Future getNotices() async {
    var data = await api.getNotices();
    notices = data;
  }

  Color noticeColor(int level) {
    if (level <= 2 && level >= 1) {
      return Colors.green;
    } else if (level <= 4 && level >= 3) {
      return Color.fromARGB(255, 199, 202, 30);
    }

    return Colors.red;
  }

  @override
  void initState() {
    super.initState();
    getNotices();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: Icon(Icons.close),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
          title: const Text('Notices'),
        ),
        body: FutureBuilder(
          future: getNotices(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.done) {
              if (snapshot.hasError) {
                print(snapshot.error);
                return const Center(
                  child: Text('Something went wrong :(\n Try again'),
                );
              } else if (notices.isEmpty) {
                return const Center(
                  child: Text('No notices'),
                );
              }
              return ListView.builder(
                  itemCount: notices.length,
                  itemBuilder: (context, index) {
                    return Card(
                      color: noticeColor(notices[index].level),
                      margin: const EdgeInsets.symmetric(
                          vertical: 8.0, horizontal: 16.0),
                      child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Row(
                            children: [
                              const Padding(
                                padding: EdgeInsets.only(right: 8.0),
                                child: Icon(Icons.report),
                              ),
                              Column(
                                children: [
                                  Text(
                                    notices[index].content,
                                    style: TextStyle(fontSize: 16),
                                  ),
                                  Text(notices[index].name)
                                ],
                              ),
                            ],
                          )),
                    );
                  });
            } else {
              return const Center(
                child: CircularProgressIndicator(),
              );
            }
          },
        ));
  }
}
