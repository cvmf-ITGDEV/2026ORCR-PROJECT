import { Repository, FindOptionsWhere, FindManyOptions, DeepPartial } from "typeorm";
import { getDataSource } from "@/lib/database";

export abstract class BaseRepository<T extends { id: string }> {
  protected abstract entityClass: new () => T;

  private async getRepository(): Promise<Repository<T>> {
    const dataSource = await getDataSource();
    return dataSource.getRepository(this.entityClass);
  }

  async findById(id: string): Promise<T | null> {
    const repository = await this.getRepository();
    return repository.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    const repository = await this.getRepository();
    return repository.find(options);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const repository = await this.getRepository();
    const entity = repository.create(data);
    return repository.save(entity);
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const repository = await this.getRepository();
    await repository.update(id, data as any);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const repository = await this.getRepository();
    const result = await repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    const repository = await this.getRepository();
    return repository.count({ where });
  }
}
