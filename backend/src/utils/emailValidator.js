import dns from 'dns';

// Blacklist of known throwaway / temporary / disposable email providers
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'yopmail.com',
  'trashmail.com',
  'throwawaymail.com',
  'fakeinbox.com',
  'dispostable.com',
  'getairmail.com',
  'maildrop.cc',
  'mytemp.email',
  'fakemailgenerator.com',
  'generator.email',
  'crazymailing.com',
  'tempail.com',
  'burnermail.io',
]);

export const RESERVED_SUBDOMAINS = new Set([
  'api',
  'app',
  'admin',
  'superadmin',
  'auth',
  'login',
  'dashboard',
  'mail',
  'billing',
  'support',
  'test',
  'demo',
  'staging',
  'dev',
  'portal',
  'root',
  'help',
  'docs',
  'status',
  'cdn',
  'static',
  'assets',
  'ws',
  'graphql',
  'system',
  'null',
  'undefined',
  'www',
]);

/**
 * Validates basic email syntax
 */
export function validateEmailFormat(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * Checks if domain is in disposable email blocklist
 */
export function isDisposableEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

/**
 * Verifies if the email domain has valid MX (Mail Exchange) records using DNS lookup.
 * Includes a safety timeout to prevent hanging on slow network DNS responses.
 */
export async function verifyEmailDomainMX(email) {
  if (!validateEmailFormat(email)) {
    return { valid: false, reason: 'Invalid email format.' };
  }

  if (isDisposableEmail(email)) {
    return { valid: false, reason: 'Disposable or temporary email addresses are not permitted.' };
  }

  const domain = email.trim().toLowerCase().split('@')[1];

  try {
    const mxRecords = await Promise.race([
      dns.promises.resolveMx(domain),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DNS query timeout')), 3500)
      ),
    ]);

    if (!mxRecords || mxRecords.length === 0) {
      return {
        valid: false,
        reason: `The domain "${domain}" has no active mail exchange (MX) servers configured to receive emails.`,
      };
    }

    return { valid: true };
  } catch (error) {
    // If it's a domain that doesn't exist or has no DNS records
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA' || error.code === 'SERVFAIL') {
      return {
        valid: false,
        reason: `The email domain "${domain}" does not exist or cannot receive mail.`,
      };
    }

    // In case of timeout or local DNS resolution glitch in development/offline mode,
    // allow standard well-known domains (gmail, yahoo, outlook, hotmail, icloud, proton, etc.) or log warning
    const wellKnownDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'live.com',
      'icloud.com',
      'proton.me',
      'protonmail.com',
      'nust.edu.pk',
      'lums.edu.pk',
      'giki.edu.pk',
      'fast.nu.edu.pk',
    ];

    if (wellKnownDomains.includes(domain)) {
      return { valid: true };
    }

    // If DNS check timed out or errored unexpectedly, don't hard-fail if syntax is valid, but log
    console.warn(`[MX Check Warning] DNS MX resolution for domain "${domain}" encountered: ${error.message}`);
    return { valid: true };
  }
}

/**
 * Validates subdomain format and checks against reserved keywords
 */
export function validateSubdomain(subdomain) {
  if (!subdomain || typeof subdomain !== 'string') {
    return { valid: false, reason: 'Subdomain is required.' };
  }

  const slug = subdomain.trim().toLowerCase();

  if (slug.length < 3 || slug.length > 30) {
    return { valid: false, reason: 'Subdomain must be between 3 and 30 characters long.' };
  }

  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
    return {
      valid: false,
      reason: 'Subdomain can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.',
    };
  }

  if (RESERVED_SUBDOMAINS.has(slug)) {
    return { valid: false, reason: `The subdomain "${slug}" is reserved for platform operations.` };
  }

  return { valid: true, sanitized: slug };
}
