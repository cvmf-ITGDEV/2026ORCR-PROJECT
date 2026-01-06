import { getDataSource } from "@/lib/db/data-source";
import { Application } from "@/entities/application.entity";
import { ApplicationDTO, Step1Data, Step2Data, Step3Data, ApplicationStatus } from "@/types/application";
import { generateApplicationNumber } from "@/lib/utils/application-number";
import { calculateInterestRate } from "@/types/application";

export class ApplicationService {
  async create(userId: string): Promise<Application> {
    try {
      const dataSource = await getDataSource();
      const applicationRepository = dataSource.getRepository(Application);

      const applicationNumber = await generateApplicationNumber();

      const application = applicationRepository.create({
        applicationNumber,
        status: ApplicationStatus.DRAFT,
        borrowerName: "",
        borrowerFirstName: "",
        borrowerLastName: "",
        loanAmount: 0,
        loanTermMonths: 12,
        interestRate: 9.0,
        currentStep: 1,
        createdBy: userId,
      });

      return await applicationRepository.save(application);
    } catch (error) {
      console.error("Error creating application:", error);
      throw new Error("Failed to create application");
    }
  }

  async findById(id: string): Promise<Application | null> {
    try {
      const dataSource = await getDataSource();
      const applicationRepository = dataSource.getRepository(Application);

      return await applicationRepository.findOne({
        where: { id },
        relations: ["region", "province", "city", "createdByUser"],
      });
    } catch (error) {
      console.error("Error finding application by ID:", error);
      return null;
    }
  }

  async findByIdAndUser(id: string, userId: string): Promise<Application | null> {
    try {
      const dataSource = await getDataSource();
      const applicationRepository = dataSource.getRepository(Application);

      return await applicationRepository.findOne({
        where: { id, createdBy: userId },
        relations: ["region", "province", "city"],
      });
    } catch (error) {
      console.error("Error finding application by ID and user:", error);
      return null;
    }
  }

  async findDraftsByUser(userId: string): Promise<Application[]> {
    try {
      const dataSource = await getDataSource();
      const applicationRepository = dataSource.getRepository(Application);

      return await applicationRepository.find({
        where: { createdBy: userId, status: ApplicationStatus.DRAFT },
        order: { updatedAt: "DESC" },
      });
    } catch (error) {
      console.error("Error finding drafts by user:", error);
      return [];
    }
  }

  async findByUser(userId: string): Promise<Application[]> {
    try {
      const dataSource = await getDataSource();
      const applicationRepository = dataSource.getRepository(Application);

      return await applicationRepository.find({
        where: { createdBy: userId },
        order: { createdAt: "DESC" },
      });
    } catch (error) {
      console.error("Error finding applications by user:", error);
      return [];
    }
  }

  async updateStep1(id: string, userId: string, data: Step1Data): Promise<Application> {
    try {
      const dataSource = await getDataSource();
      const applicationRepository = dataSource.getRepository(Application);

      const application = await this.findByIdAndUser(id, userId);
      if (!application) {
        throw new Error("Application not found");
      }

      const borrowerName = `${data.borrowerFirstName} ${data.borrowerMiddleName ? data.borrowerMiddleName + " " : ""}${data.borrowerLastName}`;

      application.borrowerFirstName = data.borrowerFirstName;
      application.borrowerMiddleName = data.borrowerMiddleName || "";
      application.borrowerLastName = data.borrowerLastName;
      application.borrowerName = borrowerName;
      application.borrowerEmail = data.borrowerEmail;
      application.borrowerPhone = data.borrowerPhone;
      application.currentStep = Math.max(application.currentStep, 2);
      application.stepData = {
        ...application.stepData,
        step1: data,
      };
      application.lastSavedAt = new Date();

      return await applicationRepository.save(application);
    } catch (error) {
      console.error("Error updating step 1:", error);
      throw new Error("Failed to update personal information");
    }
  }

