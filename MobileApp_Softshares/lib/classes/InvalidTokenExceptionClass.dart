class InvalidTokenExceptionClass implements Exception {
  final String message;

  InvalidTokenExceptionClass(this.message);

  @override
  String toString() => 'InvalidUserInputException: $message';
}
