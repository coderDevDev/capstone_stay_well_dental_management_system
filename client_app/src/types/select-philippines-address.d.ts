declare module 'select-philippines-address' {
  export function regions(): Promise<
    { region_code: string; region_name: string }[]
  >;
  export function provinces(
    regionCode: string
  ): Promise<{ province_code: string; province_name: string }[]>;
  export function cities(
    provinceCode: string
  ): Promise<{ city_code: string; city_name: string }[]>;
  export function barangays(
    cityCode: string
  ): Promise<{ brgy_code: string; brgy_name: string }[]>;
}
