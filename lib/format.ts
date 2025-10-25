export function formatPrice(price: number): string {
  if (price >= 1000000) {
    const millions = price / 1000000
    return `${millions.toFixed(1)} млн`
  }
  return price.toLocaleString("ru-RU")
}

export function formatPriceDetailed(price: number): string {
  return price.toLocaleString("ru-RU")
}

export function formatNumber(num: number): string {
  return num.toLocaleString("ru-RU")
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "")

  // Check if it's a Ukrainian number
  if (cleaned.startsWith("+380") && cleaned.length === 13) {
    // Format: +380 (XX) XXX-XX-XX
    return `+380 (${cleaned.slice(4, 6)}) ${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}-${cleaned.slice(11, 13)}`
  } else if (cleaned.startsWith("380") && cleaned.length === 12) {
    // Format: +380 (XX) XXX-XX-XX
    return `+380 (${cleaned.slice(3, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10, 12)}`
  } else if (cleaned.startsWith("0") && cleaned.length === 10) {
    // Format: +380 (XX) XXX-XX-XX
    return `+380 (${cleaned.slice(1, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`
  }

  // Return original if format doesn't match
  return phone
}
