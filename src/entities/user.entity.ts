import { Entity, Column, Index, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Application } from "./application.entity";
import { AuditLog } from "./audit-log.entity";

@Entity("users")
export class User extends BaseEntity {
  @Column({ name: "auth_id", type: "uuid", unique: true })
  @Index()
  authId!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ name: "first_name", type: "varchar", length: 100, nullable: true })
  firstName?: string;

  @Column({ name: "last_name", type: "varchar", length: 100, nullable: true })
  lastName?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  role?: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "last_login_at", type: "timestamptz", nullable: true })
  lastLoginAt?: Date;

  @OneToMany(() => Application, (application) => application.createdByUser)
  applications!: Application[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs!: AuditLog[];
}
