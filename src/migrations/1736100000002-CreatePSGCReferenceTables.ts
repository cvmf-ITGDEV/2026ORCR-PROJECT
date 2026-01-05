import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreatePSGCReferenceTables1736100000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "ref_region",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "psgc_code",
            type: "varchar",
            length: "20",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "region_name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "region_code",
            type: "varchar",
            length: "10",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
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
      }),
      true
    );

    await queryRunner.createIndex(
      "ref_region",
      new TableIndex({
        name: "IDX_ref_region_psgc_code",
        columnNames: ["psgc_code"],
      })
    );

    await queryRunner.createIndex(
      "ref_region",
      new TableIndex({
        name: "IDX_ref_region_region_code",
        columnNames: ["region_code"],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "ref_province",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "psgc_code",
            type: "varchar",
            length: "20",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "province_name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "province_code",
            type: "varchar",
            length: "10",
            isNullable: false,
          },
          {
            name: "region_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
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
            columnNames: ["region_id"],
            referencedTableName: "ref_region",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "ref_province",
      new TableIndex({
        name: "IDX_ref_province_psgc_code",
        columnNames: ["psgc_code"],
      })
    );

    await queryRunner.createIndex(
      "ref_province",
      new TableIndex({
        name: "IDX_ref_province_province_code",
        columnNames: ["province_code"],
      })
    );

    await queryRunner.createIndex(
      "ref_province",
      new TableIndex({
        name: "IDX_ref_province_region_id",
        columnNames: ["region_id"],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "ref_city",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "psgc_code",
            type: "varchar",
            length: "20",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "city_name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "city_code",
            type: "varchar",
            length: "10",
            isNullable: false,
          },
          {
            name: "province_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "is_municipality",
            type: "boolean",
            default: false,
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
            columnNames: ["province_id"],
            referencedTableName: "ref_province",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "ref_city",
      new TableIndex({
        name: "IDX_ref_city_psgc_code",
        columnNames: ["psgc_code"],
      })
    );

    await queryRunner.createIndex(
      "ref_city",
      new TableIndex({
        name: "IDX_ref_city_city_code",
        columnNames: ["city_code"],
      })
    );

    await queryRunner.createIndex(
      "ref_city",
      new TableIndex({
        name: "IDX_ref_city_province_id",
        columnNames: ["province_id"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("ref_city");
    await queryRunner.dropTable("ref_province");
    await queryRunner.dropTable("ref_region");
  }
}
