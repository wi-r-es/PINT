// import libraries
import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:firebase_auth/firebase_auth.dart' as fireAuth;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/commentClass.dart';
import 'package:softshares/classes/db.dart';
import 'package:softshares/classes/event.dart';
import 'package:http/http.dart' as http;
import 'package:get_storage/get_storage.dart';
// jwt libraries
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:softshares/classes/fieldClass.dart';
import 'package:softshares/classes/noticesClass.dart';
import 'package:softshares/classes/officeClass.dart';
import 'package:softshares/providers/auth_provider.dart';

//import files
import '../main.dart';
import 'utils.dart';
import '../classes/forums.dart';
import '../classes/user.dart';
import '../classes/publication.dart';
import '../classes/InvalidTokenExceptionClass.dart';
import '../classes/PasswordReuseExceptionClass.dart';
import '../classes/unauthoraziedExceptionClass.dart';

class API {
  // Filipe
  var baseUrl = 'backendpint-w3vz.onrender.com';
  // Machado
  //var baseUrl = 'backendpint-909f.onrender.com';
  //var baseUrl = '10.0.2.2:8000';
  final box = GetStorage();
  final storage = const FlutterSecureStorage();
  final SQLHelper bd = SQLHelper.instance;

  Future<void> refreshAccessToken() async {
    String? refreshToken = await getRefreshToken();
    if (refreshToken == null) {
      print('Failed to retrieve refreshToken');
      throw Exception('Failed to retrieve refreshToken');
    }

    var response = await http.post(
        Uri.https(baseUrl, '/api/auth/refresh-token'),
        body: {'refreshToken': refreshToken});
    if (response.statusCode != 401) {
      // Add logic

      print('HERERRERERERER WEYAIOAIEDOASJDFCWRIKAFGHNERPLIGHJERTIGH');
    } else if (response.statusCode != 200) {
      throw Exception('Failed to refresh token');
    }

    var jsonData = jsonDecode(response.body);
    var token = jsonData['accessToken'];
    await storage.write(key: 'jwt_token', value: jsonEncode(token));
  }

