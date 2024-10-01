class UnauthoraziedExceptionClass implements Exception {
  final String message;

  UnauthoraziedExceptionClass(this.message);

  @override
  String toString() => 'Invalid credentials: $message';
}
