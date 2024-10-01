import 'package:flutter_dotenv/flutter_dotenv.dart';

class Env {
  static String get apiUrl => dotenv.env['API_URL'] ?? 'API_URL not found';
  static String get localhost =>
      dotenv.env['LOCAL_HOST'] ?? 'API_URL not found';

  //CRYPTO KEYS
  static String get encryption_key =>
      dotenv.env['ENCRYPTION_KEY'] ?? 'ENCRYPTION_KEY not found';

  static String get crypto_iv =>
      dotenv.env['ENCRYPTION_IV'] ?? 'ENCRYPTION_IV not found';
}
