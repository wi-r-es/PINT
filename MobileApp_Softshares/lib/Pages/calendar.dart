import 'package:flutter/material.dart';
import 'package:softshares/Components/appBar.dart';
import 'package:softshares/Components/bottomNavBar.dart';
import 'package:softshares/Components/drawer.dart';
import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/event.dart';
import 'package:table_calendar/table_calendar.dart';

class Calendar extends StatefulWidget {
  Calendar({super.key, required this.areas});
  List<AreaClass> areas;

  @override
  State<Calendar> createState() => _CalendarState();
}

class _CalendarState extends State<Calendar> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  Map<DateTime, List<Event>> events = {};
  final API api = API();
  bool loading = true;
  List<Event>? _selectedEvents = [];

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  void _onDaySelected(selectedDay, focusedDay) {
    setState(() {
      _selectedDay = selectedDay;
      _focusedDay = focusedDay;
      _selectedEvents = events[
              DateTime(selectedDay.year, selectedDay.month, selectedDay.day)] ??
          [];
    });
  }

  Future<void> _loadEvents() async {
    try {
      events = await api.getEventCalendar();
      setState(() {
        loading = false;
      });
      print('Success fetching events, total: ${events.length}');
      events.forEach((key, value) {
        print('Key <$key>: Value: <${value}>;');
      });
    } catch (e) {
      print("Error fetching events: $e");
      setState(() {
        events = {};
      });
    }
  }

  List<Event> _getEventsForDay(DateTime day) {
    // Retrieve events for the specific day
    List<Event> eventsForDay =
        events[DateTime(day.year, day.month, day.day)] ?? [];

    return eventsForDay;
  }

  void callBack(context) {
    print('Will implement');
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: MyAppBar(
        iconR: const Icon(Icons.notifications),
        title: 'Calendar',
        rightCallback: (context) {
          Navigator.pushNamed(context, '/notices');
        },
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(12, 20, 12, 40),
            child: TableCalendar(
              focusedDay: _focusedDay,
              headerStyle: const HeaderStyle(
                formatButtonVisible: false,
                titleCentered: true,
              ),
              firstDay: DateTime.utc(2023, 09, 01),
              selectedDayPredicate: (day) {
                return isSameDay(_selectedDay, day);
              },
              lastDay: DateTime.utc(2026, 09, 01),
              onPageChanged: (focusedDay) {
                setState(() {
                  _focusedDay = focusedDay;
                });
              },
              onDaySelected: _onDaySelected,
              eventLoader: (day) {
                return _getEventsForDay(day);
              },
              calendarBuilders: CalendarBuilders(
                markerBuilder: (context, day, events) {
                  if (events.isEmpty) return SizedBox();
                  return Container(
                    height: 10,
                    width: 10,
                    decoration: BoxDecoration(
                      color: Colors.amber,
                      shape: BoxShape.circle,
                    ),
                  );
                },
              ),
            ),
          ),
          Expanded(
            child: loading == true
                ? Center(
                    child: CircularProgressIndicator(),
                  )
                : _selectedEvents != null
                    ? Padding(
                        padding: const EdgeInsets.all(18.0),
                        child: ListView.builder(
                          itemCount: _selectedEvents?.length,
                          itemBuilder: (context, index) {
                            return GestureDetector(
                              onTap: () {},
                              child: Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(18.0),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      userCircle(colorScheme, index),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              '${_selectedEvents![index].user.firstname} ${_selectedEvents![index].user.lastName}',
                                              style: TextStyle(
                                                  fontWeight: FontWeight.bold),
                                            ),
                                            Text(_selectedEvents![index].title),
                                          ],
                                        ),
                                      ),
                                      if (_selectedEvents![index].img != null)
                                        Container(
                                          width:
                                              100, // Set a fixed width or constraints for images
                                          height:
                                              100, // Set a fixed height or constraints for images
                                          child: Image.network(
                                            'https://backendpint-w3vz.onrender.com/uploads/${_selectedEvents![index].img!.path}',
                                            errorBuilder:
                                                (context, error, stackTrace) {
                                              return Container(); // Handles images not existing
                                            },
                                          ),
                                        )
                                      else
                                        const SizedBox(
                                            width:
                                                100), // Space for alignment if no image
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      )
                    : const SizedBox(),
          ),
        ],
      ),
      drawer: myDrawer(
        areas: widget.areas,
      ),
      bottomNavigationBar: MyBottomBar(),
    );
  }

  Container userCircle(ColorScheme colorScheme, int index) {
    return Container(
      margin: const EdgeInsets.only(right: 6.0),
      height: 40,
      width: 40,
      decoration: BoxDecoration(
          color: colorScheme.secondary,
          border: Border.all(width: 3, color: Colors.transparent),
          borderRadius: BorderRadius.circular(95)),
      child: Center(
          //If user does not have Profile Pic, print first letter of first name
          child: _selectedEvents![index].user.profileImg == null
              ? Text(
                  _selectedEvents![index].user.firstname[0],
                  style: TextStyle(fontSize: 20, color: colorScheme.onPrimary),
                )
              : const Text('I')),
    );
  }
}
