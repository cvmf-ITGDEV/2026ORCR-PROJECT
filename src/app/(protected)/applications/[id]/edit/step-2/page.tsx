"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDraftApplication, saveStep2Data } from "@/app/actions/application";
import { fetchRegions, fetchProvinces, fetchCities } from "@/app/actions/location";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WizardStepCard, WizardNavigation, AutosaveIndicator } from "@/components/wizard";
import { useAutosave } from "@/hooks/use-autosave";
import { ApplicationDTO, LocationOption } from "@/types/application";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Step2PageProps {
  params: { id: string };
}

export default function Step2Page({ params }: Step2PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [regions, setRegions] = useState<LocationOption[]>([]);
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);

  const [formData, setFormData] = useState({
    regionId: "",
    provinceId: "",
    cityId: "",
    borrowerAddress: "",
  });

  const { status, triggerAutosave } = useAutosave({
    applicationId: params.id,
    onSaveSuccess: () => {
      toast({
        title: "Autosaved",
        description: "Your changes have been saved.",
      });
    },
  });

  useEffect(() => {
    async function fetchApplication() {
      setIsFetching(true);
      const app = await getDraftApplication(params.id);
      if (app) {
        setFormData({
          regionId: app.regionId || "",
          provinceId: app.provinceId || "",
          cityId: app.cityId || "",
          borrowerAddress: app.borrowerAddress || "",
        });

        if (app.regionId) {
          const provincesList = await fetchProvinces(app.regionId);
          setProvinces(provincesList);
        }

        if (app.provinceId) {
          const citiesList = await fetchCities(app.provinceId);
          setCities(citiesList);
        }
      }
      setIsFetching(false);
    }
    fetchApplication();
  }, [params.id]);

  useEffect(() => {
    async function loadRegions() {
      const regionsList = await fetchRegions();
      setRegions(regionsList);
    }
    loadRegions();
  }, []);

  const handleRegionChange = async (regionId: string) => {
    setFormData((prev) => ({
      ...prev,
      regionId,
      provinceId: "",
      cityId: "",
    }));
    setProvinces([]);
    setCities([]);
    setErrors((prev) => ({ ...prev, regionId: "" }));

    const provincesList = await fetchProvinces(regionId);
    setProvinces(provincesList);

    triggerAutosave({
      step2: {
        ...formData,
        regionId,
        provinceId: "",
        cityId: "",
      },
    });
  };

  const handleProvinceChange = async (provinceId: string) => {
    setFormData((prev) => ({
      ...prev,
      provinceId,
      cityId: "",
    }));
    setCities([]);
    setErrors((prev) => ({ ...prev, provinceId: "" }));

    const citiesList = await fetchCities(provinceId);
    setCities(citiesList);

    triggerAutosave({
      step2: {
        ...formData,
        provinceId,
        cityId: "",
      },
    });
  };

  const handleCityChange = (cityId: string) => {
    setFormData((prev) => ({ ...prev, cityId }));
    setErrors((prev) => ({ ...prev, cityId: "" }));

    triggerAutosave({
      step2: {
        ...formData,
        cityId,
      },
    });
  };

  const handleAddressChange = (address: string) => {
    setFormData((prev) => ({ ...prev, borrowerAddress: address }));
    setErrors((prev) => ({ ...prev, borrowerAddress: "" }));

    triggerAutosave({
      step2: {
        ...formData,
        borrowerAddress: address,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });

    const result = await saveStep2Data(params.id, formDataObj);

    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      router.push(`/applications/${params.id}/edit/step-3`);
    } else {
      if (result.errors) {
        setErrors(result.errors);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message || "Failed to save address information",
      });
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <WizardStepCard
        title="Address Information"
        description="Please provide your location and address details"
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </WizardStepCard>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <WizardStepCard
        title="Address Information"
        description="Please provide your location and address details"
      >
        <div className="space-y-6">
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Please correct the errors below and try again.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="regionId">
              Region <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.regionId}
              onValueChange={handleRegionChange}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.regionId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.regionId && (
              <p className="text-sm text-red-600">{errors.regionId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="provinceId">
              Province <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.provinceId}
              onValueChange={handleProvinceChange}
              disabled={isLoading || !formData.regionId || provinces.length === 0}
            >
              <SelectTrigger className={errors.provinceId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province.id} value={province.id}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.provinceId && (
              <p className="text-sm text-red-600">{errors.provinceId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cityId">
              City/Municipality <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.cityId}
              onValueChange={handleCityChange}
              disabled={isLoading || !formData.provinceId || cities.length === 0}
            >
              <SelectTrigger className={errors.cityId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select city/municipality" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cityId && (
              <p className="text-sm text-red-600">{errors.cityId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="borrowerAddress">
              Complete Address <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="borrowerAddress"
              name="borrowerAddress"
              value={formData.borrowerAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="House/Building No., Street, Barangay"
              disabled={isLoading}
              rows={4}
              className={errors.borrowerAddress ? "border-red-500" : ""}
            />
            {errors.borrowerAddress && (
              <p className="text-sm text-red-600">{errors.borrowerAddress}</p>
            )}
            <p className="text-xs text-gray-500">
              Please provide your complete address including house number, street, and barangay
            </p>
          </div>

          <AutosaveIndicator status={status} />
        </div>
      </WizardStepCard>

      <WizardNavigation
        currentStep={2}
        applicationId={params.id}
        isLoading={isLoading}
      />
    </form>
  );
}
