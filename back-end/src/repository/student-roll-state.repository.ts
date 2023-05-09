import { EntityRepository, Repository } from "typeorm";
import { Group } from "../entity/group.entity";
import { StudentRollState } from "../entity/student-roll-state.entity";

@EntityRepository(StudentRollState)
export class StudentRollStateRepository extends Repository<StudentRollState> {
    async getStudentIncidents({  roll_states: states, number_of_weeks, incidents, ltmt}: Group) {
      let endDate = new Date();
      let startDate = new Date();
      startDate.setTime(endDate.getTime() - (7 * number_of_weeks * 24 * 60 * 60 * 1000));
      /**
       *  SELECT student_id, COUNT("s"."state") AS "incident_count" FROM "student_roll_state" "s" INNER JOIN "roll" "r"
          ON "s"."roll_id" = "r"."id"  INNER JOIN "student" "student" ON "s"."student_id" = "student"."id" WHERE "s"."state" 
          IN (?, ?, ?) AND "r"."completed_at" >= ? AND "r"."completed_at" <= ? GROUP BY "s"."student_id" HAVING 
          COUNT("s"."state") > ?;
       */
      const data = await this
        .createQueryBuilder('s')
        .select('student_id')
        .addSelect('COUNT(s.state)', 'incident_count')
        .innerJoin('roll', 'r', 's.roll_id = r.id')
        .innerJoin('student', 'student', 's.student_id = student.id')
        .where('s.state IN (:...states)', { states: states.split(',') })
        .andWhere('r.completed_at >= :startDate', { startDate: startDate.toISOString().split('T')[0] })
        .andWhere('r.completed_at <= :endDate', { endDate: endDate.toISOString().split('T')[0] })
        .groupBy('s.student_id')
        .having(`COUNT(s.state) ${ltmt} :incidents`, { incidents })
        .getRawMany();
      return data;
    }
}