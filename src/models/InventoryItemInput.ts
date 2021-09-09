export class InventoryItemInput {
    public inventoryItemName: string = "";
    public itemTypeId: number = 0;
    public price: number | null = null;

    public constructor(init?: Partial<InventoryItemInput>) {
        Object.assign(this, init);
    }
}
