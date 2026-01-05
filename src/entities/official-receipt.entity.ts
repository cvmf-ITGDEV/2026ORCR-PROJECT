import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Application } from "./application.entity";

export enum ReceiptType {
  PROCESSING_FEE = "processing_fee",
  SERVICE_FEE = "service_fee",
  DOCUMENTATION_FEE = "documentation_fee",
  OTHER = "other",
}

@Entity("official_receipts")
export class OfficialReceipt extends BaseEntity {
  @Column({ name: "or_number", type: "varchar", length: 50, unique: true })
  @Index()
  orNumber!: string;

  @Column({ name: "application_id", type: "uuid" })
  @Index()
  applicationId!: string;

  @Column({
    name: "receipt_type",
    type: "enum",
    enum: ReceiptType,
    default: ReceiptType.PROCESSING_FEE,
  })
  receiptType!: ReceiptType;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount!: number;

  @Column({ name: "receipt_date", type: "date" })
  @Index()
  receiptDate!: Date;

  @Column({ name: "payor_name", type: "varchar", length: 255 })
  payorName!: string;

  @Column({ name: "payment_method", type: "varchar", length: 50, nullable: true })
  paymentMethod?: string;

  @Column({ name: "reference_number", type: "varchar", length: 100, nullable: true })
  referenceNumber?: string;

  @Column({ type: "text", nullable: true })
  remarks?: string;

  @Column({ name: "issued_by", type: "uuid" })
  issuedBy!: string;

  @Column({ name: "is_void", type: "boolean", default: false })
  @Index()
  isVoid!: boolean;

  @Column({ name: "voided_at", type: "timestamptz", nullable: true })
  voidedAt?: Date;

  @Column({ name: "void_reason", type: "text", nullable: true })
  voidReason?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => Application, (application) => application.officialReceipts)
  @JoinColumn({ name: "application_id" })
  application!: Application;
}
