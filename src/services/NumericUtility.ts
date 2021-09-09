export default class NumericUtility {

    public static formatAsCurrency(numberToFormat: number): string {
        const formatter: Intl.NumberFormat = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        return formatter.format(numberToFormat);
    }
}
