export function validatePropertyForm(formData: {
  id: string
  address: string
  price: string
  area: string
  status: string
  owner: string
  ownerPhone: string
}): { valid: boolean; error?: string } {
  if (!formData.id?.trim()) {
    return { valid: false, error: "ID объекта обязателен" }
  }

  if (!formData.address?.trim()) {
    return { valid: false, error: "Адрес обязателен" }
  }

  if (!formData.price?.trim() || Number(formData.price) <= 0) {
    return { valid: false, error: "Цена должна быть больше 0" }
  }

  if (!formData.area?.trim() || Number(formData.area) <= 0) {
    return { valid: false, error: "Площадь должна быть больше 0" }
  }

  return { valid: true }
}

export function validateShowingForm(formData: {
  objectId: string
  date: string
  time: string
}): { valid: boolean; error?: string } {
  if (!formData.objectId?.trim()) {
    return { valid: false, error: "Выберите объект" }
  }

  if (!formData.date?.trim()) {
    return { valid: false, error: "Выберите дату" }
  }

  if (!formData.time?.trim()) {
    return { valid: false, error: "Выберите время" }
  }

  return { valid: true }
}
