import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TaskStatus } from "../task.model";
import { UserEntity } from "src/auth/entities/user.entity";
import { Type } from "class-transformer";

@Entity()
export class TaskEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({ default: 'OPEN' })
    status: TaskStatus;

    @CreateDateColumn()
    createdAt: Date;

    @Type(() => UserEntity)
    @ManyToOne(_type => UserEntity, user => user.tasks, { eager: false })
    user: UserEntity;
}