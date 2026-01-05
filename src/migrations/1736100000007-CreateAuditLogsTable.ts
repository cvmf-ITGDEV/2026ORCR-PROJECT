import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateAuditLogsTable1736100000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE audit_action AS ENUM (
        'create',
        'update',
        'delete',
        'login',
        'logout',
        'approve',
        'reject',
        'disburse',
        'void',
        'payment'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: "audit_logs",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "action",
            type: "audit_action",
            isNullable: false,
          },
          {
            name: "entity_type",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "entity_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "old_values",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "new_values",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "ip_address",
            type: "varchar",
            length: "45",
            isNullable: true,
          },
          {
            name: "user_agent",
            type: "text",
            isNullable: true,
          },
          {
            name: "description",
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
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "audit_logs",
      new TableIndex({
        name: "IDX_audit_logs_user_id",
        columnNames: ["user_id"],
      })
    );

    await queryRunner.createIndex(
      "audit_logs",
      new TableIndex({
        name: "IDX_audit_logs_action",
        columnNames: ["action"],
      })
    );

    await queryRunner.createIndex(
      "audit_logs",
      new TableIndex({
        name: "IDX_audit_logs_entity_type",
        columnNames: ["entity_type"],
      })
    );

    await queryRunner.createIndex(
      "audit_logs",
      new TableIndex({
        name: "IDX_audit_logs_entity_id",
        columnNames: ["entity_id"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("audit_logs");
    await queryRunner.query(`DROP TYPE IF EXISTS audit_action`);
  }
}
