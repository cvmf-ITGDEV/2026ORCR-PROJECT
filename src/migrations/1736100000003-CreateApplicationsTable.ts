import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateApplicationsTable1736100000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE application_status AS ENUM (
        'draft',
        'submitted',
        'under_review',
        'approved',
        'rejected',
        'disbursed',
        'closed'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: "applications",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "application_number",
            type: "varchar",
            length: "50",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "status",
            type: "application_status",
            default: "'draft'",
          },
          {
            name: "borrower_name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "borrower_first_name",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "borrower_middle_name",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "borrower_last_name",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "borrower_email",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "borrower_phone",
            type: "varchar",
            length: "20",
            isNullable: true,
          },
          {
            name: "borrower_address",
            type: "text",
            isNullable: true,
          },
          {
            name: "region_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "province_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "city_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "loan_amount",
            type: "decimal",
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: "loan_purpose",
            type: "text",
            isNullable: true,
          },
          {
            name: "loan_term_months",
            type: "integer",
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
            name: "submitted_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "approved_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "rejected_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "rejection_reason",
            type: "text",
            isNullable: true,
          },
          {
            name: "disbursed_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "created_by",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "approved_by",
            type: "uuid",
            isNullable: true,
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
            columnNames: ["created_by"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            columnNames: ["region_id"],
            referencedTableName: "ref_region",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
          },
          {
            columnNames: ["province_id"],
            referencedTableName: "ref_province",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
          },
          {
            columnNames: ["city_id"],
            referencedTableName: "ref_city",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "applications",
      new TableIndex({
        name: "IDX_applications_application_number",
        columnNames: ["application_number"],
      })
    );

    await queryRunner.createIndex(
      "applications",
      new TableIndex({
        name: "IDX_applications_status",
        columnNames: ["status"],
      })
    );

    await queryRunner.createIndex(
      "applications",
      new TableIndex({
        name: "IDX_applications_borrower_name",
        columnNames: ["borrower_name"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("applications");
    await queryRunner.query(`DROP TYPE IF EXISTS application_status`);
  }
}
