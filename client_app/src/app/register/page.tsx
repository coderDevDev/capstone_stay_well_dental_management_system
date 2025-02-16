import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  regions,
  provinces,
  cities,
  barangays,
  regionByCode,
  provincesByCode,
  provinceByName
} from 'select-philippines-address';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { userService } from '@/services/api';
import { toast } from 'sonner';

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: 'First Name must be at least 2 characters' }),
    middleName: z
      .string()
      .min(2, { message: 'Middle Name must be at least 2 characters' })
      .optional(),
    lastName: z
      .string()
      .min(2, { message: 'Last Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Invalid email address' }).optional(),
    phoneNumber: z.string().min(10, { message: 'Invalid phone number' }),
    dateOfBirth: z.string(),
    gender: z.enum(['Male', 'Female', 'Other']),
    region: z.string().min(1, { message: 'Region is required' }),
    province: z.string().min(1, { message: 'Province is required' }),
    city: z.string().min(1, { message: 'City is required' }),
    barangay: z.string().min(1, { message: 'Barangay is required' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .optional(),
    confirmPassword: z.string().optional(),
    medicalHistory: z.string().optional()
  })
  .refine(
    data =>
      !data.password ||
      !data.confirmPassword ||
      data.password === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ['confirmPassword']
    }
  );

interface RegisterPageProps {
  setIsDialogOpen?: (open: boolean) => void;
  initialData?: any;
  isEdit?: boolean;
  onSubmit?: (values: any) => Promise<void>;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

const LoadingSelectItem = () => (
  <SelectItem value="_loading" disabled>
    Loading...
  </SelectItem>
);

const NoDataSelectItem = () => (
  <SelectItem value="_empty" disabled>
    No data available
  </SelectItem>
);

export default function RegisterPage({
  setIsDialogOpen,
  initialData,
  isEdit = false,
  onSubmit,
  onSuccess,
  onError
}: RegisterPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [regionss, setRegions] = useState([]);
  const [provincess, setProvinces] = useState([]);
  const [citiess, setCities] = useState([]);
  const [barangayss, setBarangays] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const regionsList = await regions();
        setRegions(regionsList);

        if (isEdit && initialData) {
          if (initialData.address_region) {
            const provincesList = await provinces(initialData.address_region);
            setProvinces(provincesList);
          }
          if (initialData.address_province) {
            const citiesList = await cities(initialData.address_province);
            setCities(citiesList);
          }
          if (initialData.address_city) {
            const barangaysList = await barangays(initialData.address_city);
            setBarangays(barangaysList);
          }
        }
      } catch (error) {
        console.error('Error loading address data:', error);
        setLoadingError('Failed to load address data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [isEdit, initialData]);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues:
      isEdit && initialData?.formData
        ? {
            ...initialData.formData,
            password: undefined,
            confirmPassword: undefined
          }
        : {
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            dateOfBirth: '',
            gender: 'Male',
            region: '',
            province: '',
            city: '',
            barangay: '',
            password: '',
            confirmPassword: '',
            medicalHistory: ''
          }
  });

