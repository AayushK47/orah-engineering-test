import { NextFunction, Request, Response } from "express"
import { getCustomRepository, getRepository } from "typeorm";

import { GroupStudent } from "../entity/group-student.entity";
import { Group } from "../entity/group.entity";
import { StudentRollStateRepository } from "../repository/student-roll-state.repository";
import { Student } from "../entity/student.entity";

export class GroupController {
  private groupRepository = getRepository(Group);
  private groupStudentRepository = getRepository(GroupStudent);
  private studentRollRepository = getCustomRepository(StudentRollStateRepository);

  async allGroups(request: Request, response: Response, next: NextFunction): Promise<Group[]> {
    return await this.groupRepository.find();
  }

  async createGroup(request: Request, response: Response, next: NextFunction): Promise<Group> {
    const { body: createGroupInput } = request;
    const group = await this.groupRepository.save<Group>(createGroupInput);
    response.status(201);
    return group[0]
  
  }

  async updateGroup(request: Request, response: Response, next: NextFunction): Promise<Group> {
    const { body: updateGroupInput } = request;
    const { id } = request.params;
    const group = await this.groupRepository.findOne(id);
    if(!group) {
      response.status(404).send({message: `Group with id '${id}' does not exist`});
      return;
    }
    return (await this.groupRepository.save<Group>({ ...group, ...updateGroupInput }))[0];
  }

  async removeGroup(request: Request, response: Response, next: NextFunction): Promise<void> {
    const { id } = request.params;
    const group = await this.groupRepository.findOne(id);
    if(!group) {
      response.status(404).send({message: `Group with id '${id}' does not exist`});
      return;
    }
    await this.groupRepository.remove(group);
    response.status(204).send();
  }

  async getGroupStudents(request: Request, response: Response, next: NextFunction): Promise<Partial<Student>[]> {
    // Task 1: 
    const { id } = request.params;
    const doesIdExists = await this.groupRepository.count({ where: { id } });
    if(!doesIdExists) {
      response.status(404).send({message: `Group with id '${id}' does not exist`});
      return;
    }
    const students = await this.groupRepository.findOne(id, { relations: ['students'] });
    return students.students.map<Partial<Student>>(({ id, first_name, last_name }) => ({ id, first_name, last_name, full_name: `${first_name} ${last_name}` }));
  }


  async runGroupFilters(request: Request, response: Response, next: NextFunction): Promise<void> {
    let groups = await this.groupRepository.find();
    await this.groupStudentRepository.clear();
    for(let group of groups) {
      const matchedStudents = await this.studentRollRepository.getStudentIncidents(group);
      group.run_at = new Date();
      group.student_count = matchedStudents.length;
      const groupStudents = matchedStudents.map<GroupStudent>((value) => {
        return {
          ...value,
          group_id: group.id
        };
      });
      await this.groupRepository.save(group);
      await this.groupStudentRepository.save(groupStudents);
      response.status(204).send();
    }
  }
}
