/* Fill these in from Supabase → Project Settings → Data API.
 *
 * Both values are meant to be public. The anon key is not a password: it only
 * lets the browser ask, and the access rules in schema.sql decide what comes
 * back. The key that must never appear here is the service_role one.
 */
window.FALLOUT_PORTAL_CONFIG = {
  supabaseUrl: "PASTE_PROJECT_URL_HERE",
  supabaseAnonKey: "PASTE_ANON_PUBLIC_KEY_HERE",

  // Prefilled into the WhatsApp message that carries a ticket to its buyer.
  brandName: "FALLØUT India",
};
