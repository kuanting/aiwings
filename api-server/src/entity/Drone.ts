import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Flight } from "./Flight";
import { User } from "./User";

@Entity({ name: "Drone" })
export class Drone {
  @PrimaryGeneratedColumn()
  droneId!: number;

  @ManyToOne(() => User, (user) => user.drones)
  user!: User;

  @OneToMany(() => Flight, (flight) => flight.drone)
  flights!: Flight[];
}
