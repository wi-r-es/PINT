import 'package:flutter/material.dart';
import 'package:softshares/Components/appBar.dart';

class FilterPoiPage extends StatefulWidget {
  FilterPoiPage({super.key, required this.filters});

  Map<String, dynamic> filters;

  @override
  State<FilterPoiPage> createState() => _FilterPoiPage();
}

class _FilterPoiPage extends State<FilterPoiPage> {
  void rightCallback(context) {
    Navigator.pop(context, widget.filters);
  }

  @override
  void initState() {
    super.initState();
    widget.filters.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: MyAppBar(
          iconR: Icon(Icons.check),
          title: 'Filter',
          rightCallback: rightCallback),
      body: Padding(
        padding: EdgeInsets.only(top: 50, left: 18),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.only(bottom: 14.0),
              child: SizedBox(
                child: Text(
                  'Rating',
                  style: TextStyle(fontSize: 20),
                ),
              ),
            ),
            RatingFilter(filters: widget.filters),
          ],
        ),
      ),
    );
  }
}

class RatingFilter extends StatefulWidget {
  RatingFilter({super.key, required this.filters});

  Map<String, dynamic> filters;
  @override
  _RatingFilterState createState() => _RatingFilterState();
}

class _RatingFilterState extends State<RatingFilter> {
  // Define the map to track button selection states
  final Map<String, bool> isSelected = {
    '1': false,
    '2': false,
    '3': false,
    '4': false,
    '5': false,
  };

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: LayoutBuilder(
        builder: (context, constraints) {
          // Calculate the width available for each button
          double buttonWidth = (constraints.maxWidth / isSelected.length) - 6;

          return ToggleButtons(
            isSelected:
                isSelected.values.toList(), // Convert map values to list
            onPressed: (int index) {
              // Get the key from the map based on index
              String key = isSelected.keys.elementAt(index);
              setState(() {
                // Toggle the selection state
                isSelected[key] = !isSelected[key]!;
                _updateFilters();
              });
            },
            borderRadius: BorderRadius.circular(8.0),
            selectedColor: colorScheme.onPrimary,
            fillColor: colorScheme.primary,
            constraints: BoxConstraints(
              minHeight: 50.0,
              minWidth: buttonWidth,
            ),
            children: isSelected.keys
                .map((key) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Text(key),
                    ))
                .toList(),
          );
        },
      ),
    );
  }

  // Update the filters map based on the selection states
  void _updateFilters() {
    List<String> selectedRatings = isSelected.entries
        .where((entry) => entry.value)
        .map((entry) => entry.key)
        .toList();

    // Update the filters map
    setState(() {
      widget.filters['rating'] = selectedRatings;
    });
  }
}
