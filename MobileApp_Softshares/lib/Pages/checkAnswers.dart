import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/fieldClass.dart';
import 'package:softshares/classes/user.dart';

class CheckAnswers extends StatefulWidget {
  CheckAnswers({super.key, required this.id});

  int id;

  @override
  State<CheckAnswers> createState() => _CheckAnswersState();
}

class _CheckAnswersState extends State<CheckAnswers> {
  API api = API();
  List<User> participants = [];
  var box = GetStorage();

  Future getParticipants() async {
    var data = await api.getParticipants(widget.id);
    participants = data;
  }

  Future checkUserAnswer(int userID) async {
    List<Field> data_fields = await api.getForm(widget.id);
    Map<int, String> data_answers = await api.getUserAnswer(widget.id, userID);
    // print(data_answers);
    // for (var field in data_fields) {
    //   if (data_answers.containsKey(field.id)) {
    //     print('${field.name}: ${data_answers[field.id]}');
    //   }
    // }
    showUserAnswersBottomSheet(context, data_fields, data_answers);
  }

  @override
  void initState() {
    super.initState();
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
          title: const Text('Answers'),
        ),
        body: FutureBuilder(
          future: getParticipants(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.done) {
              if (snapshot.hasError) {
                print(snapshot.error);
                return const Center(
                  child: Text('Something went wrong :(\n Try again'),
                );
              } else if (participants.isEmpty) {
                return const Center(
                  child: Text('No participants'),
                );
              }
              return ListView.builder(
                  itemCount: participants.length,
                  itemBuilder: (context, index) {
                    return GestureDetector(
                      onTap: () {
                        if (index == 0) {
                          return;
                        }
                        checkUserAnswer(participants[index].id);
                      },
                      child: Card(
                        margin: const EdgeInsets.symmetric(
                            vertical: 8.0, horizontal: 16.0),
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
                                      participants[index]
                                          .firstname[0]
                                          .toUpperCase(),
                                      style: TextStyle(
                                          color: colorScheme.onPrimary),
                                    ),
                                  ),
                                  const SizedBox(width: 12.0),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          "${participants[index].firstname} ${participants[index].lastName}",
                                          style: TextStyle(
                                            fontSize: 16,
                                            color: colorScheme.onSurface,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
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

  // Define the ListView function to display the answers.
  ListView answerList(BuildContext context, List<Field> data_fields,
      Map<int, String> data_answers) {
    return ListView.builder(
      shrinkWrap: true,
      itemCount: data_fields.length,
      itemBuilder: (context, index) {
        final field = data_fields[index];
        final answer = data_answers[field.id] ?? 'No answer provided';

        return ListTile(
          title: Text(
            '${field.name}: ',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          subtitle: Text(
            '- $answer',
          ),
        );
      },
    );
  }

// Function to show the BottomSheet with the answers.
  void showUserAnswersBottomSheet(BuildContext context, List<Field> dataFields,
      Map<int, String> dataAnswers) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              const Text(
                'Answers: ',
                style: TextStyle(fontSize: 24),
              ),
              answerList(context, dataFields, dataAnswers)
            ],
          ),
        );
      },
    );
  }
}
