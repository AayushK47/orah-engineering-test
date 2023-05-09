import { NextFunction, Request, Response } from "express"
import { getCustomRepository, getRepository } from "typeorm";
import { GroupStudent } from "../entity/group-student.entity";
import { Group } from "../entity/group.entity";
import { StudentRollStateRepository } from "../repository/student-roll-state.repository";

export class GroupController {
  private groupRepository = getRepository(Group);
  private groupStudentRepository = getRepository(GroupStudent);
  private studentRollRepository = getCustomRepository(StudentRollStateRepository);

  async allGroups(request: Request, response: Response, next: NextFunction) {
    return await this.groupRepository.find();
  }

  async createGroup(request: Request, response: Response, next: NextFunction) {
    const { body: params } = request;
    const createGroupInput = params;
    const group = await this.groupRepository.save(createGroupInput);
    return group
  
  }

  async updateGroup(request: Request, response: Response, next: NextFunction) {
    const { body: params } = request;
    const { id } = request.params;
    const updateGroupInput = params;
    const group = await this.groupRepository.findOne(id);
    return await this.groupRepository.save({ ...group, ...updateGroupInput });
  }

  async removeGroup(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;
    const group = await this.groupRepository.findOne(id);
    await this.groupRepository.remove(group);
    response.status(204).send();
  }

  async getGroupStudents(request: Request, response: Response, next: NextFunction) {
    // Task 1: 
    const { id } = request.params;
    return await this.groupRepository.findOne(id, { relations: ['students'] })
    // Return the list of Students that are in a Group
  }


  async runGroupFilters(request: Request, response: Response, next: NextFunction) {
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
      })
      await this.groupRepository.save(group);
      await this.groupStudentRepository.save(groupStudents);
      response.status(204).send();
    }
  }
}
