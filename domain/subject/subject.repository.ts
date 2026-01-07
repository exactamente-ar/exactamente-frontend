import { Subject } from "./subject.entity";
import { FindByContextParams } from "./subject.types";

export interface SubjectRepository {
  findByContext(params: FindByContextParams): Promise<Subject[]>;
}
