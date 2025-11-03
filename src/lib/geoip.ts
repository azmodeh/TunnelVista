export async function getGeoDataForIp(ip: string): Promise<{ location: string; country_code: string }> {
  // This is a mock function. In a real app, this would call a Geo-IP service API.
  await new Promise(resolve => setTimeout(resolve, 50));
  
  if (ip.startsWith('185.88')) return { location: 'Tehran, Iran', country_code: 'IR' };
  if (ip.startsWith('89.42.199.157')) return { location: 'Tehran, Iran', country_code: 'IR' };
  if (ip.startsWith('5.44')) return { location: 'Frankfurt, Germany', country_code: 'DE' };
  if (ip.startsWith('64.227')) return { location: 'New York, USA', country_code: 'US' };
  if (ip.startsWith('139.59')) return { location: 'Singapore', country_code: 'SG' };
  if (ip.startsWith('178.62')) return { location: 'London, UK', country_code: 'GB' };
  
  return {
      location: 'Unknown',
      country_code: ''
  };
}