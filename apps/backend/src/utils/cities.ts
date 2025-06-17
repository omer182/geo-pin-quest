import { City } from '@geo-pin-quest/shared';

// Backend cities data - mapped from frontend with difficulty levels
export const cities: City[] = [
  // Level 1: Major world capitals and very famous cities (easy) - difficulty 1-2
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, difficulty: 1 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, difficulty: 1 },
  { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060, difficulty: 1 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6895, lng: 139.6917, difficulty: 1 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, difficulty: 1 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, difficulty: 1 },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6176, difficulty: 1 },
  { name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, difficulty: 1 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, difficulty: 1 },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, difficulty: 1 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, difficulty: 1 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, difficulty: 1 },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, difficulty: 1 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, difficulty: 1 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, difficulty: 1 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, difficulty: 1 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, difficulty: 1 },
  { name: 'Hong Kong', country: 'China', lat: 22.3193, lng: 114.1694, difficulty: 1 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, difficulty: 1 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, difficulty: 1 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, difficulty: 1 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, difficulty: 1 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6118, lng: -58.3960, difficulty: 1 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, difficulty: 1 },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lng: 18.4241, difficulty: 1 },

  // Level 2: Important regional cities and secondary capitals (medium-easy) - difficulty 2-3
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, difficulty: 2 },
  { name: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.1900, difficulty: 2 },
  { name: 'Munich', country: 'Germany', lat: 48.1351, lng: 11.5820, difficulty: 2 },
  { name: 'Lyon', country: 'France', lat: 45.7640, lng: 4.8357, difficulty: 2 },
  { name: 'Manchester', country: 'United Kingdom', lat: 53.4808, lng: -2.2426, difficulty: 2 },
  { name: 'Hamburg', country: 'Germany', lat: 53.5511, lng: 9.9937, difficulty: 2 },
  { name: 'Phoenix', country: 'United States', lat: 33.4484, lng: -112.0740, difficulty: 2 },
  { name: 'Philadelphia', country: 'United States', lat: 39.9526, lng: -75.1652, difficulty: 2 },
  { name: 'Houston', country: 'United States', lat: 29.7604, lng: -95.3698, difficulty: 2 },
  { name: 'Boston', country: 'United States', lat: 42.3601, lng: -71.0589, difficulty: 2 },
  { name: 'Seattle', country: 'United States', lat: 47.6062, lng: -122.3321, difficulty: 2 },
  { name: 'Montreal', country: 'Canada', lat: 45.5017, lng: -73.5673, difficulty: 2 },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631, difficulty: 2 },
  { name: 'Brisbane', country: 'Australia', lat: -27.4698, lng: 153.0251, difficulty: 2 },
  { name: 'Osaka', country: 'Japan', lat: 34.6937, lng: 135.5023, difficulty: 2 },
  { name: 'Kyoto', country: 'Japan', lat: 35.0116, lng: 135.7681, difficulty: 2 },
  { name: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946, difficulty: 2 },
  { name: 'Chennai', country: 'India', lat: 13.0827, lng: 80.2707, difficulty: 2 },

  // Level 3: Lesser known but still significant cities (medium) - difficulty 3-4
  { name: 'Gothenburg', country: 'Sweden', lat: 57.7089, lng: 11.9746, difficulty: 3 },
  { name: 'Porto', country: 'Portugal', lat: 41.1579, lng: -8.6291, difficulty: 3 },
  { name: 'Florence', country: 'Italy', lat: 43.7696, lng: 11.2558, difficulty: 3 },
  { name: 'Nice', country: 'France', lat: 43.7102, lng: 7.2620, difficulty: 3 },
  { name: 'Bordeaux', country: 'France', lat: 44.8378, lng: -0.5792, difficulty: 3 },
  { name: 'Bilbao', country: 'Spain', lat: 43.2627, lng: -2.9253, difficulty: 3 },
  { name: 'Krakow', country: 'Poland', lat: 50.0647, lng: 19.9450, difficulty: 3 },
  { name: 'Gdansk', country: 'Poland', lat: 54.3520, lng: 18.6466, difficulty: 3 },
  { name: 'Bratislava', country: 'Slovakia', lat: 48.1486, lng: 17.1077, difficulty: 3 },
  { name: 'Ljubljana', country: 'Slovenia', lat: 46.0569, lng: 14.5058, difficulty: 3 },
  { name: 'Tallinn', country: 'Estonia', lat: 59.4370, lng: 24.7536, difficulty: 3 },
  { name: 'Riga', country: 'Latvia', lat: 56.9496, lng: 24.1052, difficulty: 3 },
  { name: 'Vilnius', country: 'Lithuania', lat: 54.6872, lng: 25.2797, difficulty: 3 },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lng: -21.9426, difficulty: 3 },
  { name: 'Sarajevo', country: 'Bosnia and Herzegovina', lat: 43.8563, lng: 18.4131, difficulty: 3 },

  // Level 4: Smaller regional centers and specialized cities (hard) - difficulty 4-5
  { name: 'Tartu', country: 'Estonia', lat: 58.3780, lng: 26.7290, difficulty: 4 },
  { name: 'Tromso', country: 'Norway', lat: 69.6492, lng: 18.9553, difficulty: 4 },
  { name: 'Rovaniemi', country: 'Finland', lat: 66.5039, lng: 25.7294, difficulty: 4 },
  { name: 'Oulu', country: 'Finland', lat: 65.0121, lng: 25.4651, difficulty: 4 },
  { name: 'Lulea', country: 'Sweden', lat: 65.5848, lng: 22.1547, difficulty: 4 },
  { name: 'Kiruna', country: 'Sweden', lat: 67.8558, lng: 20.2253, difficulty: 4 },
  { name: 'Bodo', country: 'Norway', lat: 67.2804, lng: 14.4049, difficulty: 4 },
  { name: 'Faroe Islands', country: 'Denmark', lat: 61.8926, lng: -6.9118, difficulty: 4 },
  { name: 'Nuuk', country: 'Greenland', lat: 64.1836, lng: -51.7214, difficulty: 4 },
  { name: 'Honningsvag', country: 'Norway', lat: 70.9822, lng: 25.9709, difficulty: 4 },
  { name: 'Andorra la Vella', country: 'Andorra', lat: 42.5063, lng: 1.5218, difficulty: 4 },
  { name: 'San Marino', country: 'San Marino', lat: 43.9424, lng: 12.4578, difficulty: 4 },
  { name: 'Vaduz', country: 'Liechtenstein', lat: 47.1410, lng: 9.5209, difficulty: 4 },
  { name: 'Monaco', country: 'Monaco', lat: 43.7384, lng: 7.4246, difficulty: 4 },
  { name: 'Vatican City', country: 'Vatican City', lat: 41.9029, lng: 12.4534, difficulty: 4 },

  // Level 5: Very obscure or extremely challenging locations (expert) - difficulty 5
  { name: 'Longyearbyen', country: 'Norway', lat: 78.2232, lng: 15.6267, difficulty: 5 },
  { name: 'Barentsburg', country: 'Norway', lat: 78.0648, lng: 14.2335, difficulty: 5 },
  { name: 'Alert', country: 'Canada', lat: 82.5018, lng: -62.3481, difficulty: 5 },
  { name: 'Ny-Alesund', country: 'Norway', lat: 78.9273, lng: 11.9341, difficulty: 5 },
  { name: 'Ushuaia', country: 'Argentina', lat: -54.8019, lng: -68.3030, difficulty: 5 },
  { name: 'Punta Arenas', country: 'Chile', lat: -53.1638, lng: -70.9171, difficulty: 5 },
  { name: 'McMurdo Station', country: 'Antarctica', lat: -77.8419, lng: 166.6863, difficulty: 5 },
  { name: 'Pitcairn Island', country: 'United Kingdom', lat: -25.0660, lng: -130.1003, difficulty: 5 },
  { name: 'Tristan da Cunha', country: 'United Kingdom', lat: -37.1052, lng: -12.2777, difficulty: 5 },
  { name: 'St. Helena', country: 'United Kingdom', lat: -15.9387, lng: -5.7180, difficulty: 5 }
];

// Helper function to get cities by difficulty level
export function getCitiesByDifficulty(difficulty: number): City[] {
  return cities.filter(city => city.difficulty === difficulty);
}

// Helper function to get random city by difficulty
export function getRandomCityByDifficulty(difficulty: number): City {
  const filteredCities = getCitiesByDifficulty(difficulty);
  if (filteredCities.length === 0) {
    // Fallback to difficulty 1 if no cities found
    const easyCities = getCitiesByDifficulty(1);
    return easyCities[Math.floor(Math.random() * easyCities.length)];
  }
  return filteredCities[Math.floor(Math.random() * filteredCities.length)];
}
