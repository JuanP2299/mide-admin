export class Course {
  name: string;
  idOrganization: string;
  idCourse: string;

  public static parse(item: any): Course {
    const course = new Course();
    course.name = item.name;
    course.idOrganization = item.idOrganization;
    course.idCourse = item.idCourse;
    return course;
  }

  public static getCourse(courses: Array<Course>, course: Course): Course {
    let result: Course = null;

    if (courses && courses.length > 0) {
      for (const tempCourse of courses) {
        if (course.idCourse === tempCourse.idCourse) {
          result = course;
        }
      }
    }

    return result;
  }

  constructor(name: string = "", idOrganization: string = "", idCourse: string = "") {
    this.name = name;
    this.idOrganization = idOrganization;
    this.idCourse = idCourse;
  }
}
