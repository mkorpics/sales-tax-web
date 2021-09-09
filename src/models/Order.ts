import { PurchaseItem } from "./PurchaseItem";

export class Order {
    public orderId: number = 0;
    public orderNumber: string = "";
    public orderDate: Date | null = null;
    public items: PurchaseItem[] = [];
    public totalSalesTax: number | null = null;
    public orderTotal: number | null = null;

    public constructor(init?: Partial<Order>) {
        Object.assign(this, init);

        this.items = this.items ? this.items.map((x: PurchaseItem) => new PurchaseItem(x)) : this.items;
    }
}
