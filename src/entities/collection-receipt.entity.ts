import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Application } from "./application.entity";
import { Loan } from "./loan.entity";

export enum PaymentStatus {
  PENDING = "pending",
  CLEARED = "cleared",
  BOUNCED = "bounced",
  REVERSED = "reversed",
}

@Entity("collection_receipts")
export class CollectionReceipt extends BaseEntity {
  @Column({ name: "cr_number", type: "varchar", length: 50, unique: true })
  @Index()
  crNumber!: string;

  @Column({ name: "application_id", type: "uuid" })
  @Index()
  applicationId!: string;

  @Column({ name: "loan_id", type: "uuid" })
  @Index()
  loanId!: string;

  @Column({ name: "payment_date", type: "date" })
  @Index()
  paymentDate!: Date;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount!: number;

  @Column({ name: "principal_amount", type: "decimal", precision: 15, scale: 2 })
  principalAmount!: number;

  @Column({ name: "interest_amount", type: "decimal", precision: 15, scale: 2 })
  interestAmount!: number;

  @Column({ name: "penalty_amount", type: "decimal", precision: 15, scale: 2, default: 0 })
  penaltyAmount!: number;

  @Column({ name: "payment_method", type: "varchar", length: 50 })
  paymentMethod!: string;

  @Column({ name: "reference_number", type: "varchar", length: 100, nullable: true })
  referenceNumber?: string;

  @Column({
    name: "payment_status",
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @Index()
  paymentStatus!: PaymentStatus;

  @Column({ name: "payor_name", type: "varchar", length: 255 })
  payorName!: string;

  @Column({ type: "text", nullable: true })
  remarks?: string;

  @Column({ name: "collected_by", type: "uuid" })
  collectedBy!: string;

  @Column({ name: "is_void", type: "boolean", default: false })
  @Index()
  isVoid!: boolean;

  @Column({ name: "voided_at", type: "timestamptz", nullable: true })
  voidedAt?: Date;

  @Column({ name: "void_reason", type: "text", nullable: true })
  voidReason?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => Application, (application) => application.collectionReceipts)
  @JoinColumn({ name: "application_id" })
  application!: Application;

  @ManyToOne(() => Loan, (loan) => loan.collectionReceipts)
  @JoinColumn({ name: "loan_id" })
  loan!: Loan;
}
