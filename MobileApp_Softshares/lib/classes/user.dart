class User {
  String _firstname, _lastName;
  String? _profileImg, _email;
  int _id;

  User(this._id, this._firstname, this._lastName, this._email);

  // Getters
  String get firstname => _firstname;
  String get lastName => _lastName;
  String? get email => _email;
  String? get profileImg => _profileImg;
  int get id => _id;

  // Setters
  set firstname(String value) {
    _firstname = value;
  }

  set lastName(String value) {
    _lastName = value;
  }

  set profileImg(String? value) {
    _profileImg = value;
  }

  // Override toString() method
  @override
  String toString() {
    return 'User { ID: $_id, First Name: $_firstname, Last Name: $_lastName, Email: $_email, Profile Image: $_profileImg }';
  }
}
