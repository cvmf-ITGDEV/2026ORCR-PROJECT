import { getDataSource } from "@/lib/db/data-source";
import { Application } from "@/entities/application.entity";

export async function generateApplicationNumber(): Promise<string> {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const dataSource = await getDataSource();
      const applicationRepository = dataSource.getRepository(Application);

      const currentYear = new Date().getFullYear();
      const prefix = `APP-${currentYear}-`;

      const lastApplication = await applicationRepository
        .createQueryBuilder("app")
        .where("app.application_number LIKE :prefix", { prefix: `${prefix}%` })
        .orderBy("app.application_number", "DESC")
        .getOne();

      let nextSequence = 1;

      if (lastApplication) {
        const lastNumber = lastApplication.applicationNumber;
        const parts = lastNumber.split("-");
        if (parts.length === 3 && parts[2]) {
          const lastSequence = parseInt(parts[2], 10);
          if (!isNaN(lastSequence)) {
            nextSequence = lastSequence + 1;
          }
        }
      }

      const sequenceStr = nextSequence.toString().padStart(6, "0");
      const applicationNumber = `${prefix}${sequenceStr}`;

      const exists = await applicationRepository.findOne({
        where: { applicationNumber },
      });

      if (!exists) {
        return applicationNumber;
      }

      attempt++;
    } catch (error) {
      console.error("Error generating application number:", error);
      attempt++;

      if (attempt >= maxRetries) {
        throw new Error("Failed to generate unique application number");
      }

      await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
    }
  }

  throw new Error("Failed to generate application number after maximum retries");
}
