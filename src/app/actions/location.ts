"use server";

import { locationService } from "@/services/location.service";
import { LocationOption } from "@/types/application";

export async function fetchRegions(): Promise<LocationOption[]> {
  try {
    return await locationService.getRegions();
  } catch (error) {
    console.error("Error fetching regions:", error);
    return [];
  }
}

export async function fetchProvinces(regionId: string): Promise<LocationOption[]> {
  try {
    if (!regionId) {
      return [];
    }
    return await locationService.getProvincesByRegion(regionId);
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return [];
  }
}

export async function fetchCities(provinceId: string): Promise<LocationOption[]> {
  try {
    if (!provinceId) {
      return [];
    }
    return await locationService.getCitiesByProvince(provinceId);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}
