// 2024-2025 Assessment Data
export const assessment2025Data = [
  {
    id: "andaman-2025",
    state: "Andaman and Nicobar Islands",
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 34818.07,
    extractableResource: 34818.07,
    annualExtraction: 785.83,
    stageOfExtraction: 2.27,
    category: "Safe"
  },
  {
    id: "arunachal-2025",
    state: "Arunachal Pradesh",
    district: "All Districts", 
    block: "All Blocks",
    year: 2025,
    annualRecharge: 328838.35,
    extractableResource: 328838.35,
    annualExtraction: 1343.76,
    stageOfExtraction: 0.41,
    category: "Safe"
  },
  {
    id: "assam-2025",
    state: "Assam",
    district: "All Districts",
    block: "All Blocks", 
    year: 2025,
    annualRecharge: 2064417.52,
    extractableResource: 2064417.52,
    annualExtraction: 293141.2,
    stageOfExtraction: 14.2,
    category: "Safe"
  },
  {
    id: "bihar-2025",
    state: "Bihar",
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 3132096.73,
    extractableResource: 3132096.73,
    annualExtraction: 1446952.86,
    stageOfExtraction: 46.2,
    category: "Safe"
  },
  {
    id: "chandigarh-2025",
    state: "Chandigarh",
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 4693.75,
    extractableResource: 4693.75,
    annualExtraction: 3206.89,
    stageOfExtraction: 68.32,
    category: "Semi-Critical"
  },
  {
    id: "chhattisgarh-2025",
    state: "Chhattisgarh",
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 1306865.95,
    extractableResource: 1306865.95,
    annualExtraction: 629687.36,
    stageOfExtraction: 48.18,
    category: "Safe"
  },
  {
    id: "delhi-2025",
    state: "Delhi",
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 34557.15,
    extractableResource: 34557.15,
    annualExtraction: 31828.23,
    stageOfExtraction: 92.1,
    category: "Over-Exploited"
  },
  {
    id: "gujarat-2025",
    state: "Gujarat",
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 3741168.27,
    extractableResource: 3741168.27,
    annualExtraction: 1746073.42,
    stageOfExtraction: 56.12,
    category: "Semi-Critical"
  },
  {
    id: "haryana-2025",
    state: "Haryana",
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 930112.81,
    extractableResource: 930112.81,
    annualExtraction: 1371952.39,
    stageOfExtraction: 136.75,
    category: "Over-Exploited"
  },
  {
    id: "karnataka-2025",
    state: "Karnataka",
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 1741410.74,
    extractableResource: 1741410.74,
    annualExtraction: 1157913.85,
    stageOfExtraction: 66.49,
    category: "Semi-Critical"
  },
  {
    id: "kerala-2025",
    state: "Kerala",
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 464546.88,
    extractableResource: 464546.88,
    annualExtraction: 232251.54,
    stageOfExtraction: 50.0,
    category: "Safe"
  },
  {
    id: "maharashtra-2025",
    state: "Maharashtra",
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 2577586.51,
    extractableResource: 2577586.51,
    annualExtraction: 1286494.45,
    stageOfExtraction: 49.71,
    category: "Safe"
  },
  {
    id: "punjab-2025",
    state: "Punjab",
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 1889095.02,
    extractableResource: 1889095.02,
    annualExtraction: 2795751.6,
    stageOfExtraction: 156.36,
    category: "Over-Exploited"
  },
  {
    id: "rajasthan-2025",
    state: "Rajasthan",
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 1476785.16,
    extractableResource: 1476785.16,
    annualExtraction: 1793068.91,
    stageOfExtraction: 147.11,
    category: "Over-Exploited"
  },
  {
    id: "tamil-nadu-2025",
    state: "Tamil Nadu",
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 2267584.33,
    extractableResource: 2267584.33,
    annualExtraction: 1565976.35,
    stageOfExtraction: 71.66,
    category: "Critical"
  },
  {
    id: "telangana-2025",
    state: "Telangana", 
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 1961255.42,
    extractableResource: 1961255.42,
    annualExtraction: 918993.91,
    stageOfExtraction: 46.86,
    category: "Safe"
  },
  {
    id: "west-bengal-2025",
    state: "West Bengal",
    district: "All Districts",
    block: "All Blocks",
    year: 2025,
    annualRecharge: 2349657.61,
    extractableResource: 2349657.61,
    annualExtraction: 1060324.44,
    stageOfExtraction: 45.13,
    category: "Safe"
  }
];

export function getStateData2025(stateName: string) {
  return assessment2025Data.find(item => 
    item.state.toLowerCase().includes(stateName.toLowerCase())
  );
}

export function getAllStates2025() {
  return assessment2025Data.map(item => item.state);
}