import { getDataSource } from "@/lib/db/data-source";
import { RefRegion } from "@/entities/ref-region.entity";
import { RefProvince } from "@/entities/ref-province.entity";
import { RefCity } from "@/entities/ref-city.entity";
import { LocationOption } from "@/types/application";

export class LocationService {
  async getRegions(): Promise<LocationOption[]> {
    try {
      const dataSource = await getDataSource();
      const regionRepository = dataSource.getRepository(RefRegion);

      const regions = await regionRepository.find({
        where: { isActive: true },
        order: { regionName: "ASC" },
      });

      return regions.map((region) => ({
        id: region.id,
        code: region.regionCode,
        name: region.regionName,
      }));
    } catch (error) {
      console.error("Error fetching regions:", error);
      throw new Error("Failed to fetch regions");
    }
  }

  async getProvincesByRegion(regionId: string): Promise<LocationOption[]> {
    try {
      const dataSource = await getDataSource();
      const provinceRepository = dataSource.getRepository(RefProvince);

      const provinces = await provinceRepository.find({
        where: { regionId, isActive: true },
        order: { provinceName: "ASC" },
      });

      return provinces.map((province) => ({
        id: province.id,
        code: province.provinceCode,
        name: province.provinceName,
      }));
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw new Error("Failed to fetch provinces");
    }
  }

  async getCitiesByProvince(provinceId: string): Promise<LocationOption[]> {
    try {
      const dataSource = await getDataSource();
      const cityRepository = dataSource.getRepository(RefCity);

      const cities = await cityRepository.find({
        where: { provinceId, isActive: true },
        order: { cityName: "ASC" },
      });

      return cities.map((city) => ({
        id: city.id,
        code: city.cityCode,
        name: city.cityName,
      }));
    } catch (error) {
      console.error("Error fetching cities:", error);
      throw new Error("Failed to fetch cities");
    }
  }

  async getRegionById(id: string): Promise<RefRegion | null> {
    try {
      const dataSource = await getDataSource();
      const regionRepository = dataSource.getRepository(RefRegion);

      return await regionRepository.findOne({ where: { id } });
    } catch (error) {
      console.error("Error fetching region by ID:", error);
      return null;
    }
  }

  async getProvinceById(id: string): Promise<RefProvince | null> {
    try {
      const dataSource = await getDataSource();
      const provinceRepository = dataSource.getRepository(RefProvince);

      return await provinceRepository.findOne({ where: { id } });
    } catch (error) {
      console.error("Error fetching province by ID:", error);
      return null;
    }
  }

  async getCityById(id: string): Promise<RefCity | null> {
    try {
      const dataSource = await getDataSource();
      const cityRepository = dataSource.getRepository(RefCity);

      return await cityRepository.findOne({ where: { id } });
    } catch (error) {
      console.error("Error fetching city by ID:", error);
      return null;
    }
  }
}

export const locationService = new LocationService();
