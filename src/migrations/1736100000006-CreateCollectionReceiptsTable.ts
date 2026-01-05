import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateCollectionReceiptsTable1736100000006
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE payment_status AS ENUM (
        'pending',
        'cleared',
        'bounced',
        'reversed'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: "collection_receipts",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "cr_number",
            type: "varchar",
            length: "50",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "application_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "loan_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "payment_date",
            type: "date",
            isNullable: false,
          },
          {
            name: "amount",
            type: "decimal",
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: "principal_amount",
            type: "decimal",
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: "interest_amount",
            type: "decimal",
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: "penalty_amount",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: "payment_method",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "reference_number",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "payment_status",
            type: "payment_status",
            default: "'pending'",
          },
          {
            name: "payor_name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "remarks",
            type: "text",
            isNullable: true,
          },
          {
            name: "collected_by",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "is_void",
            type: "boolean",
            default: false,
          },
          {
            name: "voided_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "void_reason",
            type: "text",
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
            columnNames: ["application_id"],
            referencedTableName: "applications",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            columnNames: ["loan_id"],
            referencedTableName: "loans",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "collection_receipts",
      new TableIndex({
        name: "IDX_collection_receipts_cr_number",
        columnNames: ["cr_number"],
      })
    );

    await queryRunner.createIndex(
      "collection_receipts",
      new TableIndex({
        name: "IDX_collection_receipts_application_id",
        columnNames: ["application_id"],
      })
    );

    await queryRunner.createIndex(
      "collection_receipts",
      new TableIndex({
        name: "IDX_collection_receipts_loan_id",
        columnNames: ["loan_id"],
      })
    );

    await queryRunner.createIndex(
      "collection_receipts",
      new TableIndex({
        name: "IDX_collection_receipts_payment_date",
        columnNames: ["payment_date"],
      })
    );

    await queryRunner.createIndex(
      "collection_receipts",
      new TableIndex({
        name: "IDX_collection_receipts_payment_status",
        columnNames: ["payment_status"],
      })
    );

    await queryRunner.createIndex(
      "collection_receipts",
      new TableIndex({
        name: "IDX_collection_receipts_is_void",
        columnNames: ["is_void"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("collection_receipts");
    await queryRunner.query(`DROP TYPE IF EXISTS payment_status`);
  }
}
