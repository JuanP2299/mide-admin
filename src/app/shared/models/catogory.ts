export class Category {
  idCategory: string;
  createdBy: string;
  name: string;
  updateAt: number;
  questions: Array<string>;
  categories: Array<Category>;
  type: string;
  edit: boolean;

  public static parse(item: any): Category {
    const category = new Category();
    category.idCategory = item.idCategory;
    category.createdBy = item.createdBy;
    category.name = item.name;
    category.updateAt = item.updateAt ? item.updateAt : 0;
    category.questions = item.questions ? item.questions : [];
    category.categories = item.categories ? item.categories : [];
    return category;
  }

  constructor() {
  }
}
