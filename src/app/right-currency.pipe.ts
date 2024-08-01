import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rightCurrency',
  standalone: true,
})
export class RightCurrencyPipe implements PipeTransform {
  transform(
    value: number,
    currencyCode: string = 'MAD',
    digitsInfo: string = '1.2-2'
  ): string {
    if (value == null) return '';
    // Format the number
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    // Append the currency code to the right
    return `${formattedNumber} ${currencyCode}`;
  }
}
