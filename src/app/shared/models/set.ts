import { Category } from "./catogory";

export class Set {
  name: string;
  idCategory: string;
  idOrganization: string;
  idCourse: string;
  color: string;
  createdBy: string;
  desc: string;
  image: string;
  type: string;
  years: string;
  disclaimer: string;
  profile: boolean;
  updatedAt: number;
  questions: Array<string>;
  categories: Array<Category>;
  asignatura: string;
  mode: string;
  attempts: number;
  duration: number;
  fotoProfesor: string;
  video: string;
  url: string;

  public static parse(item: any): Set {
    const set = new Set();
    set.name = item.name;
    set.idCategory = item.idCategory;
    set.idOrganization = item.idOrganization;
    set.idCourse = item.idCourse;
    set.color = item.color;
    set.createdBy = item.createdBy;
    set.desc = item.desc;
    set.image = item.image;
    set.type = item.type;
    set.years = item.years;
    set.disclaimer = item.disclaimer;
    set.profile = item.profile;
    set.updatedAt = item.updatedAt;
    set.questions = item.questions;
    set.categories = item.categories;
    set.asignatura = item.asignatura;
    set.mode = item.mode;
    set.attempts = item.attempts;
    set.duration = item.duration;
    set.fotoProfesor = item.fotoProfesor;
    set.attempts = item.attempts;
    set.video = item.video;
    set.url = item.url;
    return set;
  }

  public static getSet(sets: Array<Set>, set: Set): Set {
    let result: Set = null;

    if (sets && sets.length > 0) {
      for (const tempSet of sets) {
        if (set.idCategory === tempSet.idCategory) {
          result = set;
        }
      }
    }

    return result;
  }

  constructor(
    name: string = "",
    idCategory: string = "",
    idOrganization: string = "",
    color: string = "",
    createdBy: string = "",
    desc: string = "",
    image: string = "",
    type: string = "",
    years: string = "",
    disclaimer: string = "",
    profile: boolean = false,
    updatedAt: number = 0,
    asignatura: string = "",
    mode: string = "",
    attempts = 0,
    duration = 0,
    fotoProfesor: string = "",
    video: string = "",
    questions: Array<string> = [],
    categories: Array<Category> = []
  ) {
    this.name = name;
    this.idCategory = idCategory;
    this.idOrganization = idOrganization;
    this.idCourse = this.idCourse;
    this.color = color;
    this.createdBy = createdBy;
    this.desc = desc;
    this.image = image;
    this.type = type;
    this.years = years;
    this.disclaimer = disclaimer;
    this.profile = profile;
    this.updatedAt = updatedAt;
    this.asignatura = asignatura;
    this.mode = mode;
    this.duration = duration;
    this.attempts = attempts;
    this.questions = questions;
    this.categories = categories;
    this.fotoProfesor = fotoProfesor;
    this.attempts = attempts;
    this.video = video;
  }
}
