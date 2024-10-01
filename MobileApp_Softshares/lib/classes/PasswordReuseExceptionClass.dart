class PasswordReuseExceptionClass implements Exception {
  final String message;

  PasswordReuseExceptionClass(this.message);

  @override
  String toString() => 'PasswordReuseExceptionClass: $message';
}