  Future<User> getUser(int id) async {
    try {
      String? jwtToken = await getToken();

      var response = await http
          .get(Uri.https(baseUrl, '/api/dynamic/user-info/$id'), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken'
      });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      var jsonData = jsonDecode(response.body);
      //print(response.body);
      var user = User(
          jsonData['data']['user_id'],
          jsonData['data']['first_name'],
          jsonData['data']['last_name'],
          jsonData['data']['email']);

      return user;
    } on InvalidTokenExceptionClass catch (e) {
      await refreshAccessToken();
      print(e);
      return getUser(id);
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('inside getUserifo $e');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future getUserLogged() async {
    try {
      String? jwtToken = await getToken();
      print('inside getUserloggggged');
      print(jwtToken);
      var response = await http
          .get(Uri.https(baseUrl, '/api/auth/get-user-by-token/'), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken'
      });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      var jsonData = jsonDecode(response.body);

      //print(jsonData['user']['office_id']);

      // If user is admin
      if (jsonData['user']['office_id'] == 0) {
        return -1;
      }
      if (jsonData['user']['office_id'] == null) {
        var user = User(
            jsonData['user']['user_id'],
            jsonData['user']['first_name'],
            jsonData['user']['last_name'],
            jsonData['user']['email']);

        print('here we are inside office_id=null');
        print(user.toString());
        return user;
      }
      //print('jsonData $jsonData');
      var user = User(
          jsonData['user']['user_id'],
          jsonData['user']['first_name'],
          jsonData['user']['last_name'],
          jsonData['user']['email']);

      box.write('selectedCity', jsonData['user']['office_id']);
      return user;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getUserLogged();
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('inside getUserLogged $e');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future getNotices() async {
    String? jwtToken = await getToken();
    int officeId = box.read('selectedCity');
    List<Notice> notices = [];

    try {
      var response = await http
          .get(Uri.https(baseUrl, '/api/warnings/$officeId'), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken'
      });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      print('NOTICES:');
      print(response.body);

      var jsonData = jsonDecode(response.body);

      for (var eachNotice in jsonData['data']) {
        Notice notice = Notice(
            name: eachNotice['admin_name'],
            content: eachNotice['description'],
            level: eachNotice['warning_level'],
            id: eachNotice['warning_id']);
        notices.add(notice);
      }

      return notices;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getPrefs();
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('inside getPrefs $e');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future getPrefs() async {
    try {
      String? jwtToken = await getToken();
      Map<String, List<String>> prefs = {};

      var response = await http
          .get(Uri.https(baseUrl, '/api/user/get-user-preferences'), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken'
      });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      if (response.statusCode == 404) {
        print('No prefs');
        return prefs;
      }

      var jsonData = jsonDecode(response.body);
      print(jsonData['data']['notifications_topic']);

      for (var pref in jsonData['data']['notifications_topic']) {
        print(pref['area']);
        prefs[pref['area']] = [];
        print(pref['subareas']);
        for (var subPref in pref['subareas']) {
          prefs[pref['area']]?.add(subPref);
        }
      }

      return prefs;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getPrefs();
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('inside getPrefs $e');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future updatePrefs(var prefs) async {
    print(prefs);
    try {
      String? jwtToken = await getToken();
      User? user = await getUser(box.read('id'));
      var response = await http.patch(
          Uri.https(baseUrl, '/api/user/update-user-preferences/${user.id}'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken'
          },
          body: jsonEncode({'preferences': prefs}));
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return updatePrefs(prefs);
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('inside getPrefs $e');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future createPrefs(var prefs) async {
    try {
      String? jwtToken = await getToken();

      var response = await http.post(
        Uri.https(baseUrl, '/api/user/create-user-preferences'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $jwtToken',
        },
        body: jsonEncode({'notificationsTopic': prefs}),
      );

      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('Token access expired');
      }

      // Check if the response is JSON or plain text
      if (response.headers['Content-Type']?.contains('application/json') ==
          true) {
        var jsonData = jsonDecode(response.body);
        print(jsonData);
      } else {
        // Handle the response as plain text
        print(response.body);
      }
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getPrefs();
    } catch (e, s) {
      print('Inside createPrefs: $e');
      print('Stack trace:\n$s');
      rethrow;
    }
  }

  Future ratePub(Publication pub, int aval) async {
    late String type;
    switch (pub) {
      case Event _:
        type = 'event';
        break;
      default:
        type = 'post';
    }

    try {
      String? jwtToken = await getToken();

      var response = await http.post(
        Uri.https(baseUrl, '/api/rating/eval/$type/${pub.id}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $jwtToken',
        },
        body: jsonEncode({
          'evaluation': aval,
        }),
      );

      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('Token access expired');
      }

      print(response.statusCode);
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return ratePub(pub, aval);
    } catch (e, s) {
      print('Error in ratePub: $e');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future getPostScore(int id) async {
    try {
      String? jwtToken = await getToken();

      var response = await http.get(
        Uri.https(baseUrl, '/api/post/get-post-score/$id'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $jwtToken'
        },
      );
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      var jsonData = jsonDecode(response.body);

      print(jsonData);

      return double.parse(jsonData['data']);
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getPostScore(id);
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('inside get post rate $e');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future getEventScore(int id) async {
    try {
      String? jwtToken = await getToken();

      var response = await http.get(
        Uri.https(baseUrl, '/api/event/get-event-score/$id'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $jwtToken'
        },
      );
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      var jsonData = jsonDecode(response.body);

      print(jsonData);

      return double.parse(jsonData['data']);
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getEventScore(id);
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('inside get post rate $e');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future<List<Publication>> getPosts() async {
    List<Publication> publications = [];
    int officeId = box.read('selectedCity');

    try {
      String? jwtToken = await getToken();
      // Check if the token is not null before proceeding
      if (jwtToken == null) {
        print('Failed to retrieve JWT token');
        throw Exception('Failed to retrieve JWT Token');
      }

      var response = await http.get(
          Uri.https(baseUrl, '/api/dynamic/posts-by-city/$officeId'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken'
          });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      print(response.statusCode);
      print(response.body);

      var jsonData = jsonDecode(response.body);

      // print('inside json data $jsonData');
      //Get all Posts
      for (var eachPub in jsonData['data']) {
        //Filter posts with poi's
        if (eachPub['type'] == 'N') {
          //print(eachPub);
          User publisherUser = await getUser(eachPub['publisher_id']);
          double? price =
              eachPub['price'] != null ? (eachPub['price'] as num) * 1.0 : null;

          double? rating = double.tryParse(eachPub['score']);
          //print('ID: ${publisherUser.id}\n Price: $price');
          var file;
          if (eachPub['filepath'] != null) {
            file = File(eachPub['filepath']);
          } else {
            file = null;
          }
          final publication = Publication(
              eachPub['post_id'],
              publisherUser,
              eachPub['content'],
              eachPub['title'],
              eachPub['validated'],
              eachPub['sub_area_id'],
              DateTime.parse(eachPub['creation_date']),
              file,
              eachPub['p_location'],
              rating,
              price);
          await publication.getSubAreaName();
          publications.add(publication);
        }
      }
      //Sort for most recent first
      publications.sort((a, b) => b.datePost.compareTo(a.datePost));

      return publications;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getPosts();
      // Re-throwing the exception after handling it
    } catch (err, s) {
      print('inside get all posts $err');
      print('Stack trace:\n $s');
      rethrow; // rethrow the error if needed or handle it accordingly
    }
  }

  Future getUserRegistered() async {
    List<Event> publications = [];
    try {
      String? jwtToken = await getToken();
      var response = await http
          .get(Uri.https(baseUrl, '/api/user/get-registered-events'), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken'
      });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      var jsonData = jsonDecode(response.body);
      print(jsonData);

      for (var event in jsonData['data']) {
        TimeOfDay eventStart = TimeOfDay(
          hour: int.parse(event['Start Time'].split(":")[0]),
          minute: int.parse(event['Start Time'].split(":")[1]),
        );

        TimeOfDay eventEnd = TimeOfDay(
          hour: int.parse(event['End Time'].split(":")[0]),
          minute: int.parse(event['End Time'].split(":")[1]),
        );
        var file;
        if (event['filepath'] != null) {
          file = File(event['filepath']);
        } else {
          file = null;
        }
        User publisherUser = await getUser(box.read('id'));

        DateTime creationDate = DateTime.parse(event['creation_date']);
        DateTime eventDate = DateTime.parse(event['Date']);
        double? rating = double.tryParse(event['score']);
        // Create Event object
        final publication = Event(
            event['event_id'],
            publisherUser,
            event['EventDescription'],
            event['EventName'],
            event['validated'],
            event['sub_area_id'],
            creationDate,
            file,
            event['Location'],
            rating,
            eventDate,
            event['recurring'],
            event['recurring_pattern']?.toString(),
            eventStart,
            eventEnd);
        print('Object created -> ${publication.id}');
        await publication.getSubAreaName();
        publications.add(publication);
      }

      //Sort for most recent first
      publications.sort((a, b) => b.datePost.compareTo(a.datePost));

      return publications;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getUserRegistered();
    } catch (err, s) {
      print('inside get registered posts $err');
      print('Stack trace:\n $s');
      rethrow; // rethrow the error if needed or handle it accordingly
    }
  }

  Future<List<Publication>> getUserPosts() async {
    List<Publication> publications = [];

    try {
      String? jwtToken = await getToken();
      // Check if the token is not null before proceeding
      if (jwtToken == null) {
        print('Failed to retrieve JWT token');
        throw Exception('Failed to retrieve JWT Token');
      }

      var response = await http.get(Uri.https(baseUrl, '/api/user/get-content'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken'
          });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      var jsonData = jsonDecode(response.body);
      print('USER POSTS');
      print(jsonData);
      var type = jsonData['data'];

      // Extract posts, forums, and events
      List<dynamic> posts = type['posts'];
      List<dynamic> forums = type['forums'];
      List<dynamic> events = type['events'];

      // print('inside json data $jsonData');
      //Get user created posts
      for (var post in posts) {
        //Filter posts with poi's
        User publisherUser = await getUser(post['publisher_id']);
        double? price =
            post['price'] != null ? (post['price'] as num) * 1.0 : null;
        double? rating = double.tryParse(post['score']);
        //print('ID: ${publisherUser.id}\n Price: $price');
        var file;
        if (post['filepath'] != null) {
          file = File(post['filepath']);
        } else {
          file = null;
        }
        final publication = Publication(
            post['post_id'],
            publisherUser,
            post['content'],
            post['title'],
            post['validated'],
            post['sub_area_id'],
            DateTime.parse(post['creation_date']),
            file,
            post['p_location'],
            rating,
            price);
        await publication.getSubAreaName();
        publication.type = post['type'];
        publications.add(publication);
      }
      //Get user created forums
      for (var forum in forums) {
        if (forum['event_id'] == null) {
          User publisherUser = await getUser(forum['publisher_id']);
          final publication = Forum(
            forum['forum_id'],
            publisherUser,
            forum['content'],
            forum['title'],
            forum['validated'],
            forum['sub_area_id'],
            DateTime.parse(
              forum['creation_date'],
            ),
          );
          await publication.getSubAreaName();
          publications.add(publication);
        }
      }
      // Get user created events
      for (var event in events) {
        TimeOfDay eventStart = TimeOfDay(
          hour: int.parse(event['start_time'].split(":")[0]),
          minute: int.parse(event['start_time'].split(":")[1]),
        );

        TimeOfDay eventEnd = TimeOfDay(
          hour: int.parse(event['end_time'].split(":")[0]),
          minute: int.parse(event['end_time'].split(":")[1]),
        );
        var file;
        if (event['filepath'] != null) {
          file = File(event['filepath']);
        } else {
          file = null;
        }
        User publisherUser = await getUser(event['publisher_id']);

        DateTime creationDate = DateTime.parse(event['creation_date']);
        DateTime eventDate = DateTime.parse(event['event_date']);
        double? rating = double.tryParse(event['score']);
        // Create Event object
        final publication = Event(
            event['event_id'],
            publisherUser,
            event['description'],
            event['name'],
            event['validated'],
            event['sub_area_id'],
            creationDate,
            file,
            event['event_location'],
            rating,
            eventDate,
            event['recurring'],
            event['recurring_pattern']?.toString(),
            eventStart,
            eventEnd);
        print('Object created -> ${publication.id}');
        await publication.getSubAreaName();
        publications.add(publication);
      }
      //Sort for most recent first
      publications.sort((a, b) => b.datePost.compareTo(a.datePost));

      return publications;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getPosts();
      //Re-throwing the exception after handling it
    } catch (err, s) {
      print('inside get all posts $err');
      print('Stack trace:\n $s');
      rethrow; // rethrow the error if needed or handle it accordingly
    }
  }

  Future<List<Forum>> getForums() async {
    try {
      List<Forum> publications = [];
      int officeId = box.read('selectedCity');
      String? jwtToken = await getToken();

      var response = await http.get(
          Uri.https(baseUrl, '/api/dynamic/forums-by-city/$officeId'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken'
          });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      var jsonData = jsonDecode(response.body);

      for (var eachPub in jsonData['data']) {
        if (eachPub['event_id'] == null) {
          User publisherUser = await getUser(eachPub['publisher_id']);
          final publication = Forum(
            eachPub['forum_id'],
            publisherUser,
            eachPub['content'],
            eachPub['title'],
            eachPub['validated'],
            eachPub['sub_area_id'],
            DateTime.parse(
              eachPub['creation_date'],
            ),
          );
          await publication.getSubAreaName();
          publications.add(publication);
        }
      }

      //Sort for most recent first
      publications.sort((a, b) => b.datePost.compareTo(a.datePost));

      return publications;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getForums();
      // Re-throwing the exception after handling it
    } catch (err, s) {
      print('isnide get all forums $err');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future<List<Event>> getEvents() async {
    try {
      List<Event> publications = [];
      int officeId = box.read('selectedCity');

      String? jwtToken = await getToken();

      var response = await http.get(
          Uri.https(baseUrl, '/api/dynamic/events-by-city/$officeId'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken'
          });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      var jsonData = jsonDecode(response.body);
      print(jsonData);
      //Get all events
      for (var eachPub in jsonData['data']) {
        var file;
        if (eachPub['filepath'] != null) {
          file = File(eachPub['filepath']);
        } else {
          file = null;
        }
        User publisherUser = await getUser(eachPub['publisher_id']);

        DateTime creationDate = DateTime.parse(eachPub['creation_date']);
        DateTime eventDate = DateTime.parse(eachPub['event_date']);

        TimeOfDay eventStart = TimeOfDay(
          hour: int.parse(eachPub['start_time'].split(":")[0]),
          minute: int.parse(eachPub['start_time'].split(":")[1]),
        );

        TimeOfDay eventEnd = TimeOfDay(
          hour: int.parse(eachPub['end_time'].split(":")[0]),
          minute: int.parse(eachPub['end_time'].split(":")[1]),
        );

        double? rating = double.tryParse(eachPub['score']);
        // Create Event object
        final publication = Event(
            eachPub['event_id'],
            publisherUser,
            eachPub['description'],
            eachPub['name'],
            eachPub['validated'],
            eachPub['sub_area_id'],
            creationDate,
            file,
            eachPub['event_location'],
            rating,
            eventDate,
            eachPub['recurring'],
            eachPub['recurring_pattern']?.toString(),
            eventStart,
            eventEnd);
        print('Object created -> ${publication.aval}');
        await publication.getSubAreaName();
        publications.add(publication);
      }

      //Sort for most recent first
      publications.sort((a, b) => b.datePost.compareTo(a.datePost));

      return publications;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getEvents();
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('inside GetEvents');
      print(e);
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future getAlbumArea(int areaId) async {
    try {
      String? jwtToken = await getToken();
      List<String> imgPaths = [];

      var response = await http.get(
          Uri.https(baseUrl, '/api/media/get-album/area/$areaId'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken'
          });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      if (response.statusCode == 500) {
        return imgPaths;
      }

      var jsonData = jsonDecode(response.body);
      print('ALBUM: ');
      print(jsonData);

      for (var photo in jsonData['data']) {
        imgPaths.add(photo['filepath']);
      }
      return imgPaths;
    } catch (e) {
      print(e);
    }
  }

  Future getAlbumEvent(int id) async {
    try {
      String? jwtToken = await getToken();
      List<String> imgPaths = [];

      var response = await http
          .get(Uri.https(baseUrl, '/api/media/get-album/event/$id'), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken'
      });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      if (response.statusCode == 500) {
        return imgPaths;
      }

      var jsonData = jsonDecode(response.body);
      // print('ALBUM: ');
      // print(jsonData);

      for (var photo in jsonData['data']) {
        imgPaths.add(photo['filepath']);
      }
      return imgPaths;
    } catch (e) {
      print(e);
    }
  }

  Future<List<Publication>> getAllPubsByArea(int areaId, String type) async {
    try {
      List<Publication> publications = [];
      int officeId = box.read('selectedCity');

      String? jwtToken = await getToken();

      var response = await http.get(
          Uri.https(baseUrl, '/api/dynamic/all-content-per/$officeId'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken'
          });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      var jsonData = jsonDecode(response.body);
      print(jsonData);

      //Get all events
      for (var eachPub in jsonData[type]) {
        var file;
        if (eachPub['filepath'] != null) {
          file = File(eachPub['filepath']);
        } else {
          file = null;
        }
        int roundedAreaId = (eachPub['sub_area_id'] / 10).round();
        if (roundedAreaId == areaId) {
          User publisherUser = await getUser(eachPub['publisher_id']);
          if (type == 'posts' && eachPub['type'] == 'N') {
            double? price = eachPub['price'] != null
                ? (eachPub['price'] as num) * 1.0
                : null;
            double? rating = double.tryParse(eachPub['score']);
            final publication = Publication(
                eachPub['post_id'],
                publisherUser,
                eachPub['content'],
                eachPub['title'],
                eachPub['validated'],
                eachPub['sub_area_id'],
                DateTime.parse(eachPub['creation_date']),
                file,
                eachPub['p_location'],
                rating,
                price);
            await publication.getSubAreaName();
            publications.add(publication);
          } else if (type == 'forums' && eachPub['event_id'] == null) {
            final publication = Forum(
                eachPub['forum_id'],
                publisherUser,
                eachPub['content'],
                eachPub['title'],
                eachPub['validated'],
                eachPub['sub_area_id'],
                DateTime.parse(eachPub['creation_date']));
            await publication.getSubAreaName();
            publications.add(publication);
          } else if (type == 'events') {
            var file;
            if (eachPub['filepath'] != null) {
              file = File(eachPub['filepath']);
            } else {
              file = null;
            }
            User publisherUser = await getUser(eachPub['publisher_id']);

            DateTime creationDate = DateTime.parse(eachPub['creation_date']);
            DateTime eventDate = DateTime.parse(eachPub['event_date']);

            TimeOfDay eventStart = TimeOfDay(
              hour: int.parse(eachPub['start_time'].split(":")[0]),
              minute: int.parse(eachPub['start_time'].split(":")[1]),
            );

            TimeOfDay eventEnd = TimeOfDay(
              hour: int.parse(eachPub['end_time'].split(":")[0]),
              minute: int.parse(eachPub['end_time'].split(":")[1]),
            );

            double? rating = double.tryParse(eachPub['score']);
            // Create Event object
            final publication = Event(
                eachPub['event_id'],
                publisherUser,
                eachPub['description'],
                eachPub['name'],
                eachPub['validated'],
                eachPub['sub_area_id'],
                creationDate,
                file,
                eachPub['event_location'],
                rating,
                eventDate,
                eachPub['recurring'],
                eachPub['recurring_pattern']?.toString(),
                eventStart,
                eventEnd);
            print('Object created -> ${publication.id}');
            await publication.getSubAreaName();
            publications.add(publication);
          }
        }
      }
      //Sort for most recent first
      publications.sort((a, b) => b.datePost.compareTo(a.datePost));

      return publications;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getAllPubsByArea(areaId, type);
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('inside GetAllPubsByArea');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future<List<Publication>> getAllPosts() async {
    try {
      List<Publication> pubs = [];
      List<Publication> posts = [];
      List<Event> events = [];
      List<Forum> forums = [];

      try {
        posts = await getPosts();
        events = await getEvents();
        forums = await getForums();
        pubs.addAll(posts);
        pubs.addAll(events);
        pubs.addAll(forums);
      } catch (e) {
        print('inside GetAllPost $e');
      }

      //Sort for most recent first
      pubs.sort((a, b) => b.datePost.compareTo(a.datePost));

      return pubs;
    }
    //Re-throwing the exception after handling it
    catch (e, s) {
      print('error in getAllPosts $e');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future<List<Publication>> getAllPoI() async {
    try {
      List<Publication> list = [];
      int officeId = box.read('selectedCity');
      String? jwtToken = await getToken();

      var response = await http.get(
          Uri.https(baseUrl, '/api/dynamic/posts-by-city/$officeId'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken'
          });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      var jsonData = jsonDecode(response.body);
      print(jsonData);

      for (var eachPub in jsonData['data']) {
        var file;
        if (eachPub['filepath'] != null) {
          file = File(eachPub['filepath']);
        } else {
          file = null;
        }
        if (eachPub['type'] == 'P') {
          double? rating = double.tryParse(eachPub['score']);
          print(rating);
          User publisherUser = await getUser(eachPub['publisher_id']);
          final publication = Publication(
              eachPub['post_id'],
              publisherUser,
              eachPub['content'],
              eachPub['title'],
              eachPub['validated'],
              eachPub['sub_area_id'],
              DateTime.parse(eachPub['creation_date']),
              file,
              eachPub['p_location'],
              rating,
              null);

          print(publication.aval);
          await publication.getSubAreaName();
          list.add(publication);
        }
      }
      return list;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getAllPoI();
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('error in getAllPoI $e');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  //This function is used everytime a user creates something with an image
  Future uploadPhoto(File img) async {
    String? jwtToken = await getToken();

    String baseUrl = 'https://backendpint-w3vz.onrender.com/api/upload/upload';
    //String baseUrl = 'http://10.0.2.2:8000/api/upload/upload';
    //String baseUrl = 'https://backendpint-909f.onrender.com/api/upload/upload';

    // Check if the file exists
    if (await img.exists()) {
      final Uri url = Uri.parse(baseUrl);
      final request = http.MultipartRequest('POST', url);

      request.headers['Authorization'] = 'Bearer $jwtToken';

      // Add the file to the request
      request.files.add(await http.MultipartFile.fromPath(
        'image',
        img.path,
      ));

      try {
        final streamedResponse = await request.send();

        final response = await http.Response.fromStream(streamedResponse);

        if (response.statusCode == 401) {
          throw InvalidTokenExceptionClass('token access expired');
        }
        if (response.statusCode == 200) {
          print('File uploaded successfully');
          var data = jsonDecode(response.body);
          return data['file']['filename'];
        } else {
          print('Failed to upload file. Status code: ${response.statusCode}');
          print(response.body);
          print('Redirect Location: ${response.headers['location']}');
        }
      } on InvalidTokenExceptionClass catch (e) {
        print('Caught an InvalidTokenExceptionClass: $e');
        await refreshAccessToken();
        return uploadPhoto(img);
        // Re-throwing the exception after handling it
      } catch (e) {
        print('Error uploading file: $e');
      }
    } else {
      print('No valid image path provided.');
    }
  }

  Future addToAlbum(int id, File img) async {
    String? jwtToken = await getToken();
    try {
      String path = await uploadPhoto(img);

      var response = await http.post(
        Uri.https(baseUrl, '/api/media/add-photo-event/$id/${box.read('id')}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $jwtToken',
        },
        body: jsonEncode({
          'filePath': path.toString(),
        }),
      );

      print(response.statusCode);
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      return path;
    } catch (e) {
      print(e);
      rethrow;
    }
  }

  Future addToAlbumArea(int id, File img) async {
    String? jwtToken = await getToken();
    try {
      String path = await uploadPhoto(img);

      var response = await http.post(
        Uri.https(baseUrl, '/api/media/add-photo/area/$id/${box.read('id')}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $jwtToken',
        },
        body: jsonEncode({
          'filePath': path.toString(),
        }),
      );
      print('THIS');
      print(response.statusCode);
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      return path;
    } catch (e) {
      print(e);
      rethrow;
    }
  }

  Future createPost(Publication pub) async {
    var office = box.read('selectedCity');
    String? path;
    String? jwtToken = await getToken();

    int? price = pub.price?.toInt();
    int? rating = pub.aval?.toInt();

    try {
      // Create a map for the request body
      Map<String, String> body = {
        'subAreaId': pub.subCategory.toString(),
        'officeId': office.toString(),
        'publisher_id': pub.user.id.toString(),
        'title': pub.title,
        'content': pub.desc,
        'rating': rating.toString(),
      };

      if (pub.img != null) {
        path = await uploadPhoto(pub.img!);
        body['filePath'] = path.toString();
      }

      if (pub.location != null) {
        path = await uploadPhoto(pub.img!);
        body['pLocation'] = pub.location.toString();
      }

      if (price != null) {
        body['price'] = price.toString();
      }

      if (rating != null) {
        body['rating'] = rating.toString();
      }

      var response = await http.post(
        Uri.https(baseUrl, '/api/post/create'),
        body: body,
        headers: {'Authorization': 'Bearer $jwtToken'},
      );

      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      print(response.body);
      print(response.statusCode);
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return createPost(pub);
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('inside creating Post');
      print(e);
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future editPost({
    required int postId,
    String? title,
    String? desc,
    File? filePath,
    String? location,
    int? price,
    int? rating,
    int? subAreaId,
    required int publisherId,
  }) async {
    String? jwtToken = await getToken();
    var office = box.read('selectedCity');
    String path;

    Map<String, String> body = {
      'officeId': office.toString(),
      'publisher_id': publisherId.toString(),
      if (subAreaId != null) 'subAreaId': subAreaId.toString(),
      if (title != null) 'title': title,
      if (desc != null) 'content': desc,
      if (location != null) 'pLocation': location,
      if (price != null) 'price': price.toString(),
      if (rating != null) 'rating': rating.toString(),
    };

    if (filePath != null) {
      path = await uploadPhoto(filePath!);
      body['filePath'] = path.toString();
    }

    try {
      var response = await http.patch(
        Uri.https(baseUrl, '/api/post/edit/$postId'),
        body: body,
        headers: {'Authorization': 'Bearer $jwtToken'},
      );

      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      if (response.statusCode == 500) {
        print(response.body);
      }
      print(response.statusCode);
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return editPost(
        postId: postId,
        title: title,
        desc: desc,
        filePath: filePath,
        location: location,
        price: price,
        rating: rating,
        subAreaId: subAreaId,
        publisherId: publisherId,
      );
    } catch (e, s) {
      print('edit Post');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  // Create dynamic form related to specific event
  Future<void> createForm(int id, dynamic jsonData) async {
    String? jwtToken = await getToken();

    // Print raw and encoded JSON data for debugging
    print('Raw: $jsonData');
    print('Decode: ${jsonDecode(jsonData)}');
    print('Encode: ${jsonEncode(jsonData)}');

    try {
      // Ensure jsonData is a JSON-encoded string
      final jsonDataString = jsonEncode(jsonData);

      var response = await http.post(
        Uri.https(baseUrl, '/api/form/create-form'),
        headers: {
          'Authorization': 'Bearer $jwtToken',
          'Content-Type': 'application/json' // Set content type to JSON
        },
        body: jsonEncode(
            {'eventID': id.toString(), 'customFieldsJson': jsonDataString}),
      );

      // Print response information for debugging
      print('Dynamic form created successfully');
      print('Response: ${response.statusCode}');
      print('Response body: ${response.body}');
    } catch (e) {
      print('Something went wrong (createForm())');
      print('Error: $e');
    }
  }

  // Get specific form to event
  Future getForm(int id) async {
    String? jwtToken = await getToken();
    List<Field> formItens = [];
    var response = await http
        .get(Uri.https(baseUrl, '/api/form/event-form/$id'), headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $jwtToken'
    });
    // print('Response status: ${response.statusCode}');
    var jsonData = jsonDecode(response.body);
    print('FORM:');
    print(jsonData);
    for (var item in jsonData['data']) {
      List<String> options = [];
      if (item['field_type'] == 'Radio' || item['field_type'] == 'Checkbox') {
        for (var option in jsonDecode(item['field_value'])) {
          //print(option);
          options.add(option.toString());
        }
      }
      Field field = Field(
          name: item['field_name'],
          type: item['field_type'],
          options: options,
          id: item['field_id']);
      formItens.add(field);
    }

    return formItens;
  }

  Future sendFormAnswer(
    int eventId,
    dynamic answers,
  ) async {
    String? jwtToken = await getToken();
    try {
      User? user = await getUser(box.read('id'));

      var response = await http.post(
        Uri.https(baseUrl, '/api/form/add-answers/$eventId/${user.id}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $jwtToken',
        },
        body: jsonEncode({'answersJson': answers}),
      );

      print(response.statusCode);
      print(response.body);
    } catch (e) {
      print(e);
      rethrow;
    }
  }

  Future removeField(int eventID, int fieldID) async {
    String? jwtToken = await getToken();
    try {
      var response = await http.delete(
        Uri.https(baseUrl, '/api/form/delete-field/$eventID/$fieldID'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $jwtToken',
        },
      );

      print(response.statusCode);
      print(response.body);
    } catch (e) {
      print(e);
      rethrow;
    }
  }

  Future editForm(int id, dynamic jsonData) async {
    String? jwtToken = await getToken();

    // Print raw and encoded JSON data for debugging
    print('Raw: $jsonData');
    print('Decode: ${jsonDecode(jsonData)}');
    print('Encode: ${jsonEncode(jsonData)}');

    try {
      // Ensure jsonData is a JSON-encoded string
      final jsonDataString = jsonEncode(jsonData);

      var response = await http.patch(
        Uri.https(baseUrl, '/api/form/edit-form-fields/event/$id'),
        headers: {
          'Authorization': 'Bearer $jwtToken',
          'Content-Type': 'application/json' // Set content type to JSON
        },
        body: jsonEncode(
            {'eventID': id.toString(), 'customFieldsJson': jsonDataString}),
      );

      // Print response information for debugging
      print('Dynamic form created successfully');
      print('Response: ${response.statusCode}');
      print('Response body: ${response.body}');
    } catch (e) {
      print('Something went wrong (createForm())');
      print('Error: $e');
    }
  }

  Future<bool> isRegistered(int id, int eventID) async {
    String? jwtToken = await getToken();

    try {
      var response = await http.get(
          Uri.https(baseUrl, '/api/event/get-participants/$eventID'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken',
          });

      var jsonData = jsonDecode(response.body);
      print('DATATATATATATA');
      print(jsonData);
      for (var user in jsonData['data']) {
        if (user['user_id'] == id) {
          return true;
        }
      }
      return false;
    } catch (e) {
      print(e);
      rethrow;
    }
  }

  Future getParticipants(int eventID) async {
    String? jwtToken = await getToken();
    List<User> participants = [];

    try {
      var response = await http.get(
          Uri.https(baseUrl, '/api/event/get-participants/$eventID'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken',
          });

      var jsonData = jsonDecode(response.body);
      print('xxxxxxxxxxxxxxxxxxx');
      print(jsonData);

      for (var eachUser in jsonData['data']) {
        User user = await getUser(eachUser['user_id']);
        participants.add(user);
      }
      return participants;
    } catch (e) {
      print(e);
      rethrow;
    }
  }

  Future getUserAnswer(int eventID, int userID) async {
    String? jwtToken = await getToken();
    Map<int, String> answers = {};

    try {
      var response = await http.get(
          Uri.https(
              baseUrl, '/api/form/get-event-answers-for-user/$eventID/$userID'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken',
          });
      var jsonData = jsonDecode(response.body);
      print(jsonData);

      for (var answer in jsonData['data']) {
        answers[answer['field_id']] = answer['answer'];
      }
      return answers;
    } catch (e) {
      print(e);
      rethrow;
    }
  }

  Future createEvent(Event event) async {
    var office = box.read('selectedCity');
    String? jwtToken = await getToken();

    String? path;
    String eventStart =
        '${event.event_start!.hour.toString().padLeft(2, '0')}:${event.event_start!.minute.toString().padLeft(2, '0')}:00';
    String eventEnd =
        '${event.event_end!.hour.toString().padLeft(2, '0')}:${event.event_end!.minute.toString().padLeft(2, '0')}:00';
    var recurring_aux = jsonEncode(event.recurring_path);

    if (event.img != null) {
      path = await uploadPhoto(event.img!);
    }
    try {
      Map<String, String> body = {
        'subAreaId': event.subCategory.toString(),
        'officeId': office.toString(),
        'publisher_id': event.user.id.toString(),
        'name': event.title,
        'description': event.desc,
        'filePath': path.toString(),
        'eventDate':
            event.eventDate.toIso8601String(), //Convert DateTime to string
        'location': event.location.toString(),
        'recurring': event.recurring.toString(),
        'startTime': eventStart,
        'endTime': eventEnd
      };

      // Add recurring pattern to the body only if it's a recurring event
      if (event.recurring == true) {
        body['recurring_pattern'] = jsonEncode(event.recurring_path);
      }
      var response = await http.post(Uri.https(baseUrl, '/api/event/create'),
          body: body, headers: {'Authorization': 'Bearer $jwtToken'});
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      Map<String, dynamic> decodedJson = json.decode(response.body);
      int id = decodedJson['data'];
      print(id);
      return id;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return createEvent(event);
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('create Event');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future editEvent({
    required int eventId,
    String? title,
    String? desc,
    File? path,
    DateTime? eventDate,
    String? location,
    bool? recurring,
    String? recurringPattern,
    TimeOfDay? eventStart,
    TimeOfDay? eventEnd,
    int? subAreaId,
    required int publisherId,
    int? officeId,
  }) async {
    String? jwtToken = await getToken();
    var office = box.read('selectedCity');
    ;

    // Prepare the request body
    Map<String, String> body = {
      if (subAreaId != null) 'subAreaId': subAreaId.toString(),
      'officeId': office.toString(),
      'publisher_id': publisherId.toString(),
      if (title != null) 'name': title,
      if (desc != null) 'description': desc,
      if (eventDate != null) 'eventDate': eventDate.toIso8601String(),
      if (location != null) 'eventLocation': location,
      if (recurring != null) 'recurring': recurring.toString(),
      if (recurringPattern != null) 'recurring_pattern': recurringPattern,
    };

    if (path != null) {
      String aux = await uploadPhoto(path);
      print('I AM HERE');
      body['filePath'] = aux.toString();
    }

    if (eventStart != null) {
      String aux_eventStart =
          '${eventStart!.hour.toString().padLeft(2, '0')}:${eventStart.minute.toString().padLeft(2, '0')}:00';
      body['startTime'] = aux_eventStart.toString();
    }

    if (eventEnd != null) {
      String aux_eventEnd =
          '${eventEnd!.hour.toString().padLeft(2, '0')}:${eventEnd.minute.toString().padLeft(2, '0')}:00';
      body['endTime'] = aux_eventEnd.toString();
    }

    try {
      var response = await http.patch(
        Uri.https(baseUrl, '/api/event/edit/$eventId'),
        body: body,
        headers: {'Authorization': 'Bearer $jwtToken'},
      );

      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      print(response.statusCode);
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return editEvent(
        eventId: eventId,
        title: title,
        desc: desc,
        path: path,
        eventDate: eventDate,
        location: location,
        recurring: recurring,
        recurringPattern: recurringPattern,
        eventStart: eventStart,
        eventEnd: eventEnd,
        subAreaId: subAreaId,
        publisherId: publisherId,
      ); // Re-try with refreshed token
    } catch (e, s) {
      print('edit Event');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future createForum(Forum forum) async {
    var office = box.read('selectedCity');
    String? jwtToken = await getToken();

    try {
      var response =
          await http.post(Uri.https(baseUrl, '/api/forum/create'), body: {
        'officeID': office.toString(),
        'subAreaId': forum.subCategory.toString(),
        'title': forum.title,
        'description': forum.desc,
        'publisher_id': forum.user.id.toString(),
      }, headers: {
        'Authorization': 'Bearer $jwtToken'
      });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      print(response.statusCode);
      print(response.body);
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return createForum(forum);
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('create Forum');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future editForum({
    required int forumId,
    String? title,
    String? desc,
    int? subAreaId,
    required int publisherId,
  }) async {
    String? jwtToken = await getToken();
    var office = box.read('selectedCity');
    // Prepare the request body
    Map<String, String> body = {
      'officeID': office.toString(),
      if (subAreaId != null) 'subAreaId': subAreaId.toString(),
      if (title != null) 'title': title,
      if (desc != null) 'content': desc,
      'publisher_id': publisherId.toString(),
    };

    try {
      var response = await http.patch(
        Uri.https(baseUrl, '/api/forum/edit/$forumId'),
        body: body,
        headers: {'Authorization': 'Bearer $jwtToken'},
      );

      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      print(response.statusCode);
      print(response.body);
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return editForum(
        forumId: forumId,
        title: title,
        desc: desc,
        subAreaId: subAreaId,
        publisherId: publisherId,
      ); // Re-try with refreshed token
    } catch (e, s) {
      print('edit Forum');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future createPOI(Publication poi) async {
    var office = box.read('selectedCity');
    String? path;
    String? jwtToken = await getToken();

    if (poi.img != null) {
      path = await uploadPhoto(poi.img!);
    }

    try {
      var response =
          await http.post(Uri.https(baseUrl, '/api/post/create'), body: {
        'subAreaId': poi.subCategory.toString(),
        'officeId': office.toString(),
        'publisher_id': poi.user.id.toString(),
        'title': poi.title,
        'content': poi.desc,
        'type': 'P',
        'filePath': path.toString(),
        'pLocation': poi.location.toString(),
        'rating': poi.aval!.round().toString()
      }, headers: {
        'Authorization': 'Bearer $jwtToken'
      });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      print(response.statusCode);
      print(response.body);
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return createPOI(poi);
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('create POI');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future getOffices() async {
    try {
      String? jwtToken = await getToken();
      List<Office> offices = [];

      var response = await http
          .get(Uri.https(baseUrl, '/api/categories/get-offices'), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken'
      });

      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      var jsonData = jsonDecode(response.body);
      print('OFFICES');
      print(jsonData);

      for (var eachOffice in jsonData['data']) {
        Office office = Office(
            id: eachOffice['office_id'],
            city: eachOffice['city'],
            imgPath: eachOffice['officeImage']);
        offices.add(office);
      }
      return offices;
    } catch (e) {
      print(e);
    }
  }

  Future<List<AreaClass>> getAreas() async {
    try {
      List<AreaClass> list = [];

      String? jwtToken = await getToken();

      var response = await http
          .get(Uri.https(baseUrl, '/api/categories/get-areas'), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken'
      });

      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      var responseSub = await http
          .get(Uri.https(baseUrl, '/api/categories/get-sub-areas'), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken'
      });

      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      var jsonData = jsonDecode(response.body);
      var jsonDataSub = jsonDecode(responseSub.body);

      for (var area in jsonData['data']) {
        print(area);
        List<AreaClass> subareas = [];
        //Get subareas reletated to each area
        for (var subarea in jsonDataSub['data']) {
          if (subarea['area_id'] == area['area_id']) {
            var dummyArea = AreaClass(
              id: subarea['sub_area_id'],
              areaName: subarea['title'],
            );
            dummyArea.areaBelongs = area['title'];
            subareas.add(dummyArea);
          }
        }
        var dummyArea = AreaClass(
            id: area['area_id'],
            areaName: area['title'],
            icon: iconMap[area['icon_name']],
            subareas: subareas);
        list.add(dummyArea);
      }
      return list;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getAreas();
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('error inside gertAReas : $e');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future<String> getSubAreaName(int id) async {
    try {
      var result = '';
      String? jwtToken = await getToken();

      var response = await http
          .get(Uri.https(baseUrl, '/api/categories/get-sub-areas'), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken'
      });

      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      var jsonData = jsonDecode(response.body);

      for (var area in jsonData['data']) {
        if (area['sub_area_id'] == id) {
          result = area['title'];
          break;
        }
      }
      return result;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getSubAreaName(id);
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('error in getSubAreaName $e');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future<Map<DateTime, List<Event>>> getEventCalendar() async {
    Map<DateTime, List<Event>> events = {};
    int officeId = box.read('selectedCity');

    print('Here');

    try {
      String? jwtToken = await getToken();

      var response = await http.get(
          Uri.https(baseUrl, '/api/dynamic/events-by-city/$officeId'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken'
          });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      var jsonData = jsonDecode(response.body);

      for (var eachPub in jsonData['data']) {
        //print(eachPub);
        var file = eachPub['filepath'] != null
            ? File(eachPub['filepath'])
            : null; // Check if event has image
        User publisherUser = await getUser(eachPub['publisher_id']); // Get user
        DateTime creationDate = DateTime.parse(eachPub['creation_date']);
        DateTime eventDate = DateTime.parse(eachPub['event_date']);
        TimeOfDay eventStart = TimeOfDay(
          hour: int.parse(eachPub['start_time'].split(":")[0]),
          minute: int.parse(eachPub['start_time'].split(":")[1]),
        );

        TimeOfDay eventEnd = TimeOfDay(
          hour: int.parse(eachPub['end_time'].split(":")[0]),
          minute: int.parse(eachPub['end_time'].split(":")[1]),
        );
        print('Pattern: ${eachPub['recurring_pattern'].toString()}');
        double? rating = double.tryParse(eachPub['score']);

        // Create Event object
        final publication = Event(
            eachPub['event_id'],
            publisherUser,
            eachPub['description'],
            eachPub['name'],
            eachPub['validated'],
            eachPub['sub_area_id'],
            creationDate,
            file,
            eachPub['event_location'],
            rating,
            eventDate,
            eachPub['recurring'],
            eachPub['recurring_pattern'].toString(),
            eventStart,
            eventEnd);

        await publication.getSubAreaName();

        // Get event day with only date (year, month, day)
        DateTime eventDay =
            DateTime(eventDate.year, eventDate.month, eventDate.day);

        // Initialize List if not already initialized
        events[eventDay] ??= [];

        //Handle recurring events -> weekly
        if (publication.recurring_path == 'Weekly') {
          DateTime recurrenceDate = eventDate;

          // Add occurrences for a reasonable future range (e.g., 6 months)
          for (int i = 1; i <= 26; i++) {
            recurrenceDate = recurrenceDate.add(Duration(days: 7));
            if (recurrenceDate.year > DateTime.now().year + 1) break;

            DateTime recurrenceDay = DateTime(
                recurrenceDate.year, recurrenceDate.month, recurrenceDate.day);
            events[recurrenceDay] ??= [];
            events[recurrenceDay]!.add(publication);
          }
        }
        //Handle recurring events -> monthly
        else if (publication.recurring_path == 'Monthly') {
          DateTime recurrenceDate = eventDate;

          // Add occurrences for a reasonable future range (e.g., 6 months)
          for (int i = 1; i <= 6; i++) {
            recurrenceDate = DateTime(
              recurrenceDate.year,
              recurrenceDate.month + 1,
              recurrenceDate.day,
            );

            // Break if the recurrenceDate exceeds the next year
            if (recurrenceDate.year > DateTime.now().year + 1) break;

            // Create a new DateTime object with the new month
            DateTime recurrenceDay = DateTime(
              recurrenceDate.year,
              recurrenceDate.month,
              recurrenceDate.day,
            );

            // Add the publication to the events map
            events[recurrenceDay] ??= [];
            events[recurrenceDay]!.add(publication);
          }
        }
        //Handle recurring events -> yearly
        else if (publication.recurring_path == 'Yearly') {
          DateTime recurrenceDate = eventDate;

          // Add occurrences for a reasonable future range (e.g., 6 years)
          for (int i = 1; i <= 6; i++) {
            // Add one year to the recurrence date
            recurrenceDate = DateTime(
              recurrenceDate.year + 1,
              recurrenceDate.month,
              recurrenceDate.day,
            );

            // Break if the recurrenceDate exceeds the next year
            if (recurrenceDate.year > DateTime.now().year + 1) break;

            // Create a new DateTime object with the new year
            DateTime recurrenceDay = DateTime(
              recurrenceDate.year,
              recurrenceDate.month,
              recurrenceDate.day,
            );

            // Add the publication to the events map
            events[recurrenceDay] ??= [];
            events[recurrenceDay]!.add(publication);
          }
        }

        // Add the publication to the list of events for that day
        events[eventDay]!.add(publication);
      }
      print(events.length);
      return events;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getEventCalendar();
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('Error fetching event data: $e');
      print('Stack trace:\n $s');
      return {};
    }
  }

  Future unlikeComment(int id) async {
    String? jwtToken = await getToken();
    //User? user = await getUser(box.read('id'));

    try {
      var response = await http.delete(
          Uri.https(baseUrl, '/api/comment/remove-like'),
          body: jsonEncode({
            'commentID': id.toString(),
            //'userID': user!.id.toString(),
          }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken'
          });
      print(response.statusCode);
      print(response.body);
    } catch (e) {
      print(e);
      rethrow;
    }
  }

  Future likeComment(int id) async {
    String? jwtToken = await getToken();
    //User? user = await getUser(box.read('id'));

    try {
      var response = await http.post(
          Uri.https(baseUrl, '/api/comment/add-like'),
          body: jsonEncode({
            'commentID': id.toString(),
            //'userID': user!.id.toString(),
          }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken'
          });
      print(response.statusCode);
    } catch (e) {
      print(e);
      rethrow;
    }
  }

  Future reportComment(int id, String report) async {
    String? jwtToken = await getToken();
    User? user = await getUser(box.read('id'));

    try {
      var response = await http.post(
          Uri.https(baseUrl, '/api/comment/report-coment'),
          body: jsonEncode({
            'commentID': id.toString(),
            'reporterID': user!.id.toString(),
            'observation': report
          }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken'
          });
      print(response.statusCode);
    } catch (e) {
      print(e);
      rethrow;
    }
  }

  Future getComents(
    Publication pub,
  ) async {
    List<Comment> comments = [];

    late String type;
    switch (pub) {
      case Forum _:
        type = 'forum';
        break;
      case Event _:
        type = 'forum';
        break;
      default:
        type = 'post';
    }
    try {
      String? jwtToken = await getToken();

      var response = await http.get(
          Uri.https(baseUrl,
              '/api/comment/get-comment-tree/content/$type/id/${pub.id}'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken'
          });
      print(response.body);
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      var jsonData = jsonDecode(response.body);

      for (var eachComment in jsonData['data']) {
        User user = await getUser(eachComment['publisher_id']);
        Comment comment = Comment(
            user: user,
            comment: eachComment['content'],
            likes: eachComment['likes'],
            id: eachComment['comment_id']);
        comments.add(comment);
      }

      return comments;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getComents(pub);
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('error getting comments');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future getComentsLikes(
    Publication pub,
  ) async {
    List<int> likedComments = [];
    late String type;
    switch (pub) {
      case Forum _:
        type = 'forum';
        break;
      case Event _:
        type = 'forum';
        break;
      default:
        type = 'post';
    }
    try {
      String? jwtToken = await getToken();

      var response = await http.get(
          Uri.https(baseUrl,
              '/api/comment/get-likes-per-content/content/$type/id/${pub.id}'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $jwtToken'
          });
      print(response.body);

      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }
      var jsonData = jsonDecode(response.body);

      for (var eachID in jsonData['data']) {
        likedComments.add(eachID);
      }

      return likedComments;
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return getComents(pub);
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('error getting likes');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future createComment(Publication pub, String comment) async {
    late String type;

    switch (pub) {
      case Forum _:
        type = 'Forum';
        break;
      case Event _:
        type = 'Forum';
        break;
      default:
        type = 'Post';
    }
    try {
      String? jwtToken = await getToken();
      // var _id = await getID();
      //  User? user = await getUser(box.read('id'));
      // print('in comments: $_id');
      // print(_id.runtimeType);
      var response = await http
          .post(Uri.https(baseUrl, '/api/comment/add-comment'), headers: {
        'Authorization': 'Bearer $jwtToken'
      }, body: {
        'contentID': pub.id.toString(),
        'contentType': type,
        // 'userID': user!.id.toString(),
        'commentText': comment
      });
      if (response.statusCode == 401) {
        throw InvalidTokenExceptionClass('token access expired');
      }

      if (response.statusCode == 200) {
        // Handle successful response
        print('Comment created successfully');
      } else {
        // Handle error response
        print('Failed to create comment: ${response.body}');
      }
    } on InvalidTokenExceptionClass catch (e) {
      print('Caught an InvalidTokenExceptionClass: $e');
      await refreshAccessToken();
      return createComment(pub, comment);
      // Re-throwing the exception after handling it
    } catch (e, s) {
      print('error creating comment $e');
      print('Stack trace:\n $s');
      rethrow;
    }
  }

  Future registerUser(
      String email, String fName, String lName, int city) async {
    var response =
        await http.post(Uri.https(baseUrl, '/api/auth/register'), body: {
      'email': email,
      'firstName': fName,
      'lastName': lName,
      'centerId': city.toString()
    });

    if (response.statusCode == 201) {
      // Handle successful response
      print('User registered successfully');
      return true;
    } else {
      // Handle error response
      print('Failed to register new user: ${response.body}');
    }
  }

  String extractRedirectLink(String response) {
    // Find the index where the redirect URL starts
    int index = response.indexOf('/api/auth/change-password?token=');

    if (index != -1) {
      // Extract the redirect link from the response
      return response.substring(index);
    }

    // Return an empty string or handle the case where the URL is not found
    return '';
  }

  Future<bool> requestPasswordReset(String email) async {
    var response = await http
        .post(Uri.https(baseUrl, '/api/auth/request-password-reset'), body: {
      'email': email,
    });

    if (response.statusCode == 201) {
      return true;
    } else {
      print('Failed to start password recovery process.');
      return false;
    }
  }

  Future<bool> changePsswd(String passwd) async {
    final jwtToken = await storage.read(key: 'passwdChangeToken');
    print('DEBUG');
    print(jwtToken);
    var response = await http
        .patch(Uri.https(baseUrl, '/api/auth/change-password'), headers: {
      'Authorization': 'Bearer $jwtToken'
    }, body: {
      'password': passwd,
    });

    if (response.statusCode == 200) {
      print('User password successfully changed');
      await storage.delete(key: 'passwdChangeToken');
      return true;
    } else if (response.statusCode == 400) {
      throw PasswordReuseExceptionClass('Password reuse not allowed');
    } else {
      print('Failed to change password: ${response.body}');
      return false;
    }
  }

  Future<bool> passwordReset(String token, String password) async {
    String encodedToken = Uri.encodeComponent(token);
    var response =
        await http.post(Uri.https(baseUrl, '/api/auth/password-reset'), body: {
      'token': encodedToken,
      'password': password,
    });

    if (response.statusCode == 200) {
      return true;
    } else if (response.statusCode == 400) {
      throw PasswordReuseExceptionClass(
          'Password reuse not allowed. Please enter a different password');
    } else {
      print('Failed to start password recovery process.');
      return false;
    }
  }

  Future<void> logInDb(String email, String password) async {
    var response =
        await http.post(Uri.https(baseUrl, '/api/auth/login_mobile'), body: {
      'email': email,
      'password': password,
    });
    print('lets start here');
    print(response);

    if (response.statusCode == 302) {
      print('UwU');
      print(response
          .body); //Found. Redirecting to /api/auth/change-password?token=[object%20Object]
      print('UwU');

      String substringToCheck = '/api/auth/change-password?token';
      String redirectLink = extractRedirectLink(response.body);
      print('here we are to test the redirect');
      if (redirectLink.contains(substringToCheck)) {
        print('redirect is redirect links contains');
        print(redirectLink);

        Uri uri = Uri.parse(redirectLink);
        String? encodedToken = uri.queryParameters['token'];
        await storage.write(key: 'passwdChangeToken', value: encodedToken);
        // Redirect to the specified route
        navigatorKey.currentState
            ?.pushNamed('/change-password'); //create this route
        // Show a custom message using a SnackBar
        /*
        ScaffoldMessenger.of(navigatorKey.currentContext!).showSnackBar(
            const SnackBar(
                content: Text(
                    'Require Password Change for generated accounts of administration')));
                    */
      }
    } else if (response.statusCode == 200) {
      var jsonData = jsonDecode(response.body);
      print(jsonData);
      print(jsonData);
      // Handle successful login
      print('User login successful');

      var accessToken = jsonData['token'];
      var refreshToken = jsonData['refreshToken'];
      print('accessToken: $accessToken ');
      print('refreshToken: $refreshToken ');

      // Store the JWT token
      await storage.write(key: 'jwt_token', value: jsonEncode(accessToken));
      await storage.write(
          key: 'jwt_refresh_token', value: jsonEncode(refreshToken));

      return accessToken; // Returning early without returning a value (void)
    } else if (response.statusCode == 401) {
      // Handle unauthorized access by throwing an exception
      throw UnauthoraziedExceptionClass('Unauthorized: ${response.body}');
    } else {
      // Handle other error responses
      print('Failed to log in: ${response.body}');
    }
  }

  Future loginGoogle(var response) async {
    if (response['success'] == true) {
      var accessToken = response['token'];
      var refreshToken = response['refreshToken'];
      print('accessToken: $accessToken ');
      print('refreshToken: $refreshToken ');
      await storage.write(key: 'jwt_token', value: jsonEncode(accessToken));
      await storage.write(
          key: 'jwt_refresh_token', value: jsonEncode(refreshToken));
      return accessToken;
    } else {
      // Handle error response
      print('Failed to log in: ${response.body}');
    }
  }

  Future<String?> getToken() async {
    return await storage.read(key: 'jwt_token');
  }

  Future<String?> getRefreshToken() async {
    return await storage.read(key: 'jwt_refresh_token');
  }

  Future<void> logout() async {
    await storage.delete(key: 'jwt_token');
    await storage.delete(key: 'fcmToken');
  }

  //FIREBASE
  // Method to send the FCM token to the server
  Future<void> sendTokenToServer(String fcmtoken) async {
    User? user = await getUserLogged();
    if (user == null) {
      print('i entered here for some reason');
      return;
    }
    String? jwtToken = await getToken();
    final response = await http.patch(
      Uri.https(baseUrl, '/api/auth/store-fcm-token'),
      headers: {'Authorization': 'Bearer $jwtToken'},
      body: {
        'fcmToken': fcmtoken.toString(),
        'userId': user.id.toString(),
      },
    );

    if (response.statusCode == 200) {
      print('Token stored successfully');
    } else {
      print('Failed to store token');
    }
  }

  void saveToken(String token) {
    final storage = GetStorage();
    storage.write('fcmToken', token);
  }

  String? retrieveToken() {
    final storage = GetStorage();
    return storage.read('fcmToken');
  }
}
