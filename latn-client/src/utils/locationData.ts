export type Ward = { code: number; name: string };
export type District = { code: number; name: string; wards: Ward[] };
export type Province = { code: number; name: string; districts: District[] };

/** Tải dữ liệu từ file JSON */
export async function loadProvinces(): Promise<Province[]> {
  const res = await fetch("/data/vietnam_provinces.json");
  const data = await res.json();
  return data;
}

/** Lấy danh sách huyện theo mã tỉnh */
export function getDistricts(provinces: Province[], provinceCode: number) {
  const province = provinces.find((p) => p.code === provinceCode);
  return province ? province.districts : [];
}

/** Lấy danh sách xã theo mã huyện */
export function getWards(districts: District[], districtCode: number) {
  const district = districts.find((d) => d.code === districtCode);
  return district ? district.wards : [];
}
