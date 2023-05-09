import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm"
import { Student } from "./student.entity"

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
}
