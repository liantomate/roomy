import { SETTINGS_THEME } from "../core/features/storage/localStorageKeys";
import LocalStorageManager from "../core/features/storage/localStorageManager";

type ThemeValues = "system" | "light" | "dark";

class SettingsApp {
	private static instance: SettingsApp | null = null;

	private readonly DEFAULT_THEME: ThemeValues = "system";

	private localStorage: LocalStorageManager;

	private constructor() {
		this.localStorage = new LocalStorageManager();

		this.generateDefaults();
	}

	public static getInstance(): SettingsApp {
		return (SettingsApp.instance ??= new SettingsApp());
	}

	private generateDefaults() {
		if (!this.localStorage.has(SETTINGS_THEME))
			this.localStorage.set(SETTINGS_THEME, this.DEFAULT_THEME);
	}

	public getTheme(): ThemeValues {
		return (
			this.localStorage.get<ThemeValues>(SETTINGS_THEME) ??
			this.DEFAULT_THEME
		);
	}

	public setTheme(theme: ThemeValues) {
		this.localStorage.set(SETTINGS_THEME, theme);
	}
}

export default SettingsApp.getInstance();
