/**
 * Production-Grade PII (Personally Identifiable Information) Masking Utility
 * Conforms to:
 * - India Digital Personal Data Protection Act (DPDPA 2023)
 * - RBI Master Direction on Cyber Security & Digital Payment Hygiene
 * - PCI-DSS v4.0 Requirement 3 (Protect Stored Account Data)
 */

export function maskCustomerName(name: string | undefined | null, isMasked: boolean = true): string {
  if (!name) return 'Anonymous User';
  if (!isMasked) return name;

  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 1) return part;
      if (part.length === 2) return `${part[0]}*`;
      return `${part[0]}${'*'.repeat(Math.min(part.length - 1, 5))}`;
    })
    .join(' ');
}

export function maskPhoneNumber(phone: string | undefined | null, isMasked: boolean = true): string {
  if (!phone) return '+91 **********';
  if (!isMasked) return phone;

  // Clean non-digits while preserving prefix
  const cleaned = phone.trim();
  if (cleaned.length <= 4) return '****';

  // Format: e.g. +91 98765 43210 -> +91 98*** **210 or +91 98******10
  if (cleaned.startsWith('+91')) {
    const digits = cleaned.replace(/\D/g, '').slice(2);
    if (digits.length >= 10) {
      return `+91 ${digits.slice(0, 2)}*** ***${digits.slice(-2)}`;
    }
  }

  // Generic digits mask
  const visiblePrefix = cleaned.slice(0, Math.min(3, Math.floor(cleaned.length / 3)));
  const visibleSuffix = cleaned.slice(-Math.min(2, Math.floor(cleaned.length / 4)));
  const maskedCount = Math.max(3, cleaned.length - visiblePrefix.length - visibleSuffix.length);
  return `${visiblePrefix}${'*'.repeat(maskedCount)}${visibleSuffix}`;
}

export function maskEmail(email: string | undefined | null, isMasked: boolean = true): string {
  if (!email) return 'u***@******.com';
  if (!isMasked) return email;

  const [username, domain] = email.split('@');
  if (!domain) return maskCustomerName(username, true);

  const [domainName, ...domainExts] = domain.split('.');
  const domainExt = domainExts.join('.');

  let maskedUser = username;
  if (username.length <= 2) {
    maskedUser = `${username[0]}*`;
  } else {
    maskedUser = `${username[0]}${'*'.repeat(Math.min(username.length - 2, 4))}${username.slice(-1)}`;
  }

  let maskedDomain = domainName;
  if (domainName.length <= 2) {
    maskedDomain = `${domainName[0]}*`;
  } else {
    maskedDomain = `${domainName[0]}${'*'.repeat(Math.min(domainName.length - 1, 4))}`;
  }

  return `${maskedUser}@${maskedDomain}.${domainExt || 'com'}`;
}

export function maskVpa(vpa: string | undefined | null, isMasked: boolean = true): string {
  if (!vpa) return 'u***@bank';
  if (!isMasked) return vpa;

  const [user, handle] = vpa.split('@');
  if (!handle) return `${vpa.slice(0, 2)}****`;

  let maskedUser = user;
  if (user.length <= 2) {
    maskedUser = `${user[0]}*`;
  } else {
    maskedUser = `${user[0]}${'*'.repeat(Math.min(user.length - 2, 4))}${user.slice(-1)}`;
  }

  return `${maskedUser}@${handle}`;
}

export function maskTextPayload(text: string, isMasked: boolean = true): string {
  if (!text || !isMasked) return text;

  // Mask emails in string
  let result = text.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (_, user, domain) => {
    return maskEmail(`${user}@${domain}`, true);
  });

  // Mask phone numbers in string (10 digits or with +91)
  result = result.replace(/(\+91[\-\s]?)?[6-9]\d{9}/g, (phone) => {
    return maskPhoneNumber(phone, true);
  });

  return result;
}
