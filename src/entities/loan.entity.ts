import { Entity, Column, OneToOne, OneToMany, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Application } from "./application.entity";
import { CollectionReceipt } from "./collection-receipt.entity";

export enum LoanStatus {
  ACTIVE = "active",
  PAID = "paid",
  DEFAULTED = "defaulted",
  RESTRUCTURED = "restructured",
  WRITTEN_OFF = "written_off",
}

@Entity("loans")
export class Loan extends BaseEntity {
  @Column({ name: "loan_number", type: "varchar", length: 50, unique: true })
  @Index()
  loanNumber!: string;

  @Column({ name: "application_id", type: "uuid", unique: true })
  applicationId!: string;

  @Column({
    name: "status",
    type: "enum",
    enum: LoanStatus,
    default: LoanStatus.ACTIVE,
  })
  @Index()
  status!: LoanStatus;

  @Column({ name: "principal_amount", type: "decimal", precision: 15, scale: 2 })
  principalAmount!: number;

  @Column({ name: "interest_rate", type: "decimal", precision: 5, scale: 2 })
  interestRate!: number;

  @Column({ name: "term_months", type: "integer" })
  termMonths!: number;

  @Column({ name: "monthly_payment", type: "decimal", precision: 15, scale: 2 })
  monthlyPayment!: number;

  @Column({ name: "total_amount_due", type: "decimal", precision: 15, scale: 2 })
  totalAmountDue!: number;

  @Column({ name: "amount_paid", type: "decimal", precision: 15, scale: 2, default: 0 })
  amountPaid!: number;

  @Column({ name: "balance_remaining", type: "decimal", precision: 15, scale: 2 })
  balanceRemaining!: number;

  @Column({ name: "disbursement_date", type: "date" })
  disbursementDate!: Date;

  @Column({ name: "first_payment_date", type: "date" })
  firstPaymentDate!: Date;

  @Column({ name: "maturity_date", type: "date" })
  maturityDate!: Date;

  @Column({ name: "last_payment_date", type: "date", nullable: true })
  lastPaymentDate?: Date;

  @Column({ name: "days_past_due", type: "integer", default: 0 })
  daysPastDue!: number;

  @Column({ name: "is_delinquent", type: "boolean", default: false })
  @Index()
  isDelinquent!: boolean;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @OneToOne(() => Application, (application) => application.loan)
  @JoinColumn({ name: "application_id" })
  application!: Application;

  @OneToMany(() => CollectionReceipt, (receipt) => receipt.loan)
  collectionReceipts!: CollectionReceipt[];
}
