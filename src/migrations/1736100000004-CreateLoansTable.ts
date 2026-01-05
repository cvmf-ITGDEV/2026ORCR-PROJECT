import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateLoansTable1736100000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE loan_status AS ENUM (
        'active',
        'paid',
        'defaulted',
        'restructured',
        'written_off'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: "loans",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "loan_number",
            type: "varchar",
            length: "50",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "application_id",
            type: "uuid",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "status",
            type: "loan_status",
            default: "'active'",
          },
          {
            name: "principal_amount",
            type: "decimal",
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: "interest_rate",
            type: "decimal",
            precision: 5,
            scale: 2,
            isNullable: false,
          },
          {
            name: "term_months",
            type: "integer",
            isNullable: false,
          },
          {
            name: "monthly_payment",
            type: "decimal",
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: "total_amount_due",
            type: "decimal",
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: "amount_paid",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: "balance_remaining",
            type: "decimal",
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: "disbursement_date",
            type: "date",
            isNullable: false,
          },
          {
            name: "first_payment_date",
            type: "date",
            isNullable: false,
          },
          {
            name: "maturity_date",
            type: "date",
            isNullable: false,
          },
          {
            name: "last_payment_date",
            type: "date",
            isNullable: true,
          },
          {
            name: "days_past_due",
            type: "integer",
            default: 0,
          },
          {
            name: "is_delinquent",
            type: "boolean",
            default: false,
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "now()",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["application_id"],
            referencedTableName: "applications",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "loans",
      new TableIndex({
        name: "IDX_loans_loan_number",
        columnNames: ["loan_number"],
      })
    );

    await queryRunner.createIndex(
      "loans",
      new TableIndex({
        name: "IDX_loans_status",
        columnNames: ["status"],
      })
    );

    await queryRunner.createIndex(
      "loans",
      new TableIndex({
        name: "IDX_loans_is_delinquent",
        columnNames: ["is_delinquent"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("loans");
    await queryRunner.query(`DROP TYPE IF EXISTS loan_status`);
  }
}
