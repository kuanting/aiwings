import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Drone } from "./Drone";
@Entity({ name: "User" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  email!: string;

  @Column({ type: "varchar", nullable: false })
  password!: string;

  @Column({ type: "boolean", nullable: false, default: false })
  isAdmin!: boolean;

  @OneToMany(() => Drone, (drone) => drone.droneId)
  drones!: Drone[];
}