  async updateStep2(id: string, userId: string, data: Step2Data): Promise<Application> {
    try {
      const dataSource = await getDataSource();
      const applicationRepository = dataSource.getRepository(Application);

      const application = await this.findByIdAndUser(id, userId);
      if (!application) {
        throw new Error("Application not found");
      }

      application.regionId = data.regionId;
      application.provinceId = data.provinceId;
      application.cityId = data.cityId;
      application.borrowerAddress = data.borrowerAddress;
      application.currentStep = Math.max(application.currentStep, 3);
      application.stepData = {
        ...application.stepData,
        step2: data,
      };
      application.lastSavedAt = new Date();

      return await applicationRepository.save(application);
    } catch (error) {
      console.error("Error updating step 2:", error);
      throw new Error("Failed to update address information");
    }
  }

  async updateStep3(id: string, userId: string, data: Step3Data): Promise<Application> {
    try {
      const dataSource = await getDataSource();
      const applicationRepository = dataSource.getRepository(Application);

      const application = await this.findByIdAndUser(id, userId);
      if (!application) {
        throw new Error("Application not found");
      }

      const interestRate = calculateInterestRate(data.loanTermMonths);

      application.loanAmount = data.loanAmount;
      application.loanPurpose = data.loanPurpose;
      application.loanTermMonths = data.loanTermMonths;
      application.interestRate = interestRate;
      application.currentStep = Math.max(application.currentStep, 4);
      application.stepData = {
        ...application.stepData,
        step3: data,
      };
      application.lastSavedAt = new Date();

      return await applicationRepository.save(application);
    } catch (error) {
      console.error("Error updating step 3:", error);
      throw new Error("Failed to update loan details");
    }
  }

  async savePartialData(
    id: string,
    userId: string,
    data: Partial<Record<string, any>>
  ): Promise<Application> {
    try {
      const dataSource = await getDataSource();
      const applicationRepository = dataSource.getRepository(Application);

      const application = await this.findByIdAndUser(id, userId);
      if (!application) {
        throw new Error("Application not found");
      }

      application.stepData = {
        ...application.stepData,
        ...data,
      };
      application.lastSavedAt = new Date();

      return await applicationRepository.save(application);
    } catch (error) {
      console.error("Error saving partial data:", error);
      throw new Error("Failed to autosave application data");
    }
  }

  async submit(id: string, userId: string): Promise<Application> {
    try {
      const dataSource = await getDataSource();
      const applicationRepository = dataSource.getRepository(Application);

      const application = await this.findByIdAndUser(id, userId);
      if (!application) {
        throw new Error("Application not found");
      }

      if (application.status !== ApplicationStatus.DRAFT) {
        throw new Error("Only draft applications can be submitted");
      }

      if (application.currentStep < 4) {
        throw new Error("All steps must be completed before submission");
      }

      application.status = ApplicationStatus.SUBMITTED;
      application.submittedAt = new Date();

      return await applicationRepository.save(application);
    } catch (error) {
      console.error("Error submitting application:", error);
      throw new Error("Failed to submit application");
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const dataSource = await getDataSource();
      const applicationRepository = dataSource.getRepository(Application);

      const application = await this.findByIdAndUser(id, userId);
      if (!application) {
        throw new Error("Application not found");
      }

      if (application.status !== ApplicationStatus.DRAFT) {
        throw new Error("Only draft applications can be deleted");
      }

      await applicationRepository.remove(application);
    } catch (error) {
      console.error("Error deleting application:", error);
      throw new Error("Failed to delete application");
    }
  }

  toDTO(application: Application): ApplicationDTO {
    return {
      id: application.id,
      applicationNumber: application.applicationNumber,
      status: application.status,
      borrowerName: application.borrowerName,
      borrowerFirstName: application.borrowerFirstName,
      borrowerMiddleName: application.borrowerMiddleName,
      borrowerLastName: application.borrowerLastName,
      borrowerEmail: application.borrowerEmail,
      borrowerPhone: application.borrowerPhone,
      borrowerAddress: application.borrowerAddress,
      regionId: application.regionId,
      provinceId: application.provinceId,
      cityId: application.cityId,
      loanAmount: application.loanAmount,
      loanPurpose: application.loanPurpose,
      loanTermMonths: application.loanTermMonths,
      interestRate: application.interestRate,
      currentStep: application.currentStep,
      stepData: application.stepData,
      lastSavedAt: application.lastSavedAt,
      submittedAt: application.submittedAt,
      createdBy: application.createdBy,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}

export const applicationService = new ApplicationService();
