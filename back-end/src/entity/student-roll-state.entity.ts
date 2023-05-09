import { Entity, PrimaryGeneratedColumn, Column, getRepository } from "typeorm"
import { CreateStudentRollStateInput, UpdateStudentRollStateInput } from "../interface/student-roll-state.interface"

@Entity()
export class StudentRollState {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  student_id: number

  @Column()
  roll_id: number

  @Column()
  state: string

  incident_count: number;

  public prepareToCreate(input: CreateStudentRollStateInput) {
    this.state = input.state
    this.student_id = input.student_id
    this.roll_id = input.roll_id
  }

  public prepareToUpdate(input: UpdateStudentRollStateInput) {
    if (input.state !== undefined) this.state = input.state
    if (input.student_id !== undefined) this.student_id = input.student_id
    if (input.roll_id !== undefined) this.roll_id = input.roll_id
  }

}
