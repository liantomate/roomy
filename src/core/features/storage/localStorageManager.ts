class LocalStorageManager {
	public get<T>(key: string): T | null {
		const value = localStorage.getItem(key);

		if (!value) return null;

		return JSON.parse(value) as T;
	}

	public has(key: string): boolean {
		return this.get(key) !== null;
	}

	public set<T>(key: string, value: T) {
		localStorage.setItem(key, JSON.stringify(value));
	}

	public remove(key: string) {
		localStorage.removeItem(key);
	}
}

export default LocalStorageManager;
