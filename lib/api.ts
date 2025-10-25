// API utilities for backend communication

const API_BASE = "/api"

export async function uploadPhoto(objectId: string, file: File) {
  const formData = new FormData()
  formData.append("photo", file)
  formData.append("objectId", objectId)

  const response = await fetch(`${API_BASE}/objects/${objectId}/photos`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to upload photo" }))
    throw new Error(error.error || "Failed to upload photo")
  }

  return response.json()
}

export async function deletePhoto(objectId: string, photoPath: string) {
  const response = await fetch(`${API_BASE}/objects/${objectId}/photos`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ photoPath }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to delete photo" }))
    throw new Error(error.error || "Failed to delete photo")
  }

  return response.json()
}

export async function deleteObject(objectId: string) {
  const response = await fetch(`${API_BASE}/objects/${objectId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to delete object" }))
    throw new Error(error.error || "Failed to delete object")
  }

  return response.json()
}

export async function deleteClient(clientId: string) {
  const response = await fetch(`${API_BASE}/clients/${clientId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to delete client" }))
    throw new Error(error.error || "Failed to delete client")
  }

  return response.json()
}

export async function createShowing(objectId: string, showing: { date: string; time: string; notes?: string }) {
  const response = await fetch(`${API_BASE}/objects/${objectId}/showings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(showing),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create showing" }))
    throw new Error(error.error || "Failed to create showing")
  }

  return response.json()
}

export async function updateShowing(
  objectId: string,
  showingId: string,
  showing: { date: string; time: string; notes?: string },
) {
  const response = await fetch(`${API_BASE}/objects/${objectId}/showings/${showingId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(showing),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to update showing" }))
    throw new Error(error.error || "Failed to update showing")
  }

  return response.json()
}

export async function deleteShowing(objectId: string, showingId: string) {
  const response = await fetch(`${API_BASE}/objects/${objectId}/showings/${showingId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to delete showing" }))
    throw new Error(error.error || "Failed to delete showing")
  }

  return response.json()
}
