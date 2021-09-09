export class ItemType {
    public itemTypeId: number = 0;
    public itemTypeName: string = "";
    public hasBasicSalesTax: boolean = false;
    public isImported: boolean = false;

    public constructor(init?: Partial<ItemType>) {
        Object.assign(this, init);
    }
}
