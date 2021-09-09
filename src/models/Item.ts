import { ItemInput } from "./ItemInput";
import { ItemType } from "./ItemType";

export class Item {
    public itemId: number = 0;
    public itemName: string = "";
    public itemTypeId: number = 0;
    public price: number | null = null;
    public salesTax: number | null = null;

    public itemType: ItemType | null = null;

    public get totalPrice(): number {
        return (this.price || 0) + (this.salesTax || 0);
    }

    public constructor(init?: Partial<Item>) {
        Object.assign(this, init);

        this.itemType = this.itemType ? new ItemType(this.itemType) : this.itemType;
    }

    public toItemInput(): ItemInput {
        return new ItemInput({
            itemName: this.itemName,
            itemTypeId: this.itemTypeId,
            price: this.price,
        });
    }
}
