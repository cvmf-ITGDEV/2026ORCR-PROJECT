import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";

export enum AuditAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LOGIN = "login",
  LOGOUT = "logout",
  APPROVE = "approve",
  REJECT = "reject",
  DISBURSE = "disburse",
  VOID = "void",
  PAYMENT = "payment",
}

@Entity("audit_logs")
export class AuditLog extends BaseEntity {
  @Column({ name: "user_id", type: "uuid", nullable: true })
  @Index()
  userId?: string;

  @Column({
    name: "action",
    type: "enum",
    enum: AuditAction,
  })
  @Index()
  action!: AuditAction;

  @Column({ name: "entity_type", type: "varchar", length: 100 })
  @Index()
  entityType!: string;

  @Column({ name: "entity_id", type: "uuid", nullable: true })
  @Index()
  entityId?: string;

  @Column({ name: "old_values", type: "jsonb", nullable: true })
  oldValues?: Record<string, any>;

  @Column({ name: "new_values", type: "jsonb", nullable: true })
  newValues?: Record<string, any>;

  @Column({ name: "ip_address", type: "varchar", length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: "user_agent", type: "text", nullable: true })
  userAgent?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user?: User;
}
