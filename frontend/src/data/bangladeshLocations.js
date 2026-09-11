import upazilaData from '@bangladeshi/bangladesh-address/build/src/json/bd-upazila.json';

export const locationData = upazilaData.reduce((districts, entry) => {
  if (!districts[entry.district]) districts[entry.district] = [];
  districts[entry.district].push(entry.upazila);
  return districts;
}, {});

export const districts = Object.keys(locationData).sort();
