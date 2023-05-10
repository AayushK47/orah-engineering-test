import { NextFunction, Request, Response } from "express"
import { getCustomRepository, getRepository } from "typeorm";

import { GroupStudent } from "../entity/group-student.entity";
import { Group } from "../entity/group.entity";
import { StudentRollStateRepository } from "../repository/student-roll-state.repository";
import { Student } from "../entity/student.entity";
import { CreateGroupInput, UpdateGroupInput } from "../interface/group.interface";
import { NotFoundError } from "../execptions/NotFoundError";

export class GroupController {
  private groupRepository = getRepository(Group);
  private groupStudentRepository = getRepository(GroupStudent);
  private studentRollRepository = getCustomRepository(StudentRollStateRepository);

  async allGroups(request: Request, response: Response, next: NextFunction): Promise<Group[]> {
    return await this.groupRepository.find();
  }

  async createGroup(request: Request, response: Response, next: NextFunction): Promise<Group> {
    try {
      const { body: params } = request;
      const createGroupInput: CreateGroupInput = {
        name: params.name,
        number_of_weeks: params.number_of_weeks,
        roll_states: params.roll_states,
        incidents: params.incidents,
        ltmt: params.ltmt
      };
      let group = new Group();
      group.validate(createGroupInput);
      group = (await this.groupRepository.save<Group>(group))[0];
      response.status(201);
      return group;
    } catch(error) {
      if(error.statusCode) {
        response.status(error.statusCode)
      } else {
        response.status(500)
      }
      response.send({message: error.message});
    }
  }

  async updateGroup(request: Request, response: Response, next: NextFunction): Promise<Group> {
    try {
      const { body: params } = request;
      const { id } = request.params;
      const group = await this.groupRepository.findOne(id);
      if(!group) {
        throw new NotFoundError(`Group with id '${id}' does not exist`);
      }
      const updateGroupInput: UpdateGroupInput = {
        name: params.name,
        number_of_weeks: params.number_of_weeks,
        roll_states: params.roll_states,
        incidents: params.incidents,
        ltmt: params.ltmt
      };
      group.validate({ ...group, ...updateGroupInput });
      return (await this.groupRepository.save<Group>(group))[0];
    } catch(error) {
      if(error.statusCode) {
        response.status(error.statusCode)
      } else {
        response.status(500)
      }
      response.send({message: error.message});
    }
  }

  async removeGroup(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = request.params;
      const group = await this.groupRepository.findOne(id);
      if(!group) {
        throw new NotFoundError(`Group with id '${id}' does not exist`);
      }
      await this.groupRepository.remove(group);
      response.status(204).send();
    }  catch(error) {
      if(error.statusCode) {
        response.status(error.statusCode)
      } else {
        response.status(500)
      }
      response.send({message: error.message});
    }
  }

  async getGroupStudents(request: Request, response: Response, next: NextFunction): Promise<Partial<Student>[]> {
    try{
      const { id } = request.params;
      const doesIdExists = await this.groupRepository.count({ where: { id } });
      if(!doesIdExists) {
        throw new NotFoundError(`Group with id '${id}' does not exist`);
      }
      const students = await this.groupRepository.findOne(id, { relations: ['students'] });
      return students.students.map<Partial<Student>>(({ id, first_name, last_name }) => ({ id, first_name, last_name, full_name: `${first_name} ${last_name}` }));
    } catch(error) {
      if(error.statusCode) {
        response.status(error.statusCode)
      } else {
        response.status(500)
      }
      response.send({message: error.message});
    }
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
