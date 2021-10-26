import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Flight } from './Flight';

@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  email!: string;

  @Column({ type: 'varchar', nullable: false })
  password!: string;

  @Column({ type: 'varchar', length: 35, nullable: false })
  droneId!: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  isAdmin!: boolean;

  @OneToMany(() => Flight, (flight) => flight.user)
  flights!: Flight[];
}
