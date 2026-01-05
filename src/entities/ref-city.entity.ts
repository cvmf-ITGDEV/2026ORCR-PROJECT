import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { RefProvince } from "./ref-province.entity";
import { Application } from "./application.entity";

@Entity("ref_city")
export class RefCity extends BaseEntity {
  @Column({ name: "psgc_code", type: "varchar", length: 20, unique: true })
  @Index()
  psgcCode!: string;

  @Column({ name: "city_name", type: "varchar", length: 255 })
  cityName!: string;

  @Column({ name: "city_code", type: "varchar", length: 10 })
  @Index()
  cityCode!: string;

  @Column({ name: "province_id", type: "uuid" })
  @Index()
  provinceId!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "is_municipality", type: "boolean", default: false })
  isMunicipality!: boolean;

  @ManyToOne(() => RefProvince, (province) => province.cities)
  @JoinColumn({ name: "province_id" })
  province!: RefProvince;

  @OneToMany(() => Application, (application) => application.city)
  applications!: Application[];
}
