import { Entity, Column, OneToMany, Index } from "typeorm";
import { BaseEntity } from "./base.entity";
import { RefProvince } from "./ref-province.entity";
import { Application } from "./application.entity";

@Entity("ref_region")
export class RefRegion extends BaseEntity {
  @Column({ name: "psgc_code", type: "varchar", length: 20, unique: true })
  @Index()
  psgcCode!: string;

  @Column({ name: "region_name", type: "varchar", length: 255 })
  regionName!: string;

  @Column({ name: "region_code", type: "varchar", length: 10 })
  @Index()
  regionCode!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => RefProvince, (province) => province.region)
  provinces!: RefProvince[];

  @OneToMany(() => Application, (application) => application.region)
  applications!: Application[];
}
