import districtData from './bangladeshDistricts.json';
import upazilaData from './bangladeshUpazilas.json';
import thanaData from './bangladeshThanas.json';

const districtNames = Object.fromEntries(districtData.map((district) => [district.id, district.name]));

export const locationData = upazilaData.reduce((districts, entry) => {
  const district = districtNames[entry.districtId];
  if (!districts[district]) districts[district] = [];
  districts[district].push(entry.name);
  return districts;
}, {});

export const thanaDataByDistrict = thanaData.reduce((districts, entry) => {
  const district = districtNames[entry.districtId];
  if (!districts[district]) districts[district] = [];
  districts[district].push(entry.name);
  return districts;
}, {});

Object.values(locationData).forEach((locations) => locations.sort());
Object.values(thanaDataByDistrict).forEach((locations) => locations.sort());

export const districts = districtData.map((district) => district.name).sort();
