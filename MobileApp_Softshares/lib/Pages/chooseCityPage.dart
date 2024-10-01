import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/db.dart';
import 'package:softshares/classes/officeClass.dart';

class ChooseCityPage extends StatefulWidget {
  const ChooseCityPage({super.key});

  @override
  State<ChooseCityPage> createState() => _ChooseCityPageState();
}

class _ChooseCityPageState extends State<ChooseCityPage> {
  final box = GetStorage();
  API api = API();
  SQLHelper bd = SQLHelper.instance;
  List<Office> offices = [];

  Future getCities() async {
    var data = await bd.getCities();
    offices = data;
  }

  @override
  void initState() {
    super.initState();
    getCities();
    print(offices.length);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text(
            'Choose city',
            style: TextStyle(fontSize: 28),
          ),
          centerTitle: true,
        ),
        body: FutureBuilder(
            future: getCities(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.done) {
                return ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: offices.length,
                    itemBuilder: (context, index) {
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            box.write('selectedCity', offices[index].id);
                            print(box.read('selectedCity'));
                          });
                          Navigator.pushNamed(context, '/home');
                        },
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(10, 50, 10, 50),
                          child: cityCard(context, offices[index].city,
                              offices[index].imgPath),
                        ),
                      );
                    });
              } else {
                return const Center(
                  child: CircularProgressIndicator(),
                );
              }
            }));
  }

  Container cityCard(BuildContext context, String city, String? imagePath) {
    return Container(
      width: 320,
      decoration: BoxDecoration(
        border: Border.all(color: Colors.transparent),
        borderRadius: BorderRadius.all(Radius.circular(10)),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.all(Radius.circular(8)),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Network Image
            Image.network(
              '${box.read('url')}/uploads/$imagePath',
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  color: const Color.fromARGB(255, 150, 216, 255),
                  child: Center(
                    child: Icon(Icons.error, color: Colors.red, size: 50),
                  ),
                );
              },
            ),
            // Semi-transparent overlay
            Container(
              color: Colors.black.withOpacity(0.3),
            ),
            // Text overlay
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Align(
                alignment: Alignment.bottomCenter,
                child: Text(
                  city,
                  style: TextStyle(
                    fontSize: 24,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
