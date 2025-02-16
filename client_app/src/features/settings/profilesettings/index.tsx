'use client';

import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePhilippineAddress } from '@/hooks/usePhilippineAddress';

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  middleName: Yup.string(),
  lastName: Yup.string().required('Last name is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  gender: Yup.string().required('Gender is required'),
  region: Yup.string().required('Region is required'),
  province: Yup.string().required('Province is required'),
  city: Yup.string().required('City is required'),
  barangay: Yup.string().required('Barangay is required'),
  phoneNumber: Yup.string()
    .matches(/^\+?[0-9]{10,14}$/, 'Invalid phone number')
    .required('Phone number is required')
});

function UserProfileForm() {
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  console.log({ loggedInUser });
  const [mockData, setMockData] = useState({
    firstName: loggedInUser.first_name,
    middleName: loggedInUser.middle_name,
    lastName: loggedInUser.last_name,
    dateOfBirth: new Date(loggedInUser.date_of_birth),
    gender: loggedInUser.gender,
    region: loggedInUser.address_region,
    province: loggedInUser.address_province,
    city: loggedInUser.address_city,
    barangay: loggedInUser.address_or_location,
    phoneNumber: loggedInUser.phone_number,
    profilePicture: loggedInUser.profile_pic
  });

  // const [isRegionLoading, setIsRegionLoading] = useState(true);
  // const [isProvinceLoading, setIsProvinceLoading] = useState(false);
  // const [isCityLoading, setIsCityLoading] = useState(false);
  // const [isBarangayLoading, setIsBarangayLoading] = useState(false);

  const [isRegionLoading, setIsRegionLoading] = useState(true);
  const [isProvinceLoading, setIsProvinceLoading] = useState(false);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const [isBarangayLoading, setIsBarangayLoading] = useState(false);

  const {
    regions,
    provinces,
    cities,
    barangays,
    selectedRegion,
    selectedProvince,
    selectedCity,
    handleRegionChange,
    handleProvinceChange,
    handleCityChange,
    // isRegionLoading,
    // isProvinceLoading,
    // isCityLoading,
    // isBarangayLoading,
    initializeAddress
  } = usePhilippineAddress();

  useEffect(() => {
    initializeAddress(
      mockData.region,
      mockData.province,
      mockData.city,
      mockData.barangay
    );
  }, [
    initializeAddress,
    mockData.region,
    mockData.province,
    mockData.city,
    mockData.barangay
  ]);

  const handleSubmit = (values, { setSubmitting }) => {
    console.log(values);
    // setMockData(values);
    // alert('Profile updated successfully!');
    // setSubmitting(false);
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-1xl">
      <CardHeader>
        {/* <CardTitle className="text-2xl font-semibold text-gray-800">
          User Profile
        </CardTitle>
        <CardDescription>Manage your personal information</CardDescription> */}
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={mockData}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize>
          {({ values, setFieldValue, isSubmitting, errors, touched }) => (
            <Form className="space-y-8">
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="w-32 h-32 bg-base-200">
                    <AvatarImage
                      src={values.profilePicture}
                      alt="Profile picture"
                    />
                    <AvatarFallback>
                      {values.firstName[0]}
                      {values.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-picture"
                    className="bg-blue-700 absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer">
                    <Camera className="w-5 h-5" />
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={event => {
                        const file = event.currentTarget.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFieldValue('profilePicture', reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Field
                      name="firstName"
                      as={Input}
                      className={
                        errors.firstName && touched.firstName
                          ? 'border-red-500'
                          : ''
                      }
                    />
                    <ErrorMessage
                      name="firstName"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Field
                      name="middleName"
                      as={Input}
                      className={
                        errors.middleName && touched.middleName
                          ? 'border-red-500'
                          : ''
                      }
                    />
                    <ErrorMessage
                      name="middleName"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Field
                      name="lastName"
                      as={Input}
                      className={
                        errors.lastName && touched.lastName
                          ? 'border-red-500'
                          : ''
                      }
                    />
                    <ErrorMessage
                      name="lastName"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !values.dateOfBirth && 'text-muted-foreground',
                            errors.dateOfBirth && touched.dateOfBirth
                              ? 'border-red-500'
                              : ''
                          )}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {values.dateOfBirth ? (
                            format(values.dateOfBirth, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={values.dateOfBirth}
                          onSelect={date => setFieldValue('dateOfBirth', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <ErrorMessage
                      name="dateOfBirth"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      value={
                        values.dateOfBirth
                          ? calculateAge(values.dateOfBirth)
                          : ''
                      }
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Field
                      name="gender"
                      as={Select}
                      className={
                        errors.gender && touched.gender ? 'border-red-500' : ''
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Field>
                    <ErrorMessage
                      name="gender"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Field name="region">
                      {({ field }) => (
                        <Select
                          onValueChange={value => {
                            field.onChange({
                              target: { name: 'region', value }
                            });

                            console.log({ value });
                            handleRegionChange(value);
                          }}
                          value={field.value}
                          disabled={isRegionLoading}>
                          <SelectTrigger
                            className={
                              errors.region && touched.region
                                ? 'border-red-500'
                                : ''
                            }>
                            <SelectValue
                              placeholder={
                                isRegionLoading ? 'Loading...' : 'Select region'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent position="popper" side="top">
                            {regions.map(region => (
                              <SelectItem key={region.code} value={region.code}>
                                {region.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage
                      name="region"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Field name="province">
                      {({ field }) => (
                        <Select
                          onValueChange={value => {
                            field.onChange({
                              target: { name: 'province', value }
                            });
                            handleProvinceChange(value);
                          }}
                          value={field.value}
                          disabled={!selectedRegion || isProvinceLoading}>
                          <SelectTrigger
                            className={
                              errors.province && touched.province
                                ? 'border-red-500'
                                : ''
                            }>
                            <SelectValue
                              placeholder={
                                isProvinceLoading
                                  ? 'Loading...'
                                  : 'Select province'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent position="popper" side="top">
                            {provinces.map(province => (
                              <SelectItem
                                key={province.code}
                                value={province.code}>
                                {province.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage
                      name="province"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City/Municipality</Label>
                    <Field name="city">
                      {({ field }) => (
                        <Select
                          onValueChange={value => {
                            field.onChange({ target: { name: 'city', value } });
                            handleCityChange(value);
                          }}
                          value={field.value}
                          disabled={!selectedProvince || isCityLoading}>
                          <SelectTrigger
                            className={
                              errors.city && touched.city
                                ? 'border-red-500'
                                : ''
                            }>
                            <SelectValue
                              placeholder={
                                isCityLoading
                                  ? 'Loading...'
                                  : 'Select city/municipality'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent position="popper" side="top">
                            {cities.map(city => (
                              <SelectItem key={city.code} value={city.code}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage
                      name="city"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barangay">Barangay</Label>
                    <Field name="barangay">
                      {({ field }) => (
                        <Select
                          onValueChange={value => {
                            field.onChange({
                              target: { name: 'barangay', value }
                            });
                          }}
                          value={field.value}
                          disabled={!selectedCity || isBarangayLoading}>
                          <SelectTrigger
                            className={
                              errors.barangay && touched.barangay
                                ? 'border-red-500'
                                : ''
                            }>
                            <SelectValue
                              placeholder={
                                isBarangayLoading
                                  ? 'Loading...'
                                  : 'Select barangay'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent position="popper" side="top">
                            {barangays.map(barangay => (
                              <SelectItem
                                key={barangay.code}
                                value={barangay.code}>
                                {barangay.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage
                      name="barangay"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Field
                    name="phoneNumber"
                    as={Input}
                    className={
                      errors.phoneNumber && touched.phoneNumber
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  <ErrorMessage
                    name="phoneNumber"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-700 text-white"
                disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}

export default UserProfileForm;
