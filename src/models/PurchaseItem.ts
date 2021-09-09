import { InventoryItem } from "./InventoryItem";

export class PurchaseItem {
    public purchaseItemId: number = 0;
    public inventoryItemId: number = 0;
    public quantity: number = 0;
    public totalPrice: number | null = null;

    public inventoryItem: InventoryItem | null = null;

    public constructor(init?: Partial<PurchaseItem>) {
        Object.assign(this, init);

        this.inventoryItem = this.inventoryItem ? new InventoryItem(this.inventoryItem) : this.inventoryItem;
    }
}
