import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateOfficialReceiptsTable1736100000005
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE receipt_type AS ENUM (
        'processing_fee',
        'service_fee',
        'documentation_fee',
        'other'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: "official_receipts",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "or_number",
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
            name: "receipt_type",
            type: "receipt_type",
            default: "'processing_fee'",
          },
          {
            name: "amount",
            type: "decimal",
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: "receipt_date",
            type: "date",
            isNullable: false,
          },
          {
            name: "payor_name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "payment_method",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "reference_number",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "remarks",
            type: "text",
            isNullable: true,
          },
          {
            name: "issued_by",
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
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "official_receipts",
      new TableIndex({
        name: "IDX_official_receipts_or_number",
        columnNames: ["or_number"],
      })
    );

    await queryRunner.createIndex(
      "official_receipts",
      new TableIndex({
        name: "IDX_official_receipts_application_id",
        columnNames: ["application_id"],
      })
    );

    await queryRunner.createIndex(
      "official_receipts",
      new TableIndex({
        name: "IDX_official_receipts_receipt_date",
        columnNames: ["receipt_date"],
      })
    );

    await queryRunner.createIndex(
      "official_receipts",
      new TableIndex({
        name: "IDX_official_receipts_is_void",
        columnNames: ["is_void"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("official_receipts");
    await queryRunner.query(`DROP TYPE IF EXISTS receipt_type`);
  }
}
