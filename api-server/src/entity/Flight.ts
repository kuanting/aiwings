import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from './User';

@Entity({ name: 'Flight' })
export class Flight {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'json', nullable: true })
  record!: string;

  @ManyToOne(() => User, (user) => user.flights, { cascade: true })
  user!: User;

  @UpdateDateColumn({
    name: 'update_timestamp',
    type: 'datetime'
  })
  update!: Date;
}
