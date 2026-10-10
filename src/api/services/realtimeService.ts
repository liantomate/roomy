import { RealtimeChannel } from "@supabase/supabase-js";
import supabase from "../transport/client";
import type { TableNames } from "../../types/database.types";
import {
	createAPIErrorResponse,
	createAPISuccessResponse,
	type APIResponse,
} from "../../types/api.types";

type ChannelListener<T> = (payload: T) => void;

/**
 * Handles subscription and unsubscription to a specific supabase channel
 */
class Channel<T> {
	private readonly onCreateFunc?: ChannelListener<T>;
	private readonly onUpdateFunc?: ChannelListener<T>;
	private readonly onDeleteFunc?: ChannelListener<T>;
	private readonly mapper?: (payload: any) => T;

	private channel?: RealtimeChannel;

	/**
	 * @param onCreate called when INSERT updates occur, undefined if not be used
	 * @param onUpdate called when UPDATE updates occur, undefined if not be used
	 * @param onDelete called when DELETE updates occur, undefined if not be used
	 */
	public constructor(
		onCreate?: ChannelListener<T>,
		onUpdate?: ChannelListener<T>,
		onDelete?: ChannelListener<T>,
		mapper?: (payload: any) => T,
	) {
		this.onCreateFunc = onCreate;
		this.onUpdateFunc = onUpdate;
		this.onDeleteFunc = onDelete;
		this.mapper = mapper;
	}

	/**
	 * Sets up a Supabase realtime channel connected to a specific table and subscribes to it
	 *
	 * @param channelName name of the table {@linkcode TableNames} to connect to
	 * @returns true if success, false otherwise
	 */
	public subscribe(channelName: TableNames): boolean {
		if (this.channel) return false;

		this.channel = supabase.channel(channelName);

		const onCreate = this.onCreateFunc;
		const onUpdate = this.onUpdateFunc;
		const onDelete = this.onDeleteFunc;

		try {
			if (onCreate)
				this.channel.on(
					"postgres_changes",
					{
						event: "INSERT",
						schema: "public",
						table: channelName,
					},
					(payload) => {
						onCreate(
							this.mapper
								? this.mapper(payload.new)
								: (payload as T),
						);
					},
				);

			if (onUpdate)
				this.channel.on(
					"postgres_changes",
					{
						event: "UPDATE",
						schema: "public",
						table: channelName,
					},
					(payload) => {
						onUpdate(
							this.mapper
								? this.mapper(payload.new)
								: (payload as T),
						);
					},
				);

			if (onDelete)
				this.channel.on(
					"postgres_changes",
					{
						event: "DELETE",
						schema: "public",
						table: channelName,
					},
					(payload) => {
						onDelete(
							this.mapper
								? this.mapper(payload.old)
								: (payload as T),
						);
					},
				);

			this.channel.subscribe((status, error) => {
				console.log(`Subscription status of ${channelName}: `, status);
				if (error) console.error(error.message);
			});
			return true;
		} catch (err: unknown) {
			const errMessage =
				err instanceof Error
					? err.message
					: "An unknown subscription error occured";

			this.channel = undefined;
			console.error(`SUBSCRIPTION_ERROR ${channelName}: `, errMessage);
			return false;
		}
	}

	/**
	 * Unsubscribe to the active channel of this instance
	 *
	 * @returns true if success, false otherwise
	 */
	public async unsubscribe(): Promise<boolean> {
		if (!this.channel) return false;

		this.channel.unsubscribe();
		this.channel = undefined;
		return true;
	}
}

/**
 * Handles realtime connection with Supabase through {@linkcode Channel}
 */
class RealTimeService {
	private static channels: Record<string, Channel<any>> = {};

	/**
	 * Creates a new {@linkcode Channel} with listener functions and maps it to a table name.
	 * Set listener functions to undefined if they won't be used
	 *
	 * @param channelName name of the channel to connect to
	 * @param onCreate called when INSERT updates occur
	 * @param onUpdate called when UPDATE updates occur
	 * @param onDelete called when DELETE updates occur
	 * @returns api response {@linkcode APIResponse}
	 * @error GENERAL_ERROR if an existing channel is already registered
	 */
	public static registerChannel<T>(
		channelName: TableNames,
		onCreate?: ChannelListener<T>,
		onUpdate?: ChannelListener<T>,
		onDelete?: ChannelListener<T>,
		mapper?: (payload: any) => T,
	): APIResponse<null> {
		if (channelName in RealTimeService.channels)
			return createAPIErrorResponse(
				"A realtime channel for the given table is already registered",
			);

		RealTimeService.channels[channelName] = new Channel<T>(
			onCreate,
			onUpdate,
			onDelete,
			mapper,
		);

		return createAPISuccessResponse(
			"Successfully registered a new realtime channel",
			null,
		);
	}

	/**
	 * Subscribes a selected channel to Supabase realtime
	 *
	 * @param channelName name of the channel to connect to
	 * @returns api response {@linkcode APIResponse}
	 * @error GENERAL_ERROR if the channel isn't registered or channel is already subscribed
	 */
	public static startChannel(channelName: TableNames): APIResponse<null> {
		if (!(channelName in RealTimeService.channels))
			return createAPIErrorResponse(
				`No registered realtime channel with name: ${channelName}`,
			);

		const isSuccess =
			RealTimeService.channels[channelName].subscribe(channelName);
		if (isSuccess)
			return createAPISuccessResponse(
				`Successfully subscribed channel: ${channelName}`,
				null,
			);
		else
			return createAPIErrorResponse(
				`Unable to subscribe to the channel: ${channelName}`,
			);
	}

	/**
	 * Unsubscribes a selected channel from Supabase realtime
	 *
	 * @param channelName name of the channel to unsubscibe
	 * @returns api response {@linkcode APIResponse}
	 * @error GENERAL_ERROR if the channel isn't registered or channel is already unsubscribed
	 */
	public static async stopChannel(
		channelName: TableNames,
	): Promise<APIResponse<null>> {
		if (!(channelName in RealTimeService.channels))
			return createAPIErrorResponse(
				`No registered realtime channel with name: ${channelName}`,
			);

		const isSuccess =
			await RealTimeService.channels[channelName].unsubscribe();
		if (isSuccess) {
			delete RealTimeService.channels[channelName];

			return createAPISuccessResponse(
				`Successfully unsubscribed channel: ${channelName}`,
				null,
			);
		} else
			return createAPIErrorResponse(
				`Unable to unsubscribe to the channel: ${channelName}`,
			);
	}
}

export default RealTimeService;
