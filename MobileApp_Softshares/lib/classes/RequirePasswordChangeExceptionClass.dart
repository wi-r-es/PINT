class RequirePasswordChangeExceptionClass implements Exception {
  final String message;

  RequirePasswordChangeExceptionClass(this.message);

  @override
  String toString() => 'RequirePasswordChangeExceptionClass: $message';
}
