import { Exclude, Expose } from "class-transformer";
import { TaskEntity } from "src/tasks/entities/task.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    @Expose()
    id: string;

    @Expose()
    @Column({ unique: true })
    username: string;

    @Exclude()
    @Column()
    password: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(_type => TaskEntity, task => task.user, { eager: true })
    tasks: TaskEntity[];
}