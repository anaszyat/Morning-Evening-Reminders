export type City = {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

export const cities: City[] = [
  { id: "mecca", name: "مكة المكرمة", country: "المملكة العربية السعودية", latitude: 21.3891, longitude: 39.8579 },
  { id: "medina", name: "المدينة المنورة", country: "المملكة العربية السعودية", latitude: 24.4686, longitude: 39.6142 },
  { id: "riyadh", name: "الرياض", country: "المملكة العربية السعودية", latitude: 24.7136, longitude: 46.6753 },
  { id: "jeddah", name: "جدة", country: "المملكة العربية السعودية", latitude: 21.4858, longitude: 39.1925 },
  { id: "dammam", name: "الدمام", country: "المملكة العربية السعودية", latitude: 26.4207, longitude: 50.0888 },
  { id: "kuwait", name: "الكويت", country: "الكويت", latitude: 29.3759, longitude: 47.9774 },
  { id: "doha", name: "الدوحة", country: "قطر", latitude: 25.2854, longitude: 51.5310 },
  { id: "abudhabi", name: "أبوظبي", country: "الإمارات", latitude: 24.4539, longitude: 54.3773 },
  { id: "dubai", name: "دبي", country: "الإمارات", latitude: 25.2048, longitude: 55.2708 },
  { id: "manama", name: "المنامة", country: "البحرين", latitude: 26.2285, longitude: 50.5860 },
  { id: "muscat", name: "مسقط", country: "عُمان", latitude: 23.5880, longitude: 58.3829 },
  { id: "amman", name: "عمّان", country: "الأردن", latitude: 31.9454, longitude: 35.9284 },
  { id: "cairo", name: "القاهرة", country: "مصر", latitude: 30.0444, longitude: 31.2357 },
  { id: "alexandria", name: "الإسكندرية", country: "مصر", latitude: 31.2001, longitude: 29.9187 },
  { id: "baghdad", name: "بغداد", country: "العراق", latitude: 33.3152, longitude: 44.3661 },
  { id: "damascus", name: "دمشق", country: "سوريا", latitude: 33.5138, longitude: 36.2765 },
  { id: "beirut", name: "بيروت", country: "لبنان", latitude: 33.8938, longitude: 35.5018 },
  { id: "tunis", name: "تونس", country: "تونس", latitude: 36.8065, longitude: 10.1815 },
  { id: "algiers", name: "الجزائر", country: "الجزائر", latitude: 36.7538, longitude: 3.0588 },
  { id: "rabat", name: "الرباط", country: "المغرب", latitude: 34.0209, longitude: -6.8416 },
  { id: "casablanca", name: "الدار البيضاء", country: "المغرب", latitude: 33.5731, longitude: -7.5898 },
  { id: "khartoum", name: "الخرطوم", country: "السودان", latitude: 15.5007, longitude: 32.5599 },
  { id: "sanaa", name: "صنعاء", country: "اليمن", latitude: 15.3694, longitude: 44.1910 },
  { id: "istanbul", name: "إسطنبول", country: "تركيا", latitude: 41.0082, longitude: 28.9784 },
  { id: "london", name: "لندن", country: "المملكة المتحدة", latitude: 51.5074, longitude: -0.1278 },
  { id: "paris", name: "باريس", country: "فرنسا", latitude: 48.8566, longitude: 2.3522 },
  { id: "newyork", name: "نيويورك", country: "الولايات المتحدة", latitude: 40.7128, longitude: -74.0060 },
];

export const KAABA = { latitude: 21.4225, longitude: 39.8262 };
