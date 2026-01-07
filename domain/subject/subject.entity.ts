export class Subject {
  private constructor(
    public readonly id: string,
    private readonly idCarrer: string,
    private title: string,
    private quadmaster: number,
    private year: number,
  ) {}

  static create(props: Subject): Subject {
    if (!props.title.trim()) {
      throw new Error("Subject title is required");
    }

    return new Subject(
      crypto.randomUUID(),
      props.idCarrer,
      props.title,
      props.quadmaster,
      props.year,
    );
  }
}
