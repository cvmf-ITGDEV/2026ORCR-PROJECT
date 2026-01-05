import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "./base.entity";
import { RefRegion } from "./ref-region.entity";
import { RefCity } from "./ref-city.entity";
import { Application } from "./application.entity";

@Entity("ref_province")
export class RefProvince extends BaseEntity {
  @Column({ name: "psgc_code", type: "varchar", length: 20, unique: true })
  @Index()
  psgcCode!: string;

  @Column({ name: "province_name", type: "varchar", length: 255 })
  provinceName!: string;

  @Column({ name: "province_code", type: "varchar", length: 10 })
  @Index()
  provinceCode!: string;

  @Column({ name: "region_id", type: "uuid" })
  @Index()
  regionId!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @ManyToOne(() => RefRegion, (region) => region.provinces)
  @JoinColumn({ name: "region_id" })
  region!: RefRegion;

  @OneToMany(() => RefCity, (city) => city.province)
  cities!: RefCity[];

  @OneToMany(() => Application, (application) => application.province)
  applications!: Application[];
}
