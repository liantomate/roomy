import type { EventArgs } from "./eventMap";

type Listener<T> = (payload: T) => void;
class EventBus<Events extends EventArgs> {
	private listeners = new Map<
		keyof Events,
		Set<Listener<Events[keyof Events]>>
	>();

	on<K extends keyof Events>(
		event: K,
		listener: Listener<Events[K]>,
	): () => void {
		let eventListeners = this.listeners.get(event);

		if (!eventListeners) {
			eventListeners = new Set();
			this.listeners.set(event, eventListeners);
		}

		eventListeners.add(listener as Listener<Events[keyof Events]>);
		return () => this.off(event, listener);
	}

	off<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
		const eventListeners = this.listeners.get(event);

		if (!eventListeners) return;

		eventListeners.delete(listener as Listener<Events[keyof Events]>);

		if (eventListeners.size === 0) this.listeners.delete(event);
	}

	once<K extends keyof Events>(
		event: K,
		listener: Listener<Events[K]>,
	): () => void {
		const unsubscribe = this.on(event, (payload) => {
			unsubscribe();
			listener(payload);
		});

		return unsubscribe;
	}

	emit<K extends keyof Events>(event: K, payload: Events[K]) {
		const eventListeners = this.listeners.get(event);

		if (!eventListeners) return;

		for (const listener of [...eventListeners]) listener(payload);
	}

	clear<K extends keyof Events>(event: K | undefined = undefined): void {
		if (event === undefined) {
			this.listeners.clear();
			return;
		}

		this.listeners.delete(event);
	}

	listenerCount<K extends keyof Events>(event: K): number {
		return this.listeners.get(event)?.size ?? 0;
	}
}

export default EventBus;
