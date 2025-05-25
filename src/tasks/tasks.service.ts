import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from './task.model';
import { TaskEntity } from './entities/task.entity';
import { CreateTaskDTO } from './dtos/create-task.dto';
import { GetTaskFilterDto } from './dtos/task-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/auth/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { TaskTransformDto } from './dtos/task-transform.dto';
import { UserDto } from 'src/auth/dtos/user.dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  async getAllTasks(user: UserDto): Promise<TaskTransformDto[]> {
    try {
      const foundTasks = await this.taskRepository.find({
        where: { user: { id: user.id } },
      });

      this.logger.verbose(`Found ${foundTasks.length} tasks for user: ${user.username}`);

      return foundTasks.map((task) =>
        plainToInstance(TaskTransformDto, task),
      );
    } catch (error) {
      this.logger.error(`Failed to get tasks for user ${user.username}`, error.stack);
      throw error;
    }
  }

  async getTaskById(id: string, taskId: string): Promise<TaskTransformDto> {
    try {
      const task = await this.validateAuthority(id, taskId);

      return plainToInstance(TaskTransformDto, task, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(`Failed to get task ${taskId} for user ${id}`, error.stack);
      throw error;
    }
  }

  async getTasksByFilter(user: UserDto, filterDto: GetTaskFilterDto): Promise<TaskTransformDto[]> {
    try {
      const { status, search } = filterDto;
      const query = this.taskRepository.createQueryBuilder('t');
      query.leftJoinAndSelect('t.user', 'user');
      query.andWhere('t.user.id = :id', { id: user.id });

      if (status) {
        query.andWhere('t.status = :status', { status });
      }

      if (search) {
        query.andWhere('(t.title ILIKE :search OR t.description ILIKE :search)', {
          search: `%${search}%`,
        });
      }

      const tasks = await query.getMany();
      this.logger.verbose(`User "${user.username}" filtered tasks retrieved`);

      return tasks.map((task) =>
        plainToInstance(TaskTransformDto, task, {
          excludeExtraneousValues: true,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to filter tasks for user ${user.username}`, error.stack);
      throw error;
    }
  }

  async createTask(userDto: UserDto, createTaskDTO: CreateTaskDTO): Promise<TaskTransformDto> {
    try {
      const { title, description } = createTaskDTO;
      const status = TaskStatus.OPEN;

      const user = await this.taskRepository.manager.findOne(UserEntity, {
        where: { id: userDto.id },
      });

      const task = this.taskRepository.create({
        title,
        description,
        status,
        user,
      });

      const savedTask = await this.taskRepository.save(task);
      this.logger.verbose(`User "${userDto.username}" created a task "${savedTask.id}"`);

      return plainToInstance(TaskTransformDto, savedTask, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(`Failed to create task for user ${userDto.username}`, error.stack);
      throw error;
    }
  }

  async deleteTaskById(id: string, taskId: string): Promise<void> {
    try {
      const task = await this.validateAuthority(id, taskId);
      await this.taskRepository.delete({ id: task.id });
      this.logger.verbose(`User "${id}" deleted task "${taskId}"`);
    } catch (error) {
      this.logger.error(`Failed to delete task ${taskId} by user ${id}`, error.stack);
      throw error;
    }
  }

  async updateTaskStatus(id: string, taskId: string, status: TaskStatus): Promise<TaskTransformDto> {
    try {
      const task = await this.validateAuthority(id, taskId);
      task.status = status;

      const updatedTask = await this.taskRepository.save(task);
      this.logger.verbose(`User "${id}" updated task "${taskId}" to status "${status}"`);

      return plainToInstance(TaskTransformDto, updatedTask, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(`Failed to update task ${taskId} for user ${id}`, error.stack);
      throw error;
    }
  }

  async validateAuthority(id: string, taskId: string): Promise<TaskEntity> {
    try {
      const foundTask = await this.taskRepository.findOne({
        where: { id: taskId },
        relations: ['user'],
      });

      if (!foundTask) {
        throw new NotFoundException('Task not found!');
      }

      if (foundTask.user.id !== id) {
        this.logger.warn(`Unauthorized access attempt by user "${id}" on task "${taskId}"`);
        throw new ForbiddenException('User is not authorized to access this task!');
      }

      return foundTask;
    } catch (error) {
      this.logger.error(`Authority validation failed for task ${taskId} by user ${id}`, error.stack);
      throw error;
    }
  }
}
