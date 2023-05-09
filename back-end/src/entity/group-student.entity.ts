import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

@Entity()
export class GroupStudent {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  student_id: number

  @Column()
  group_id: number

  @Column({ default: 0 })
  incident_count: number
}
