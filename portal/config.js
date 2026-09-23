/* Supabase project: fall0ut-tickets (South Asia, Mumbai).
 *
 * Both values below are meant to be public. The publishable key is not a
 * password: it only lets a browser ask, and the access rules in schema.sql
 * decide what comes back. Verified on setup: the public can read nothing from
 * the tickets table and cannot call redeem_ticket.
 *
 * Never put a secret key (sb_secret_... or service_role) in this file.
 */
window.FALLOUT_PORTAL_CONFIG = {
  supabaseUrl: "https://yugmmjaaeafjyxopzxpm.supabase.co",
  supabaseAnonKey: "sb_publishable_UlTFdhg8RYLHWhAkhdPv3A_wokW8S7D",

  // Prefilled into the WhatsApp message that carries a ticket to its buyer.
  brandName: "FALLØUT India",
};
