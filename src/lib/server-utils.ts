import WarrantyClaim from './models/WarrantyClaim';

export async function generateClaimCode(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const datePart = `${yy}${mm}${dd}`;
  const prefix = `GSC-${datePart}`;

  const lastClaim = await WarrantyClaim.findOne(
    { claimCode: { $regex: `^${prefix}` } },
    { claimCode: 1 },
    { sort: { claimCode: -1 } }
  );

  let seq = 1;
  if (lastClaim) {
    const parts = lastClaim.claimCode.split('-');
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}-${String(seq).padStart(5, '0')}`;
}
