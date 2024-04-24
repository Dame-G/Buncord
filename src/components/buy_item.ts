import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ButtonInteraction,
} from "discord.js";
import type { IItem } from "~/schemas/user_items";
import { addItemToInventory, db, getUser, items } from "~/db";
import { shop_items } from "./shop";
import { users } from "~/schemas/users";
import { eq } from "drizzle-orm";
import { user_stats } from "~/schemas/user_stats";
import { createMainMenuActionRow } from "./main_menu";

export const createBuyItemEmbed = (item: IItem) => {
	const embed = new EmbedBuilder()
		.setTitle(item.name)
		.setDescription(item.description)
		.addFields({
			name: "Congratulations",
			value: `You have received a ${item.name}!`,
			inline: true,
		})
		.setColor("#FFD700")
		.setTimestamp();

	return embed;
};

export const createNotEnoughGoldEmbed = () => {
	const embed = new EmbedBuilder()
		.setTitle("Not enough gold!")
		.setDescription("You do not have enough gold to purchase this item.")
		.setColor("#FF0000")
		.setTimestamp();

	return embed;
};

export const createBuyItemNotExistEmbed = () => {
	const embed = new EmbedBuilder()
		.setTitle("Item not found!")
		.setDescription("The item you are trying to buy does not exist.")
		.setColor("#FF0000")
		.setTimestamp();

	return embed;
};

export const createNotEnoughGoldActionRow = () => {
	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("shop")
			.setLabel("Back")
			.setStyle(ButtonStyle.Secondary),
	);

	return actionRow;
};

export const createBuyItemNotExistActionRow = () => {
	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("shop")
			.setLabel("Back")
			.setStyle(ButtonStyle.Secondary),
	);

	return actionRow;
};

export const createBuyItemActionRow = () => {
	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("shop")
			.setLabel("Back")
			.setStyle(ButtonStyle.Secondary),
	);

	return actionRow;
};

export const handleBuyItemInteraction = async (
	interaction: ButtonInteraction,
	item?: IItem,
) => {
	await interaction.deferUpdate();
	if (!item) {
		await interaction.editReply({
			embeds: [createBuyItemNotExistEmbed()],
			components: [createBuyItemNotExistActionRow()],
		});
	} else {
		const { user, stats } = await getUser(interaction.user.id);
		const gold = stats.gold;
		const price =
			shop_items.find((shopItem) => shopItem.id === item.id)?.price || 0;
		if (gold < price) {
			await interaction.editReply({
				embeds: [createNotEnoughGoldEmbed()],
				components: [
					createNotEnoughGoldActionRow(),
					createMainMenuActionRow("shop"),
				],
			});
		} else {
			await db
				.update(user_stats)
				.set({ gold: gold - price })
				.where(eq(users.id, user.id));
			const newItem = await addItemToInventory(user.id, item.id);
			await interaction.editReply({
				embeds: [createBuyItemEmbed(item)],
				components: [createBuyItemActionRow(), createMainMenuActionRow("shop")],
			});

			return items.find((item) => item.id === newItem?.itemId);
		}
	}
};
