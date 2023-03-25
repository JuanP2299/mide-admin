export class Alternative {
  correct: boolean;
  idAlternative: string;
  text: string;

  public static parse(item: any): Alternative {
    const alternative = new Alternative();
    alternative.correct = item.correct;
    alternative.idAlternative = item.idAlternative;
    alternative.text = item.text;
    return alternative;
  }

  constructor() {
  }
}
