// Verification only. Configuring a publisher never loads ads or tracking code.
export function adsensePublisherId() {
  const value = process.env.ADSENSE_PUBLISHER_ID?.trim();
  if (!value) return undefined;
  if (!/^ca-pub-\d{16}$/.test(value)) {
    throw new Error("ADSENSE_PUBLISHER_ID must be the ca-pub- ID supplied by Google AdSense.");
  }
  return value;
}