  const handleRegionChange = async (regionCode: string) => {
    if (!regionCode || regionCode === '_empty') return;

    try {
      setIsLoading(true);
      const provincesList = await provinces(regionCode);
      setProvinces(provincesList || []); // Ensure we always set an array
      setCities([]);
      setBarangays([]);

      // Clear dependent fields
      form.setValue('province', '');
      form.setValue('city', '');
      form.setValue('barangay', '');
    } catch (error) {
      console.error('Error loading provinces:', error);
      toast.error('Failed to load provinces');
      setProvinces([]); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvinceChange = async (provinceCode: string) => {
    if (!provinceCode || provinceCode === '_empty') return;

    try {
      setIsLoading(true);
      const citiesList = await cities(provinceCode);
      setCities(citiesList || []); // Ensure we always set an array
      setBarangays([]);

      // Clear dependent fields
      form.setValue('city', '');
      form.setValue('barangay', '');
    } catch (error) {
      console.error('Error loading cities:', error);
      toast.error('Failed to load cities');
      setCities([]); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCityChange = async (cityCode: string) => {
    if (!cityCode || cityCode === '_empty') return;

    try {
      setIsLoading(true);
      const barangaysList = await barangays(cityCode);
      setBarangays(barangaysList || []); // Ensure we always set an array

      // Clear dependent field
      form.setValue('barangay', '');
    } catch (error) {
      console.error('Error loading barangays:', error);
      toast.error('Failed to load barangays');
      setBarangays([]); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = form.getValues();

      if (isEdit) {
        delete formData.password;
        delete formData.confirmPassword;
        delete formData.email;

        await onSubmit?.(formData);
        toast.success('Patient updated successfully');
      } else {
        const response = await userService.register(formData);
        if (response.success) {
          localStorage.setItem('tempEmail', JSON.stringify(formData.email));
          toast.success(
            'Registration successful! Please check your email for verification.'
          );
          onSuccess?.();
          form.reset();
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred';
      toast.error(errorMessage);
      onError?.(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full space-y-8 rounded-lg bg-white p-6 shadow-sm border">
        <Form {...form}>
          <form className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="col-span-full grid grid-cols-1 gap-6 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({
                  field,
                  fieldState
                }: {
                  field: any;
                  fieldState: any;
                }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="First Name"
                        {...field}
                        className={cn(
                          'h-9 px-3 py-1 text-sm rounded-md border shadow-sm transition-colors',
                          'focus:outline-none focus:ring-1 focus:ring-blue-400',
                          fieldState.invalid
                            ? 'border-red-500'
                            : 'border-gray-200',
                          isEdit &&
                            field.name === 'email' &&
                            'bg-gray-100 text-gray-600 cursor-not-allowed'
                        )}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="middleName"
                render={({
                  field,
                  fieldState
                }: {
                  field: any;
                  fieldState: any;
                }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Middle Name"
                        {...field}
                        className={cn(
                          'h-9 px-3 py-1 text-sm rounded-md border shadow-sm transition-colors',
                          'focus:outline-none focus:ring-1 focus:ring-blue-400',
                          fieldState.invalid
                            ? 'border-red-500'
                            : 'border-gray-200',
                          isEdit &&
                            field.name === 'email' &&
                            'bg-gray-100 text-gray-600 cursor-not-allowed'
                        )}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({
                  field,
                  fieldState
                }: {
                  field: any;
                  fieldState: any;
                }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Last Name"
                        {...field}
                        className={cn(
                          'h-9 px-3 py-1 text-sm rounded-md border shadow-sm transition-colors',
                          'focus:outline-none focus:ring-1 focus:ring-blue-400',
                          fieldState.invalid
                            ? 'border-red-500'
                            : 'border-gray-200',
                          isEdit &&
                            field.name === 'email' &&
                            'bg-gray-100 text-gray-600 cursor-not-allowed'
                        )}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({
                field,
                fieldState
              }: {
                field: any;
                fieldState: any;
              }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      {...field}
                      disabled={isEdit}
                      className={cn(
                        'h-9 px-3 py-1 text-sm rounded-md border shadow-sm transition-colors',
                        'focus:outline-none focus:ring-1 focus:ring-blue-400',
                        fieldState.invalid
                          ? 'border-red-500'
                          : 'border-gray-200',
                        isEdit &&
                          field.name === 'email' &&
                          'bg-gray-100 text-gray-600 cursor-not-allowed'
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <div className="col-span-full grid grid-cols-1 gap-6 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({
                  field,
                  fieldState
                }: {
                  field: any;
                  fieldState: any;
                }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Phone Number"
                        {...field}
                        className={cn(
                          'h-9 px-3 py-1 text-sm rounded-md border shadow-sm transition-colors',
                          'focus:outline-none focus:ring-1 focus:ring-blue-400',
                          fieldState.invalid
                            ? 'border-red-500'
                            : 'border-gray-200',
                          isEdit &&
                            field.name === 'email' &&
                            'bg-gray-100 text-gray-600 cursor-not-allowed'
                        )}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({
                  field,
                  fieldState
                }: {
                  field: any;
                  fieldState: any;
                }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className={cn(
                          'h-9 px-3 py-1 text-sm rounded-md border shadow-sm transition-colors',
                          'focus:outline-none focus:ring-1 focus:ring-blue-400',
                          fieldState.invalid
                            ? 'border-red-500'
                            : 'border-gray-200',
                          isEdit &&
                            field.name === 'email' &&
                            'bg-gray-100 text-gray-600 cursor-not-allowed'
                        )}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({
                  field,
                  fieldState
                }: {
                  field: any;
                  fieldState: any;
                }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={value => field.onChange(value)}>
                        <SelectTrigger
                          className={
                            fieldState.invalid ? 'border-red-500' : ''
                          }>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-full grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="region"
                render={({
                  field,
                  fieldState
                }: {
                  field: any;
                  fieldState: any;
                }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ''}
                        onValueChange={value => {
                          field.onChange(value);
                          if (value !== '_empty') {
                            handleRegionChange(value);
                          }
                        }}>
                        <SelectTrigger
                          className={fieldState.invalid ? 'border-red-500' : ''}
                          disabled={isLoading}>
                          <SelectValue placeholder="Select Region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {isLoading ? (
                              <LoadingSelectItem />
                            ) : regionss.length > 0 ? (
                              regionss.map(region => (
                                <SelectItem
                                  key={region.region_code}
                                  value={region.region_code}>
                                  {region.region_name}
                                </SelectItem>
                              ))
                            ) : (
                              <NoDataSelectItem />
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({
                  field,
                  fieldState
                }: {
                  field: any;
                  fieldState: any;
                }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ''}
                        onValueChange={value => {
                          field.onChange(value);
                          if (value !== '_empty') {
                            handleProvinceChange(value);
                          }
                        }}>
                        <SelectTrigger
                          className={fieldState.invalid ? 'border-red-500' : ''}
                          disabled={!form.getValues('region') || isLoading}>
                          <SelectValue placeholder="Select Province" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {isLoading ? (
                              <LoadingSelectItem />
                            ) : !form.getValues('region') ? (
                              <SelectItem value="_empty" disabled>
                                Select a region first
                              </SelectItem>
                            ) : provincess.length > 0 ? (
                              provincess.map(province => (
                                <SelectItem
                                  key={province.province_code}
                                  value={province.province_code}>
                                  {province.province_name}
                                </SelectItem>
                              ))
                            ) : (
                              <NoDataSelectItem />
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-full grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="city"
                render={({
                  field,
                  fieldState
                }: {
                  field: any;
                  fieldState: any;
                }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ''}
                        onValueChange={value => {
                          field.onChange(value);
                          if (value !== '_empty') {
                            handleCityChange(value);
                          }
                        }}>
                        <SelectTrigger
                          className={fieldState.invalid ? 'border-red-500' : ''}
                          disabled={!form.getValues('province') || isLoading}>
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {isLoading ? (
                              <LoadingSelectItem />
                            ) : !form.getValues('province') ? (
                              <SelectItem value="_empty" disabled>
                                Select a province first
                              </SelectItem>
                            ) : citiess.length > 0 ? (
                              citiess.map(city => (
                                <SelectItem
                                  key={city.city_code}
                                  value={city.city_code}>
                                  {city.city_name}
                                </SelectItem>
                              ))
                            ) : (
                              <NoDataSelectItem />
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="barangay"
                render={({
                  field,
                  fieldState
                }: {
                  field: any;
                  fieldState: any;
                }) => (
                  <FormItem>
                    <FormLabel>Barangay</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ''}
                        onValueChange={value => {
                          field.onChange(value);
                        }}>
                        <SelectTrigger
                          className={fieldState.invalid ? 'border-red-500' : ''}
                          disabled={!form.getValues('city') || isLoading}>
                          <SelectValue placeholder="Select Barangay" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {isLoading ? (
                              <LoadingSelectItem />
                            ) : !form.getValues('city') ? (
                              <SelectItem value="_empty" disabled>
                                Select a city first
                              </SelectItem>
                            ) : barangayss.length > 0 ? (
                              barangayss.map(barangay => (
                                <SelectItem
                                  key={barangay.brgy_code}
                                  value={barangay.brgy_code}>
                                  {barangay.brgy_name}
                                </SelectItem>
                              ))
                            ) : (
                              <NoDataSelectItem />
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-full">
              <FormField
                control={form.control}
                name="medicalHistory"
                render={({
                  field,
                  fieldState
                }: {
                  field: any;
                  fieldState: any;
                }) => (
                  <FormItem>
                    <FormLabel>Medical History</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className={`w-full min-h-[100px] p-2 border rounded-md ${
                          fieldState.invalid
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="Enter medical history..."
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            {!isEdit && (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({
                    field,
                    fieldState
                  }: {
                    field: any;
                    fieldState: any;
                  }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          {...field}
                          className={fieldState.invalid ? 'border-red-500' : ''}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({
                    field,
                    fieldState
                  }: {
                    field: any;
                    fieldState: any;
                  }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm Password"
                          {...field}
                          className={fieldState.invalid ? 'border-red-500' : ''}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <div className="col-span-full flex items-center">
                  <input
                    type="checkbox"
                    id="showPassword"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="mr-2"
                  />
                  <label htmlFor="showPassword" className="text-sm">
                    Show Password
                  </label>
                </div>
              </>
            )}
            <FormField
              control={form.control}
              name="agreeToTerms"
              render={({
                field,
                fieldState
              }: {
                field: any;
                fieldState: any;
              }) => (
                <FormItem className="col-span-full">
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            {error && (
              <p className="col-span-full text-xs text-red-500">{error}</p>
            )}
            <Button
              type="button"
              onClick={() => form.handleSubmit(handleSubmit)()}
              disabled={isSubmitting}
              className={`col-span-full w-full ${
                isEdit ? 'bg-blue-600' : 'bg-blue-600'
              } text-white`}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : isEdit ? (
                'Update'
              ) : (
                'Submit'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
