/**
 * Gerador de payload PIX (EMV QR Code estático)
 * Especificação BACEN: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/III_ManualdePadroesparainiciacao.pdf
 */

function emvField(id: string, value: string): string {
  const len = String(value.length).padStart(2, "0")
  return `${id}${len}${value}`
}

function crc16(data: string): string {
  let crc = 0xffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc <<= 1
      }
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0")
}

export interface PixPayloadOptions {
  pixKey: string
  recipientName: string
  city: string
  amount?: number
  description?: string
}

export function buildPixPayload(options: PixPayloadOptions): string {
  const { pixKey, recipientName, city, amount, description } = options

  // 00 - Payload Format Indicator
  const payloadFormatIndicator = emvField("00", "01")

  // 26 - Merchant Account Info (PIX)
  const gui = emvField("00", "br.gov.bcb.pix")
  const key = emvField("01", pixKey)
  const txDesc = description ? emvField("02", description.slice(0, 72)) : ""
  const merchantAccountInfo = emvField("26", gui + key + txDesc)

  // 52 - Merchant Category Code
  const mcc = emvField("52", "0000")

  // 53 - Transaction Currency (BRL = 986)
  const currency = emvField("53", "986")

  // 54 - Transaction Amount (optional)
  const amountField =
    amount && amount > 0 ? emvField("54", amount.toFixed(2)) : ""

  // 58 - Country Code
  const countryCode = emvField("58", "BR")

  // 59 - Merchant Name (max 25 chars)
  const merchantName = emvField(
    "59",
    recipientName.slice(0, 25).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  )

  // 60 - Merchant City (max 15 chars)
  const merchantCity = emvField(
    "60",
    city.slice(0, 15).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  )

  // 62 - Additional Data Field (ReferenceLabel)
  const referenceLabel = emvField("05", "***")
  const additionalData = emvField("62", referenceLabel)

  // 63 - CRC16 (calculado sobre tudo + "6304")
  const payload =
    payloadFormatIndicator +
    merchantAccountInfo +
    mcc +
    currency +
    amountField +
    countryCode +
    merchantName +
    merchantCity +
    additionalData +
    "6304"

  return payload + crc16(payload)
}
