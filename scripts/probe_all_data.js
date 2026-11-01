const url = 'https://script.google.com/macros/s/AKfycbwCdp1wYyZIRpiFxluEaRyVBpMt1EIQJlZj4QDfSHRoSyuW_ySk0ou-0xEXsEjpuoNAeA/exec';

async function test() {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'getAllData' })
  });
  const data = await res.json();
  console.log('Total records in getAllData:', data.totalRecords);
  for (const [k, v] of Object.entries(data.data || {})) {
    console.log(`- ${k}: ${(v || []).length} records`);
  }
}
test();
