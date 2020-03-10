class Student {
  // this is what's inside the blocks
  constructor(ID, name, hash, year, university, major) {
    // Student ID
    this.ID = ID;
    // name, Duh.
    this.name = name;
    // Hash of the certificate
    this.hashOfCertificate = hash;
    // year of graduation
    this.year = year;
    // from which university
    this.university = university;
    // major of this student.
    this.major = major;
  }
}
module.exports.Student = Student;
