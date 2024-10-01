import 'dart:async';

import 'package:softshares/classes/ClasseAPI.dart';
import 'package:softshares/classes/areaClass.dart';
import 'package:softshares/classes/officeClass.dart';
import 'package:softshares/classes/user.dart';
import 'package:softshares/classes/utils.dart';
import 'package:sqflite/sqflite.dart' as sql;
import 'package:path/path.dart';

class SQLHelper {
  // Singleton instance
  static final SQLHelper instance = SQLHelper._init();
  static final API api = API();

  // Private constructor
  SQLHelper._init();

  // Database instance
  static sql.Database? _database;

  // Getter for database instance
  Future<sql.Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('test.db');
    return _database!;
  }

  // Initialize the database
  Future<sql.Database> _initDB(String filePath) async {
    try {
      String path = join(await sql.getDatabasesPath(), filePath);
      return await sql.openDatabase(
        path,
        version: 1,
        onCreate: _createDB,
      );
    } catch (e, s) {
      print('Database initialization error: $e');
      print("stacktrace: $s");
      rethrow;
    }
  }

  // Create tables
  Future _createDB(sql.Database db, int version) async {
    const createCities = """
      CREATE TABLE cities(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city NVARCHAR(100) NOT NULL,
        img NVARCHAR(255)
      )
    """;

    const createAreas = """
      CREATE TABLE areas(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        area NVARCHAR(100) NOT NULL 
      )""";

    const createSubAreas = """
      CREATE TABLE subAreas(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subArea NVARCHAR(100) NOT NULL,
        areaID INTEGER NOT NULL,
        FOREIGN KEY (areaID) REFERENCES areas(id)
      )""";

    const createPreferences = """
      CREATE TABLE preferences(
        id INTEGER PRIMARY KEY,
        subArea NVARCHAR(100) NOT NULL 
      )""";
    //Keep user id saved in bd to login automatically
    const checkUser = """
      CREATE TABLE user(
        id INTEGER,
        fname TEXT,
        lname TEXT,
        email TEXT
      )""";

    await db.execute(createCities);
    await db.execute(createAreas);
    await db.execute(createSubAreas);
    await db.execute(createPreferences);
    await db.execute(checkUser);
    await insertCities(db);
    await insertAreas(db);
  }

  // Insert cities
  Future<void> insertCities(sql.Database db) async {
    
    try {
      await db.rawDelete('DELETE FROM cities');
      List<Office> offices = await api.getOffices();

      for (var city in offices) {
        if (city.id != 0) {
          await db.rawInsert(
            'INSERT INTO cities (id, city, img) VALUES (?, ?, ?)',
            [city.id, city.city, city.imgPath],
          );
        }
      }
    } catch (e) {
      print('Error inserting cities: $e');
    }
  }

  Future<User?> getUser() async {
    final db = await instance.database;

    final List<Map<String, dynamic>> maps = await db.query('user');

    if (maps.isNotEmpty) {
      User user = User(maps.first['id'], maps.first['fname'],
          maps.first['lname'], maps.first['email']);
      return user;
    }

    return null;
  }

  Future insertUser(String fname, int id, String lname, String email) async {
    final db = await instance.database;

    var value = {'id': id, 'fname': fname, 'lname': lname, 'email': email};

    await db.insert('user', value);
  }

  Future<void> logOff() async {
    final db = await instance.database;
    // Clear all tables;
    await db.execute('DELETE FROM preferences');
    await db.execute('DELETE FROM user');

    print("All tables have been cleared.");
  }

  // Insert Areas
  Future<void> insertAreas(sql.Database db) async {
    List<AreaClass> areas = await api.getAreas();
    await db.rawDelete('DELETE FROM areas');
    await db.rawDelete('DELETE FROM subAreas');

    for (var area in areas) {
      await db.rawInsert(
        'INSERT INTO areas (id, area) VALUES (?, ?)',
        [area.id, area.areaName],
      );
      for (var subArea in area.subareas!) {
        await db.rawInsert(
          'INSERT INTO subAreas (id, subarea, areaID) VALUES (?, ?, ?)',
          [subArea.id, subArea.areaName, area.id],
        );
      }
    }
  }

  Future<List<AreaClass>> getAreas() async {
    final db = await instance.database;

    List<AreaClass> list = [];
    print('im here getAreas');
    final List<Map<String, dynamic>> areaMaps = await db.query('areas');
    final List<Map<String, dynamic>> subAreaMaps = await db.query('subAreas');

    if (areaMaps.isNotEmpty && subAreaMaps.isNotEmpty) {
      for (var area in areaMaps) {
        AreaClass aux = AreaClass(
            id: area['id'],
            areaName: area['area'],
            icon: iconMap[area['area']]);
        aux.subareas = [];
        for (var subArea in subAreaMaps) {
          AreaClass subAux =
              AreaClass(id: subArea['id'], areaName: subArea['subArea']);
          if (subArea['areaID'] == area['id']) {
            aux.subareas!.add(subAux);
          }
        }
        list.add(aux);
      }
    }

    return list;
  }

  // Check table contents
  Future<void> checkTable() async {
    print('im here checkTable');
    final db = await instance.database;
    final List<Map<String, dynamic>> result = await db.query('cities');
    print('Cities table contents: $result');
  }

  Future getCities() async {
    print('im here getCities');
    final db = await instance.database;
    List<Office> offices = [];
    final List<Map<String, dynamic>> cityMaps = await db.query('cities');

    for (var city in cityMaps) {
      Office office =
          Office(id: city['id'], city: city['city'], imgPath: city['img']);
      offices.add(office);
    }

    return offices;
  }

  Future<String?> getCityName(int id) async {
    print('getcityname');
    final db = await instance.database;
    final List<Map<String, dynamic>> result = await db.query('cities',
        columns: ['city'], where: 'id = ?', whereArgs: [id]);
    if (result.isNotEmpty) {
      return result.first['city'] as String?;
    }
    return null;
  }

  Future deletePrefs() async {
    final db = await instance.database;
    await db.execute("""
        DELETE FROM preferences
    """);
  }

  Future insertPreference(List<AreaClass> prefs) async {
    final db = await instance.database;

    await deletePrefs();
    for (var pref in prefs) {
      await db.rawInsert(
        'INSERT INTO preferences (id, subarea) VALUES (?, ?)',
        [pref.id, pref.areaName],
      );
    }
  }

  Future<List<AreaClass>> getPrefs() async {
    print('im here getPrefs');
    final db = await instance.database;
    List<AreaClass> prefs = [];
    final List<Map<String, dynamic>> prefsMap = await db.query('preferences');

    if (prefsMap.isNotEmpty) {
      for (var pref in prefsMap) {
        AreaClass aux = AreaClass(id: pref['id'], areaName: pref['subArea']);
        prefs.add(aux);
      }
    }

    return prefs;
  }
}
