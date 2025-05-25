import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDTO } from './dtos/create-task.dto';
import { GetTaskFilterDto } from './dtos/task-filter.dto';
import { TaskStatusDTO } from './dtos/task-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { TaskTransformDto } from './dtos/task-transform.dto';
import { UserDto } from 'src/auth/dtos/user.dto';

@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly taskService: TasksService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllTasks(
    @GetUser() user: UserDto,
    @Query() filterDto: GetTaskFilterDto,
  ): Promise<TaskTransformDto[]> {
    this.logger.verbose(
      `User "${user.username}" retrieving tasks with filters: ${JSON.stringify(
        filterDto,
      )}`,
    );

    if (Object.keys(filterDto).length) {
      return await this.taskService.getTasksByFilter(user, filterDto);
    } else {
      return await this.taskService.getAllTasks(user);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getTaskById(
    @Param('id') taskId: string,
    @GetUser('id') id: string,
  ): Promise<TaskTransformDto> {
    this.logger.verbose(`User "${id}" retrieving task with ID: ${taskId}`);
    return await this.taskService.getTaskById(id, taskId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Body() createTaskDTO: CreateTaskDTO,
    @GetUser() user: UserDto,
  ): Promise<TaskTransformDto> {
    this.logger.verbose(
      `User "${user.username}" creating a new task. Data: ${JSON.stringify(
        createTaskDTO,
      )}`,
    );
    return await this.taskService.createTask(user, createTaskDTO);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteTaskById(
    @Param('id') taskId: string,
    @GetUser('id') id: string,
  ): Promise<void> {
    this.logger.verbose(`User "${id}" deleting task with ID: ${taskId}`);
    return await this.taskService.deleteTaskById(id, taskId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateTaskStatus(
    @Param('id') taskId: string,
    @Body() taskStatusDto: TaskStatusDTO,
    @GetUser('id') id: string,
  ): Promise<TaskTransformDto> {
    const { status } = taskStatusDto;
    this.logger.verbose(
      `User "${id}" updating status of task "${taskId}" to "${status}"`,
    );
    return await this.taskService.updateTaskStatus(id, taskId, status);
  }
}
