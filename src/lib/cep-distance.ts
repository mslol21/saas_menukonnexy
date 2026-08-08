import { DistanceDeliveryConfig, DeliveryCalculationResult } from '@/types';

/**
 * Clean CEP string (remove non-digits)
 */
export function cleanCep(cep: string): string {
  return cep ? cep.replace(/\D/g, '') : '';
}

/**
 * Format CEP string to 00000-000 format
 */
export function formatCep(cep: string): string {
  const cleaned = cleanCep(cep);
  if (cleaned.length !== 8) return cep;
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Calculate straight-line distance in km between two lat/lon points using the Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
}

export interface ViaCepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

/**
 * Fetch address details from ViaCEP API
 */
export async function fetchViaCep(cep: string): Promise<ViaCepData | null> {
  const cleaned = cleanCep(cep);
  if (cleaned.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return data;
  } catch (err) {
    console.error('Error fetching ViaCEP:', err);
    return null;
  }
}

/**
 * Fetch lat/lon coordinates from OpenStreetMap Nominatim for a given CEP / Address in Brazil
 */
export async function fetchCepCoordinates(
  cep: string,
  city?: string,
  state?: string,
  street?: string
): Promise<{ lat: number; lon: number } | null> {
  const cleaned = cleanCep(cep);

  try {
    // 1. Try search by postal code in Brazil
    if (cleaned.length === 8) {
      const url = `https://nominatim.openstreetmap.org/search?postalcode=${cleaned}&country=Brazil&format=json&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'KonnexySaasMenu/1.0' } });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0 && data[0].lat && data[0].lon) {
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
      }
    }

    // 2. Fallback: search by street, city, state in Brazil
    if (city && state) {
      const queryStr = `${street ? `${street}, ` : ''}${city} - ${state}, Brazil`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryStr)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'KonnexySaasMenu/1.0' } });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0 && data[0].lat && data[0].lon) {
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
      }
    }
  } catch (err) {
    console.error('Error fetching Nominatim coordinates:', err);
  }

  return null;
}

/**
 * Calculate distance-based delivery fee between store CEP and customer CEP
 */
export async function calculateDeliveryFeeByCep(
  storeCep: string,
  customerCep: string,
  config: DistanceDeliveryConfig
): Promise<DeliveryCalculationResult> {
  const cleanStore = cleanCep(storeCep);
  const cleanCustomer = cleanCep(customerCep);

  if (cleanCustomer.length !== 8) {
    return {
      success: false,
      error_message: 'CEP de entrega inválido. Digite 8 números.',
    };
  }

  if (cleanStore.length !== 8) {
    return {
      success: false,
      error_message: 'CEP do estabelecimento não configurado no Admin.',
    };
  }

  // 1. Fetch customer ViaCEP data
  const customerViaCep = await fetchViaCep(cleanCustomer);
  if (!customerViaCep) {
    return {
      success: false,
      error_message: 'CEP de entrega não encontrado. Verifique o número digitado.',
    };
  }

  // 2. Fetch store ViaCEP data
  const storeViaCep = await fetchViaCep(cleanStore);

  // 3. Fetch coordinates for store and customer
  const storeCoords = await fetchCepCoordinates(
    cleanStore,
    storeViaCep?.localidade,
    storeViaCep?.uf,
    storeViaCep?.logradouro
  );
  const customerCoords = await fetchCepCoordinates(
    cleanCustomer,
    customerViaCep.localidade,
    customerViaCep.uf,
    customerViaCep.logradouro
  );

  const address = {
    street: customerViaCep.logradouro || '',
    neighborhood: customerViaCep.bairro || '',
    city: customerViaCep.localidade || '',
    state: customerViaCep.uf || '',
  };

  // If coordinates couldn't be resolved
  if (!storeCoords || !customerCoords) {
    // Fallback fee calculation based on city match
    if (storeViaCep && customerViaCep.localidade !== storeViaCep.localidade) {
      return {
        success: false,
        error_message: `A entrega está disponível apenas na cidade de ${storeViaCep.localidade}.`,
        address,
      };
    }

    // Default base fee fallback when GPS coords are unavailable
    return {
      success: true,
      distance_km: 3.0,
      fee: config.base_fee,
      address,
    };
  }

  // 4. Calculate Haversine distance
  const distanceKm = calculateHaversineDistance(
    storeCoords.lat,
    storeCoords.lon,
    customerCoords.lat,
    customerCoords.lon
  );

  // 5. Max distance check
  if (config.max_distance_km > 0 && distanceKm > config.max_distance_km) {
    return {
      success: false,
      error_message: `O endereço está a ${distanceKm.toFixed(1)} km, que excede a distância máxima de entrega (${config.max_distance_km} km).`,
      distance_km: distanceKm,
      address,
    };
  }

  // 6. Calculate fee
  let fee = config.base_fee;
  if (distanceKm > config.base_distance_km) {
    const extraKm = distanceKm - config.base_distance_km;
    fee += extraKm * config.price_per_km;
  }

  // Round to 2 decimal places
  fee = Math.round(fee * 100) / 100;

  return {
    success: true,
    distance_km: distanceKm,
    fee,
    address,
  };
}
