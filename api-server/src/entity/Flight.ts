import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Drone } from "./Drone";
@Entity({ name: "Flight" })
export class Flight {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "json", nullable: true })
  record!: string;

  @ManyToOne(() => Drone, (drone) => drone.flights, { cascade: true })
  drone!: Drone;

  @UpdateDateColumn({
    name: "update_timestamp",
    type: "datetime",
  })
  update!: Date;
}
