export class ItemInput {
    public itemName: string = "";
    public itemTypeId: number = 0;
    public price: number | null = null;

    public constructor(init?: Partial<ItemInput>) {
        Object.assign(this, init);
    }
}
