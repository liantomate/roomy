class Application {
	private static instance: Application | null = null;

	private constructor() {}

	public static getInstance(): Application {
		return (Application.instance ??= new Application());
	}

	public start(): void {
		console.log("Hello, World!");
	}
}

const APP = Application.getInstance();
export default APP;
