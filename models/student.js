class Student {
    // this is what's inside the blocks
    constructor(ID, data) {
      // Student ID
      this.ID = ID;
      // name, Duh.
      this.name;
      // Hash of the certificate
      this.HashOfCertificate = data;
      // year of graduation
      this.Year;
      // from which university
      this.university;
    }
  }
  module.exports.Student = Student;
  