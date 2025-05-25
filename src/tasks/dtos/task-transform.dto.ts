import { UserDto } from "src/auth/dtos/user.dto";
import { TaskStatus } from "../task.model";
import { Expose } from "class-transformer";

export class TaskTransformDto {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Expose()
    status: TaskStatus;

    @Expose()
    createdAt: Date;

    @Expose()
    user: UserDto;
}