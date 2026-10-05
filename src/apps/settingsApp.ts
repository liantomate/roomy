import { SETTINGS_THEME } from "../core/features/storage/localStorageKeys";
import LocalStorageManager from "../core/features/storage/localStorageManager";
import type { ThemeValues } from "../types/settingsTypes";

/**
 * Handles settings-related local storage management
 */
class SettingsApp {
	private static instance: SettingsApp | null = null;

	private readonly DEFAULT_THEME: ThemeValues = "system";

	private localStorage: LocalStorageManager;

	private constructor() {
		this.localStorage = new LocalStorageManager();

		this.generateDefaults();
	}

	/**
	 * @returns singleton instance of {@linkcode SettingsApp}
	 */
	public static getInstance(): SettingsApp {
		return (SettingsApp.instance ??= new SettingsApp());
	}

	/**
	 * Generates default values for expected setting data
	 */
	private generateDefaults() {
		if (!this.localStorage.has(SETTINGS_THEME))
			this.localStorage.set(SETTINGS_THEME, this.DEFAULT_THEME);
	}

	/**
	 * @returns theme {@linkcode ThemeValues} stored locally
	 */
	public getTheme(): ThemeValues {
		return (
			this.localStorage.get<ThemeValues>(SETTINGS_THEME) ??
			this.DEFAULT_THEME
		);
	}

	/**
	 * Sets the local site theme to the given theme
	 *
	 * @param theme new theme {@linkcode ThemeValues} to set
	 */
	public setTheme(theme: ThemeValues) {
		this.localStorage.set(SETTINGS_THEME, theme);
	}
}

export default SettingsApp.getInstance();
