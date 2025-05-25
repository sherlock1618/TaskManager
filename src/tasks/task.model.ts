import { UserDto } from "src/auth/dtos/user.dto";

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    user: UserDto;
}

export enum TaskStatus {
    OPEN = 'OPEN',
    IN_PROGRESS  = 'IN_PROGRESS',
    DONE = 'DONE',
}