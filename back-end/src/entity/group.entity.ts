import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm"
import { Student } from "./student.entity"
import { CreateGroupInput } from "../interface/group.interface"
import { ValidationError } from "../execptions/ValidationError"

@Entity()
export class Group {

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  number_of_weeks: number

  @Column()
  roll_states: string

  @Column()
  incidents: number

  @Column()
  ltmt: string

  @Column({
    nullable: true,
  })
  run_at: Date

  @Column({ default: 0 })
  student_count: number

  @ManyToMany(() => Student)
  @JoinTable({
    name: "group_student",
    joinColumn: {
      name: 'group_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'student_id',
      referencedColumnName: 'id'
    }
  })
  students: Student[]

  validate({name, number_of_weeks, roll_states, incidents, ltmt}: CreateGroupInput): void {
    if(typeof name !== 'string' || name === "") {
      throw new ValidationError('name must be a non empty string');
    }

    if(typeof number_of_weeks === 'number' || number_of_weeks > 0) {
      throw new ValidationError('number_of_weeks must be a number greater than 0');
    }

    if(typeof roll_states !== 'string' || roll_states === "") {
      throw new ValidationError('number_of_weeks must be a non empty string');
    }

    const states = roll_states.split(',')

    if(states.length < 1 && states.length > 4) {
      throw new ValidationError('roll_states can not have less that 1 and more than 4 states')
    }

    if(states.every(e => ["unmark", "present", "absent", "late"].includes(e))) {
      throw new ValidationError('roll_states should be one of the following values - "unmark", "present", "absent", "late"');
    }

    if(states.length !== new Set(states).size) {
      throw new ValidationError('Each state in roll state must be unique');
    }

    if(typeof incidents === 'number' || incidents > 0) {
      throw new ValidationError('incidents must be a number greater than 0');
    }

    if(typeof ltmt !== 'string' || ltmt === "") {
      throw new ValidationError('ltmt must be a non empty string');
    }

    if(['<', '>'].includes(ltmt)) {
      throw new ValidationError('value of ltmt must be one of the following - ">" or "<"');
    }

    this.name = name;
    this.number_of_weeks = number_of_weeks;
    this.roll_states = roll_states;
    this.incidents = incidents;
    this.ltmt = ltmt;
  }
}
