import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";
import { RefRegion } from "./ref-region.entity";
import { RefProvince } from "./ref-province.entity";
import { RefCity } from "./ref-city.entity";
import { Loan } from "./loan.entity";
import { OfficialReceipt } from "./official-receipt.entity";
import { CollectionReceipt } from "./collection-receipt.entity";

export enum ApplicationStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  DISBURSED = "disbursed",
  CLOSED = "closed",
}

@Entity("applications")
export class Application extends BaseEntity {
  @Column({ name: "application_number", type: "varchar", length: 50, unique: true })
  @Index()
  applicationNumber!: string;

  @Column({
    name: "status",
    type: "enum",
    enum: ApplicationStatus,
    default: ApplicationStatus.DRAFT,
  })
  @Index()
  status!: ApplicationStatus;

  @Column({ name: "borrower_name", type: "varchar", length: 255 })
  @Index()
  borrowerName!: string;

  @Column({ name: "borrower_first_name", type: "varchar", length: 100 })
  borrowerFirstName!: string;

  @Column({ name: "borrower_middle_name", type: "varchar", length: 100, nullable: true })
  borrowerMiddleName?: string;

  @Column({ name: "borrower_last_name", type: "varchar", length: 100 })
  borrowerLastName!: string;

  @Column({ name: "borrower_email", type: "varchar", length: 255, nullable: true })
  borrowerEmail?: string;

  @Column({ name: "borrower_phone", type: "varchar", length: 20, nullable: true })
  borrowerPhone?: string;

  @Column({ name: "borrower_address", type: "text", nullable: true })
  borrowerAddress?: string;

  @Column({ name: "region_id", type: "uuid", nullable: true })
  regionId?: string;

  @Column({ name: "province_id", type: "uuid", nullable: true })
  provinceId?: string;

  @Column({ name: "city_id", type: "uuid", nullable: true })
  cityId?: string;

  @Column({ name: "loan_amount", type: "decimal", precision: 15, scale: 2 })
  loanAmount!: number;

  @Column({ name: "loan_purpose", type: "text", nullable: true })
  loanPurpose?: string;

  @Column({ name: "loan_term_months", type: "integer" })
  loanTermMonths!: number;

  @Column({ name: "interest_rate", type: "decimal", precision: 5, scale: 2 })
  interestRate!: number;

  @Column({ name: "submitted_at", type: "timestamptz", nullable: true })
  submittedAt?: Date;

  @Column({ name: "approved_at", type: "timestamptz", nullable: true })
  approvedAt?: Date;

  @Column({ name: "rejected_at", type: "timestamptz", nullable: true })
  rejectedAt?: Date;

  @Column({ name: "rejection_reason", type: "text", nullable: true })
  rejectionReason?: string;

  @Column({ name: "disbursed_at", type: "timestamptz", nullable: true })
  disbursedAt?: Date;

  @Column({ name: "created_by", type: "uuid" })
  createdBy!: string;

  @Column({ name: "approved_by", type: "uuid", nullable: true })
  approvedBy?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: "created_by" })
  createdByUser!: User;

  @ManyToOne(() => RefRegion, (region) => region.applications, { nullable: true })
  @JoinColumn({ name: "region_id" })
  region?: RefRegion;

  @ManyToOne(() => RefProvince, (province) => province.applications, {
    nullable: true,
  })
  @JoinColumn({ name: "province_id" })
  province?: RefProvince;

  @ManyToOne(() => RefCity, (city) => city.applications, { nullable: true })
  @JoinColumn({ name: "city_id" })
  city?: RefCity;

  @OneToOne(() => Loan, (loan) => loan.application, { nullable: true })
  loan?: Loan;

  @OneToMany(() => OfficialReceipt, (receipt) => receipt.application)
  officialReceipts!: OfficialReceipt[];

  @OneToMany(() => CollectionReceipt, (receipt) => receipt.application)
  collectionReceipts!: CollectionReceipt[];
}
