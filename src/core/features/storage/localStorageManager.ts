/**
 * Handles local data persistence through localStorage
 */
class LocalStorageManager {
	/**
	 * Reads the value of the stored data with the given key
	 *
	 * @param key key to the value data
	 * @returns data (T) if the key is valid and there's no error reading the value, null otherwise
	 */
	public get<T>(key: string): T | null {
		try {
			const value = localStorage.getItem(key);

			if (!value) return null;

			return JSON.parse(value) as T;
		} catch (err: unknown) {
			return null;
		}
	}

	/**
	 * Checks if a data with the given key exists in local storage
	 *
	 * @param key key to the value data
	 * @returns true if the data exists, false otherwise
	 */
	public has(key: string): boolean {
		return this.get(key) !== null;
	}

	/**
	 * Sets a data with the given key to the given value
	 *
	 * @param key key to the value data
	 * @param value value data
	 */
	public set<T>(key: string, value: T) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (err: unknown) {}
	}

	/**
	 * Removes an item from local storage
	 *
	 * @param key key to the value data
	 */
	public remove(key: string) {
		localStorage.removeItem(key);
	}
}

export default LocalStorageManager;
