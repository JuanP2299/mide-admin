import { Set } from "./set";
import { Use } from "./use";
import { Category } from "./catogory";
import { Question } from "./question";

export class Change {
  idOrganization: string;
  idSet: string;
  type: string;
  action: string;
  createdAt: number;
  set: Set;
  use: Use;
  category: Category;
  question: Question;
  removeCategory: string;

  public static parseSet(set: Set): Change {
    const change = new Change(set.idOrganization);
    change.idSet = set.idCategory;
    change.createdAt = set.updatedAt + 1;
    change.type = "set";
    change.set = set;
    change.set.questions = [];
    change.set.categories = [];
    change.set.type = null;
    return change;
  }

  constructor(idOrganization: string) {
    this.idOrganization = idOrganization;
  }
}
