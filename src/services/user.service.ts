import { getDataSource } from "@/lib/db/data-source";
import { User } from "@/entities/user.entity";
import { AuthUser, UserRole } from "@/types/auth";

export class UserService {
  async findByAuthId(authId: string): Promise<User | null> {
    try {
      const dataSource = await getDataSource();
      const userRepository = dataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { authId },
      });

      return user;
    } catch (error) {
      console.error("Error finding user by auth ID:", error);
      throw new Error("Failed to find user");
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const dataSource = await getDataSource();
      const userRepository = dataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { id },
      });

      return user;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw new Error("Failed to find user");
    }
  }

  async syncUser(
    authUser: AuthUser,
    additionalData?: { firstName?: string; lastName?: string }
  ): Promise<User> {
    try {
      const dataSource = await getDataSource();
      const userRepository = dataSource.getRepository(User);

      let user = await this.findByAuthId(authUser.id);

      if (user) {
        user.lastLoginAt = new Date();
        await userRepository.save(user);
        return user;
      }

      const newUser = userRepository.create({
        authId: authUser.id,
        email: authUser.email!,
        firstName: additionalData?.firstName,
        lastName: additionalData?.lastName,
        role: UserRole.PROCESSOR,
        isActive: true,
        lastLoginAt: new Date(),
      });

      user = await userRepository.save(newUser);
      return user;
    } catch (error) {
      console.error("Error syncing user:", error);
      throw new Error("Failed to sync user with database");
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      const dataSource = await getDataSource();
      const userRepository = dataSource.getRepository(User);

      await userRepository.update(userId, {
        lastLoginAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating last login:", error);
      throw new Error("Failed to update last login");
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    try {
      const dataSource = await getDataSource();
      const userRepository = dataSource.getRepository(User);

      await userRepository.update(userId, { role });

      const user = await this.findById(userId);
      if (!user) {
        throw new Error("User not found after update");
      }

      return user;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new Error("Failed to update user role");
    }
  }

  async deactivateUser(userId: string): Promise<void> {
    try {
      const dataSource = await getDataSource();
      const userRepository = dataSource.getRepository(User);

      await userRepository.update(userId, { isActive: false });
    } catch (error) {
      console.error("Error deactivating user:", error);
      throw new Error("Failed to deactivate user");
    }
  }

  async activateUser(userId: string): Promise<void> {
    try {
      const dataSource = await getDataSource();
      const userRepository = dataSource.getRepository(User);

      await userRepository.update(userId, { isActive: true });
    } catch (error) {
      console.error("Error activating user:", error);
      throw new Error("Failed to activate user");
    }
  }
}

export const userService = new UserService();
