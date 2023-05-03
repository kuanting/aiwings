/**
 * Get user's current geolocation
 * @returns {Promise<[number,number]}
 */
export const getUserCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve([coords.longitude, coords.latitude])
      },
      (err) => {
        reject(err.message)
      },
      { enableHighAccuracy: true }
    )
  })
}
