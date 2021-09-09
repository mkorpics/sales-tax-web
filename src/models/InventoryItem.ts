import { InventoryItemInput } from "./InventoryItemInput";
import { ItemType } from "./ItemType";

export class InventoryItem {
    public inventoryItemId: number = 0;
    public inventoryItemName: string = "";
    public itemTypeId: number = 0;
    public price: number | null = null;
    public salesTax: number | null = null;
    public totalPrice: number | null = null;
    public canDelete: boolean = true;

    public itemType: ItemType | null = null;

    public constructor(init?: Partial<InventoryItem>) {
        Object.assign(this, init);

        this.itemType = this.itemType ? new ItemType(this.itemType) : this.itemType;
    }

    public toInventoryItemInput(): InventoryItemInput {
        return new InventoryItemInput({
            inventoryItemName: this.inventoryItemName,
            itemTypeId: this.itemTypeId,
            price: this.price,
        });
    }
}
