import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	StringSelectMenuInteraction,
	type ButtonInteraction,
} from "discord.js";
import type { IInventories, IItem } from "~/schemas/inventories";
import { getInventory } from "~/db";

export const createInventoryItemEmbed = (item: IInventories) => {
	const embed = new EmbedBuilder()
		.setTitle(item.details.name)
		.setDescription(item.details.description)
		.addFields({ name: "Rarity", value: item.details.rarity, inline: true })
		.setColor("#FFD700")
		.setTimestamp();

	return embed;
};

export const createInventoryItemNotExistEmbed = () => {
	const embed = new EmbedBuilder()
		.setTitle("Item not found!")
		.setDescription("The item you are trying to select does not exist.")
		.setColor("#FF0000")
		.setTimestamp();

	return embed;
};

export const createInventoryItemNotExistActionRow = () => {
	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("inventory")
			.setLabel("Back")
			.setStyle(ButtonStyle.Secondary),
	);

	return actionRow;
};

export const createInventoryItemActionRow = (item: IInventories) => {
	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("equip_item")
			.setLabel("Equip")
			.setDisabled(item.equipped === 1)
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId("unequip_item")
			.setLabel("Unequip")
			.setDisabled(item.equipped === 0)
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId("inventory")
			.setLabel("Back")
			.setStyle(ButtonStyle.Secondary),
	);

	return actionRow;
};

export const handleInventoryItemInteraction = async (
	interaction: StringSelectMenuInteraction | ButtonInteraction,
	selectedItem?: IItem,
) => {
	const inventory = await getInventory(interaction.user.id);
	const item =
		interaction instanceof StringSelectMenuInteraction
			? inventory.find((i) => i.id === Number(interaction.values[0]))
			: inventory.find((i) => i.id === selectedItem?.id);
	if (!item) {
		await interaction.editReply({
			embeds: [createInventoryItemNotExistEmbed()],
			components: [createInventoryItemNotExistActionRow()],
		});
	} else {
		await interaction.editReply({
			embeds: [createInventoryItemEmbed(item)],
			components: [createInventoryItemActionRow(item)],
		});
	}

	return item?.details;
};
