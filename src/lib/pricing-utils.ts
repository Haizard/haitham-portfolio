import { differenceInMonths, differenceInCalendarDays, addMonths, startOfDay } from 'date-fns';

export type PricingUnit = 'nightly' | 'monthly';

export interface PriceCalculationResult {
    totalPrice: number;
    breakdown: {
        unit: PricingUnit;
        unitsCount: number; // e.g., 5 nights or 2.5 months
        unitPrice: number;
        subtotal: number;
        description: string;
    };
}

/**
 * Calculates the total booking price based on start/end dates and pricing unit.
 * 
 * Logic:
 * - Nightly: Exact count of nights * price.
 * - Monthly: 
 *      1. Calculate full months between start and end.
 *      2. Calculate remaining days.
 *      3. Total = (Full Months * Price) + (Remaining Days * (Price / 30)).
 *      This assumes a standard 30-day pro-ration for partial months, which is common in rentals.
 */
export function calculateBookingPrice(
    start: Date,
    end: Date,
    price: number,
    unit: PricingUnit
): PriceCalculationResult {
    const startDate = startOfDay(start);
    const endDate = startOfDay(end);

    if (endDate <= startDate) {
        return {
            totalPrice: 0,
            breakdown: {
                unit,
                unitsCount: 0,
                unitPrice: price,
                subtotal: 0,
                description: 'Invalid dates',
            },
        };
    }

    if (unit === 'nightly') {
        const nights = differenceInCalendarDays(endDate, startDate);
        const total = nights * price;
        return {
            totalPrice: total,
            breakdown: {
                unit: 'nightly',
                unitsCount: nights,
                unitPrice: price,
                subtotal: total,
                description: `${nights} night${nights !== 1 ? 's' : ''}`,
            },
        };
    } else {
        // Monthly Calculation
        const fullMonths = differenceInMonths(endDate, startDate);
        const dateAfterFullMonths = addMonths(startDate, fullMonths);
        const remainingDays = differenceInCalendarDays(endDate, dateAfterFullMonths);

        // Pro-ration logic: 1 day = 1/30th of a month
        const partialMonth = remainingDays / 30;
        const totalMonths = fullMonths + partialMonth;

        // Round to 2 decimal places for currency
        const total = Math.round((totalMonths * price) * 100) / 100;

        let description = `${fullMonths} month${fullMonths !== 1 ? 's' : ''}`;
        if (remainingDays > 0) {
            description += ` + ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
        }

        return {
            totalPrice: total,
            breakdown: {
                unit: 'monthly',
                unitsCount: Number(totalMonths.toFixed(2)),
                unitPrice: price,
                subtotal: total,
                description,
            },
        };
    }
}
